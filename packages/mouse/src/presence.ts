import { type Infer, array, enums, nullable, number, object, optional, string, tuple } from "banditypes";

export const cursorUpdateEvent = object({
  type: enums(["UPDATE"]),
  id: string(),
  scrollY: number(),
  cursorState: object({
    position: tuple([number(), number()] as const).or(optional()),
    visibility: string().or(optional()),
    size: string().or(optional()),
    placement: string().or(optional()),
    shape: string().or(optional()),
    color: string().or(optional()),
    textContent: string().or(optional()).or(nullable()),
  }).or(optional()),
});

const cursorConnectionEvent = object({
  type: enums(["LEAVE", "JOIN"]),
  id: string(),
});

const cursorNeighborEvent = object({
  type: enums(["NEIGHBORS"]),
  id: string(),
  neighbors: array(string()),
});

const cursorEvent = cursorConnectionEvent.or(cursorUpdateEvent).or(cursorNeighborEvent);

export type CursorEvent = Infer<typeof cursorEvent>;
export type CursorState = Infer<typeof cursorUpdateEvent>["cursorState"];

export const parseCursorEvent = (json: string) => cursorEvent(JSON.parse(json));
export const serializeCursorEvent = (event: CursorEvent) => JSON.stringify(cursorEvent(event));
