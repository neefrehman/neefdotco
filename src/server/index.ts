import type * as Party from "partykit/server";
import { Delaunay } from "d3-delaunay";
import {
  parseCursorInput,
  serializeCursorOutput,
  type CursorOutput,
  type CursorCoordinates,
} from "utils/cursors";

export default class Server implements Party.Server {
  options: Party.ServerOptions = { hibernate: true };

  pointCoordinateMap = new Map<string, CursorCoordinates>();

  broadcastCursor = (output: CursorOutput, without?: string[]) => {
    this.room.broadcast(serializeCursorOutput(output), without);
  };

  constructor(readonly room: Party.Room) {}

  onConnect = (conn: Party.Connection) => {
    this.broadcastCursor({ id: conn.id, type: "JOIN" }, [conn.id]);
  };

  onMessage = (message: string, sender: Party.Connection) => {
    const parsed = parseCursorInput(message);
    const newMessage = {
      ...parsed,
      coords: [parsed.coords[0], parsed.coords[1] + parsed.scrollY] satisfies CursorCoordinates,
    };
    this.pointCoordinateMap.set(sender.id, [parsed.coords[0], parsed.coords[1] + parsed.scrollY]);
    this.broadcastCursor({ id: sender.id, type: "UPDATE", message: newMessage }, [sender.id]);

    if (this.pointCoordinateMap.size < 5) {
      const neighbors = Array.from(this.pointCoordinateMap.keys());
      this.broadcastCursor({ id: sender.id, type: "NEIGHBORS", message: { neighbors } });
      return;
    }

    if (this.pointCoordinateMap.size > 200) {
      this.broadcastCursor({ id: sender.id, type: "NEIGHBORS", message: { neighbors: [] } });
      return;
    }

    const delaunay = Delaunay.from(this.pointCoordinateMap.values());

    // We're doing a lot of nested iteration here! V bad.
    // TODO: optimise this code, maybe with a reverse lookup Map, or ideally by:
    //       1. create typed array with set length (1024?)
    //       2. let current with getNextIndex function (that clears points if too many)
    //       2. Save map of index to point IDs that we can use to tell if a neighbouring index is a point or not
    //       3. default new Delaunay instantiation
    //       4. (have a predictable way to map back and forth between an ID and in index.)
    Array.from(this.pointCoordinateMap.keys()).forEach((id, i) => {
      const neighbors = Array.from(delaunay.neighbors(i)).flatMap(index => {
        return Array.from(this.pointCoordinateMap.keys()).find((_, i) => i === index) ?? [];
      });
      this.room
        .getConnection(id)
        .send(serializeCursorOutput({ id, type: "NEIGHBORS", message: { neighbors } }));
    });
  };

  onClose = (conn: Party.Connection<unknown>): void | Promise<void> => {
    this.broadcastCursor({ id: conn.id, type: "LEAVE" }, [conn.id]);
    this.pointCoordinateMap.delete(conn.id);
  };

  onError = (conn: Party.Connection<unknown>): void | Promise<void> => {
    this.broadcastCursor({ id: conn.id, type: "LEAVE" }, [conn.id]);
    this.pointCoordinateMap.delete(conn.id);
  };
}

Server satisfies Party.Worker;
