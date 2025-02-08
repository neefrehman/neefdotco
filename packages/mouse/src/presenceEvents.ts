import { type Infer, array, enums, number, object, string } from "banditypes";
import { cursorState } from "./index";

export const cursorUpdateEvent = object({
  type: enums(["UPDATE"]),
  id: string(),
  scrollY: number(),
  cursorState,
});

export type CursorUpdateEvent = Infer<typeof cursorUpdateEvent>;

export const parseCursorUpdateEvent = (json: string) => cursorUpdateEvent(JSON.parse(json));

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

export const parseCursorEvent = (json: string) => cursorEvent(JSON.parse(json));
export const serializeCursorEvent = (event: CursorEvent) => JSON.stringify(cursorEvent(event));
