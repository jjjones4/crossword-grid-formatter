export { formatGrid, stringifyGrid } from "./parser.js";
export type { FormattedGrid } from "./parser.js";
export { CrosswordFormatError } from "./errors.js";
export type { SourcePosition } from "./errors.js";
export { deriveClueNumbers } from "./numbering.js";
export type { ClueEntry, ClueNumbering } from "./numbering.js";

import { formatGrid, stringifyGrid } from "./parser.js";

/** Convenience wrapper: parse messy grid text and return the canonical text form. */
export function format(input: string): string {
  return stringifyGrid(formatGrid(input));
}
