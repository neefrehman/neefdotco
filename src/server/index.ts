import type * as Party from "partykit/server";
import { Delaunay } from "d3-delaunay";
import {
  parseCursorInput,
  serializeCursorOutput,
  type CursorOutput,
  type CursorCoordinates,
} from "utils/cursors";

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

  updateCoordinatesInDelaunayGraph = (id: string, [x, y]: CursorCoordinates) => {
    const pointIndex = this.pointIndexMap.get(id);
    const [xLocation, yLocation] = this.getFlattenedMatrixCoordinateIndicesFromIndex(pointIndex);
    this.delaunay.points[xLocation] = x;
    this.delaunay.points[yLocation] = y;
    this.delaunay.update();
  };

  broadcastCursor = (output: CursorOutput, without?: string[]) => {
    this.room.broadcast(serializeCursorOutput(output), without);
  };

  constructor(readonly room: Party.Room) {}

  onConnect = (conn: Party.Connection) => {
    this.broadcastCursor({ id: conn.id, type: "JOIN" }, [conn.id]);
    const index = this.getNextIndex();
    this.pointIndexMap.set(conn.id, index);
    this.indexPointMap.set(index, conn.id);
  };

  onMessage = (message: string, sender: Party.Connection) => {
    const parsed = parseCursorInput(message);
    const coords = [parsed.coords[0], parsed.coords[1] + parsed.scrollY] as CursorCoordinates;

    this.broadcastCursor({ id: sender.id, type: "UPDATE", message: { ...parsed, coords } }, [sender.id]);

    if (this.pointIndexMap.size === 1) {
      return;
    }

    if (this.pointIndexMap.size < 5) {
      const neighbors = Array.from(this.pointIndexMap.keys());
      this.broadcastCursor({ id: sender.id, type: "NEIGHBORS", message: { neighbors } });
      return;
    }

    if (this.currentPointIndex > MAX_CURSORS_SUPPORTED_IN_GRAPH) {
      this.broadcastCursor({ id: sender.id, type: "NEIGHBORS", message: { neighbors: [] } });
      return;
    }

    this.updateCoordinatesInDelaunayGraph(sender.id, coords);
    this.pointIndexMap.forEach((index, id) => {
      const neighborIds = [];
      for (index of this.delaunay.neighbors(index)) {
        const neighborId = this.indexPointMap.get(index);
        // We need to do a truthy check as an 'empty' point may be considered a neighbor in the delaunay graph
        if (neighborId) {
          neighborIds.push(neighborId);
        }
      }
      this.room
        .getConnection(id)
        .send(serializeCursorOutput({ id, type: "NEIGHBORS", message: { neighbors: neighborIds } }));
    });
  };

  handleExit = (conn: Party.Connection<unknown>): void => {
    this.broadcastCursor({ id: conn.id, type: "LEAVE" }, [conn.id]);
    this.updateCoordinatesInDelaunayGraph(conn.id, [0, 0]);
    const index = this.pointIndexMap.get(conn.id);
    this.pointIndexMap.delete(conn.id);
    this.indexPointMap.delete(index);
  };

  onClose = this.handleExit;
  onError = this.handleExit;
}

Server satisfies Party.Worker;
