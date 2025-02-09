import { type CursorEvent, parseCursorEvent, serializeCursorEvent } from "@repo/mouse/presence";
import type { Vector } from "@repo/utils/math/types";
import { tryCatch } from "@repo/utils/tryCatch";
import { Delaunay } from "d3-delaunay";
import type * as Party from "partykit/server";

const MAX_CURSORS_SUPPORTED_IN_GRAPH = 512;

export default class Server implements Party.Server {
  // Hibernation empties out the delaunay graph, making our neighbor calculations impossible to do.
  options?: Party.ServerOptions = { hibernate: false };

  delaunay = new Delaunay(new Uint16Array(MAX_CURSORS_SUPPORTED_IN_GRAPH * 2));
  pointIndexMap = new Map<string, number>();
  indexPointMap = new Map<number, string>();
  currentPointIndex = -1;

  getNextIndex = () => {
    this.currentPointIndex += 1;
    return this.currentPointIndex;
  };

  getFlattenedMatrixCoordinateIndicesFromIndex = (index: number) => {
    return [index * 2, index * 2 + 1];
  };

  updateCoordinatesInDelaunayGraph = (id: string, [x, y]: Vector<2>) => {
    const pointIndex = this.pointIndexMap.get(id);
    if (!pointIndex) {
      return;
    }
    const [xLocation, yLocation] = this.getFlattenedMatrixCoordinateIndicesFromIndex(pointIndex);
    if (xLocation && yLocation) {
      this.delaunay.points[xLocation] = x;
      this.delaunay.points[yLocation] = y;
      this.delaunay.update();
    }
  };

  broadcastCursor = (event: CursorEvent, without?: string[]) => {
    this.room.broadcast(serializeCursorEvent(event), without);
  };

  constructor(readonly room: Party.Room) {}

  onConnect = (conn: Party.Connection) => {
    this.broadcastCursor({ id: conn.id, type: "JOIN" }, [conn.id]);
    const index = this.getNextIndex();
    this.pointIndexMap.set(conn.id, index);
    this.indexPointMap.set(index, conn.id);
  };

  onMessage = (message: string, sender: Party.Connection) => {
    const [_, parsed] = tryCatch(() => parseCursorEvent(message));

    if (parsed?.type !== "UPDATE") {
      return;
    }

    if (!parsed.cursorState?.position) {
      this.broadcastCursor(
        {
          id: sender.id,
          type: "UPDATE",
          cursorState: parsed.cursorState,
          scrollY: parsed.scrollY,
        },
        [sender.id]
      );
      return;
    }

    const position = [
      parsed.cursorState.position[0],
      parsed.cursorState.position[1] + parsed.scrollY,
    ] as Vector<2>;

    this.broadcastCursor(
      {
        id: sender.id,
        type: "UPDATE",
        cursorState: { ...parsed.cursorState, position },
        scrollY: parsed.scrollY,
      },
      [sender.id]
    );

    if (this.pointIndexMap.size === 1) {
      return;
    }

    if (this.pointIndexMap.size < 5) {
      const neighbors = Array.from(this.pointIndexMap.keys());
      this.broadcastCursor({
        id: sender.id,
        type: "NEIGHBORS",
        neighbors,
      });
      return;
    }

    if (this.currentPointIndex > MAX_CURSORS_SUPPORTED_IN_GRAPH) {
      this.broadcastCursor({
        id: sender.id,
        type: "NEIGHBORS",
        neighbors: [],
      });
      return;
    }

    this.updateCoordinatesInDelaunayGraph(sender.id, position);
    this.pointIndexMap.forEach((index, id) => {
      const neighborIds = [];
      for (const neighborIndex of this.delaunay.neighbors(index)) {
        const neighborId = this.indexPointMap.get(neighborIndex);
        // We need to do a truthy check as an 'empty' point may be considered a neighbor in the delaunay graph
        if (neighborId) {
          neighborIds.push(neighborId);
        }
      }
      this.room.getConnection(id)?.send(
        serializeCursorEvent({
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
    const index = this.pointIndexMap.get(conn.id);
    if (index) {
      this.pointIndexMap.delete(conn.id);
      this.indexPointMap.delete(index);
    }
  };

  onClose = this.handleExit;
  onError = this.handleExit;
}

Server satisfies Party.Worker;
