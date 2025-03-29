import {
  type Infer,
  array,
  enums,
  nullable,
  number,
  object,
  optional,
  string,
  tuple,
} from "banditypes";

const cursorState = object({
  position: tuple([number(), number()] as const).or(optional()),
  visibility: string().or(optional()),
  size: string().or(optional()),
  placement: string().or(optional()),
  shape: string().or(optional()),
  color: string().or(optional()),
  textContent: string().or(optional()).or(nullable()),
});

export type CursorState = Infer<typeof cursorState>;

const serverEvents = {
  connection: object({
    type: enums(["LEAVE", "JOIN"]),
    id: string(),
  }),
  update: object({
    type: enums(["UPDATE"]),
    id: string(),
    cursorState,
  }),
  neighbors: object({
    type: enums(["NEIGHBORS"]),
    id: string(),
    neighbors: array(string()),
  }),
};

const serverEvent = serverEvents.connection.or(serverEvents.update).or(serverEvents.neighbors);

export type ServerEvent = Infer<typeof serverEvent>;

export const parseServerEvent = (json: string) => serverEvent(JSON.parse(json));
export const serializeServerEvent = (event: ServerEvent) => JSON.stringify(serverEvent(event));

const clientUpdateEvent = object({
  type: enums(["UPDATE"]),
  scrollY: number(),
  cursorState,
});

export type ClientEvent = Infer<typeof clientUpdateEvent>;

export const parseClientEvent = (json: string) => clientUpdateEvent(JSON.parse(json));
export const serializeClientEvent = (event: ClientEvent) =>
  JSON.stringify(clientUpdateEvent(event));
