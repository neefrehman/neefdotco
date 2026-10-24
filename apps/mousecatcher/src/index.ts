import { Delaunay } from "d3-delaunay";
import { type Connection, routePartykitRequest, Server, type WSMessage } from "partyserver";

import {
  type CursorState,
  parseClientEvent,
  type ServerEvent,
  serializeServerEvent,
} from "@repo/mouse/presence";
import type { Vector } from "@repo/utils/math/types";
import { tryCatch } from "@repo/utils/tryCatch";

const MAX_CURSORS_SUPPORTED_IN_GRAPH = 512;

type Env = { Main: DurableObjectNamespace<MouseCatcher> };

export class MouseCatcher extends Server<Env> {
  // Hibernation empties out the delaunay graph, making our neighbor calculations impossible to do.
  static override options = { hibernate: false };

  private delaunay = new Delaunay(new Uint16Array(MAX_CURSORS_SUPPORTED_IN_GRAPH * 2));

  private idCursorMap = new Map<string, { index: number; state: CursorState }>();
  private indexIdMap = new Map<number, string>();

  private currentCursorIndex = -1;
  private availableCursorIndices = new Set<number>();
  private getNextIndex = () => {
    if (this.availableCursorIndices.size > 0) {
      const index = this.availableCursorIndices.values().next().value;
      if (index !== undefined) {
        this.availableCursorIndices.delete(index);
        return index;
      }
    }
    this.currentCursorIndex += 1;
    return this.currentCursorIndex;
  };

  private updateCoordinatesInDelaunayGraph = (id: string, [x, y]: Vector<2>) => {
    const cursor = this.idCursorMap.get(id);
    if (!cursor) {
      return;
    }
    // The graph's points are a flat array of x, y pairs
    this.delaunay.points[cursor.index * 2] = x;
    this.delaunay.points[cursor.index * 2 + 1] = y;
    this.delaunay.update();
  };

  private broadcastCursor = (event: ServerEvent, without?: string[]) => {
    this.broadcast(serializeServerEvent(event), without);
  };

  override onConnect = (conn: Connection) => {
    // Broadcast join event to other cursors
    this.broadcastCursor({ id: conn.id, type: "JOIN" }, [conn.id]);

    // Send all existing cursors to newly connected client, with increasing delay
    let sendInterval = 500;
    this.idCursorMap.forEach((cursor, id) => {
      conn.send(serializeServerEvent({ id, type: "JOIN" }));
      setTimeout(() => {
        conn.send(serializeServerEvent({ id, type: "UPDATE", cursorState: cursor.state }));
      }, sendInterval);
      sendInterval += 300;
    });

    // Update state
    const index = this.getNextIndex();
    this.indexIdMap.set(index, conn.id);
    this.idCursorMap.set(conn.id, { index, state: {} });
  };

  private updateCursor = (id: string, cursorState: Partial<CursorState>) => {
    this.broadcastCursor({ id, type: "UPDATE", cursorState }, [id]);
    const cursor = this.idCursorMap.get(id);
    if (cursor) {
      this.idCursorMap.set(id, {
        index: cursor.index,
        state: { ...cursor.state, ...cursorState },
      });
    }
  };

  override onMessage(sender: Connection, message: WSMessage) {
    if (typeof message !== "string") {
      return;
    }

    const [_, parsed] = tryCatch(() => parseClientEvent(message));

    if (!parsed) {
      return;
    }

    const { cursorState, scrollY } = parsed;

    if (!cursorState?.position) {
      this.updateCursor(sender.id, cursorState);
      return;
    }

    const position = [cursorState.position[0], cursorState.position[1] + scrollY] as Vector<2>;
    this.updateCursor(sender.id, { ...cursorState, position });

    if (this.idCursorMap.size === 1) {
      return;
    }

    if (this.currentCursorIndex > MAX_CURSORS_SUPPORTED_IN_GRAPH) {
      this.broadcastCursor({
        id: sender.id,
        type: "NEIGHBORS",
        neighbors: [],
      });
      return;
    }

    this.updateCoordinatesInDelaunayGraph(sender.id, position);
    this.idCursorMap.forEach(({ index }, id) => {
      const neighborIds = [];
      for (const neighborIndex of this.delaunay.neighbors(index)) {
        const neighborId = this.indexIdMap.get(neighborIndex);
        if (neighborId) {
          neighborIds.push(neighborId);
        }
      }
      this.getConnection(id)?.send(
        serializeServerEvent({
          id,
          type: "NEIGHBORS",
          neighbors: neighborIds,
        }),
      );
    });
  }

  private handleExit = (conn: Connection): void => {
    const cursor = this.idCursorMap.get(conn.id);
    this.broadcastCursor({ id: conn.id, type: "LEAVE" }, [conn.id]);
    this.updateCoordinatesInDelaunayGraph(conn.id, [0, 0]);
    if (cursor) {
      this.indexIdMap.delete(cursor.index);
      this.idCursorMap.delete(conn.id);
      this.availableCursorIndices.add(cursor.index);
    }
  };

  override onClose = (conn: Connection) => {
    this.handleExit(conn);
  };

  override onError = (conn: Connection) => {
    this.handleExit(conn);
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (await routePartykitRequest(request, env)) || new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
