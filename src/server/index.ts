import type * as Party from "partykit/server";
import { parseCursorInput, serializeCursorOutput, type CursorOutput } from "utils/cursors";

export default class Server implements Party.Server {
  // TODO: test hibernation
  options: Party.ServerOptions = { hibernate: true };

  broadcastCursor = (output: CursorOutput, without?: string[]) =>
    this.room.broadcast(serializeCursorOutput(output), without);

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    this.broadcastCursor({ id: conn.id, type: "JOIN" }, [conn.id]);
  }

  onMessage(message: string, sender: Party.Connection) {
    const parsed = parseCursorInput(message);
    const mutableMessage = {
      ...parsed,
      coords: [parsed.coords[0], parsed.coords[1] + parsed.scrollY] satisfies [number, number],
    };
    this.broadcastCursor({ id: sender.id, type: "UPDATE", message: mutableMessage }, [sender.id]);
  }

  onClose(conn: Party.Connection<unknown>): void | Promise<void> {
    this.broadcastCursor({ id: conn.id, type: "LEAVE" }, [conn.id]);
  }

  onError(conn: Party.Connection<unknown>): void | Promise<void> {
    this.broadcastCursor({ id: conn.id, type: "LEAVE" }, [conn.id]);
  }
}

Server satisfies Party.Worker;
