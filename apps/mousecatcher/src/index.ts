import {
  type CursorState,
  type ServerEvent,
  parseClientEvent,
  serializeServerEvent,
} from "@repo/mouse/presence";
import type { Vector } from "@repo/utils/math/types";
import { tryCatch } from "@repo/utils/tryCatch";
import { Delaunay } from "d3-delaunay";
import type * as Party from "partykit/server";

const MAX_CURSORS_SUPPORTED_IN_GRAPH = 512;

export default class Server implements Party.Server {
  // Hibernation empties out the delaunay graph, making our neighbor calculations impossible to do.
  options?: Party.ServerOptions = { hibernate: false };

  delaunay = new Delaunay(new Uint16Array(MAX_CURSORS_SUPPORTED_IN_GRAPH * 2));

  idIndexMap = new Map<string, number>();
  indexIdMap = new Map<number, string>();
  idStateMap = new Map<string, CursorState>();

  currentCursorIndex = -1;
  getNextIndex = () => {
    this.currentCursorIndex += 1;
    return this.currentCursorIndex;
  };

  getFlattenedMatrixCoordinateIndicesFromIndex = (index: number) => {
    return [index * 2, index * 2 + 1];
  };

  updateCoordinatesInDelaunayGraph = (id: string, [x, y]: Vector<2>) => {
    const cursorIndex = this.idIndexMap.get(id);
    if (!cursorIndex) {
      return;
    }
    const [xLocation, yLocation] = this.getFlattenedMatrixCoordinateIndicesFromIndex(cursorIndex);
    if (xLocation && yLocation) {
      this.delaunay.points[xLocation] = x;
      this.delaunay.points[yLocation] = y;
      this.delaunay.update();
    }
  };

  broadcastCursor = (event: ServerEvent, without?: string[]) => {
    this.room.broadcast(serializeServerEvent(event), without);
  };

  updateCursor = (id: string, cursorState: CursorState) => {
    this.broadcastCursor({ id, type: "UPDATE", cursorState }, [id]);
    this.idStateMap.set(id, Object.assign(this.idStateMap.get(id) ?? {}, cursorState));
  };

  constructor(readonly room: Party.Room) {}

  onConnect = (conn: Party.Connection) => {
    // Broadcast join event to other cursors
    this.broadcastCursor({ id: conn.id, type: "JOIN" }, [conn.id]);

    // Send all existing cursors to newly connected client, with increasing delay
    let sendInterval = 500;
    this.idStateMap.forEach((cursorState, id) => {
      conn.send(serializeServerEvent({ id, type: "JOIN" }));
      setTimeout(() => {
        conn.send(serializeServerEvent({ id, type: "UPDATE", cursorState }));
      }, sendInterval);
      sendInterval += 250;
    });

    // Update state
    const index = this.getNextIndex();
    this.idIndexMap.set(conn.id, index);
    this.indexIdMap.set(index, conn.id);
    this.idStateMap.set(conn.id, {});
  };

  onMessage = (message: string, sender: Party.Connection) => {
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

    if (this.idIndexMap.size === 1) {
      return;
    }

    if (this.idIndexMap.size < 5) {
      const neighbors = Array.from(this.idIndexMap.keys());
      this.broadcastCursor({
        id: sender.id,
        type: "NEIGHBORS",
        neighbors,
      });
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
    this.idIndexMap.forEach((index, id) => {
      const neighborIds = [];
      for (const neighborIndex of this.delaunay.neighbors(index)) {
        const neighborId = this.indexIdMap.get(neighborIndex);
        // We need to do a truthy check as an 'empty' point may be considered a neighbor in the delaunay graph
        if (neighborId) {
          neighborIds.push(neighborId);
        }
      }
      this.room.getConnection(id)?.send(
        serializeServerEvent({
          id,
          type: "NEIGHBORS",
          neighbors: neighborIds,
        })
      );
    });
  };

  handleExit = (conn: Party.Connection<unknown>): void => {
    this.broadcastCursor({ id: conn.id, type: "LEAVE" }, [conn.id]);
    this.updateCoordinatesInDelaunayGraph(conn.id, [0, 0]);
    const index = this.idIndexMap.get(conn.id);
    if (index) {
      this.idIndexMap.delete(conn.id);
      this.indexIdMap.delete(index);
      this.idStateMap.delete(conn.id);
    }
  };

  onClose = this.handleExit;
  onError = this.handleExit;
}

Server satisfies Party.Worker;
