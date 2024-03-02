/* eslint-disable no-console */

export type CursorCoordinates = [x: number, y: number];

export type CursorInput = {
  className: string;
  innerText: string;
  style: string;
  color: string;
  coords: CursorCoordinates;
  scrollY: number;
};

const validateCursorInput = (input: Partial<CursorInput>): CursorInput => {
  if (
    typeof input.className !== "string" ||
    typeof input.innerText !== "string" ||
    typeof input.style !== "string" ||
    typeof input.color !== "string" ||
    !Array.isArray(input.coords) ||
    typeof input.scrollY !== "number"
  ) {
    throw new Error(`invalid input found: ${JSON.stringify(input)}`);
  }
  return input as CursorInput;
};

export const serializeCursorInput = (input: CursorInput): string => {
  return JSON.stringify(validateCursorInput(input));
};

export const parseCursorInput = (json: string): CursorInput => {
  return validateCursorInput(JSON.parse(json) as Partial<CursorInput>);
};

export type CursorOutput = {
  id: string;
} & (
  | { type: "LEAVE" | "JOIN" }
  | {
      type: "UPDATE";
      message: {
        className: string;
        innerText: string;
        color: string;
        coords: CursorCoordinates;
      };
    }
  | {
      type: "NEIGHBORS";
      message: {
        neighbors: string[];
      };
    }
);

const validateCursorOutput = (output: Partial<CursorOutput>): CursorOutput => {
  if (typeof output.id !== "string" || !["JOIN", "LEAVE", "UPDATE", "NEIGHBORS"].includes(output.type)) {
    throw new Error(`invalid output found: ${JSON.stringify(output)}`);
  }
  if (
    output.type === "UPDATE" &&
    (typeof output.message.className !== "string" ||
      typeof output.message.innerText !== "string" ||
      typeof output.message.color !== "string" ||
      !Array.isArray(output.message.coords))
  ) {
    throw new Error(`invalid message found: ${JSON.stringify(output.message)}`);
  }
  if (output.type === "NEIGHBORS" && !Array.isArray(output.message.neighbors)) {
    throw new Error(`invalid message found: ${JSON.stringify(output.message)}`);
  }
  return output as CursorOutput;
};

export const serializeCursorOutput = (message: CursorOutput): string => {
  return JSON.stringify(validateCursorOutput(message));
};

export const parseCursorOutput = (json: string): CursorOutput | null => {
  return validateCursorOutput(JSON.parse(json) as Partial<CursorOutput>);
};
