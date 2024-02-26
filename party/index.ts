import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    this.room.broadcast(JSON.stringify({ id: conn.id, type: "JOIN" }), [conn.id]);
  }

  onMessage(message: string, sender: Party.Connection) {
    this.room.broadcast(JSON.stringify({ id: sender.id, type: "UPDATE", message: JSON.parse(message) }), [sender.id]);
  }

  onClose(connection: Party.Connection<unknown>): void | Promise<void> {
    this.room.broadcast(JSON.stringify({ id: connection.id, type: "LEAVE" }), [connection.id]);
  }

  onError(connection: Party.Connection<unknown>): void | Promise<void> {
    this.room.broadcast(JSON.stringify({ id: connection.id, type: "LEAVE" }), [connection.id]);
  }
}

Server satisfies Party.Worker;
