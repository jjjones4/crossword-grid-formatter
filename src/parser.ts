import { CrosswordFormatError } from "./errors.js";

// Different tools export black squares as different glyphs depending on
// font support and habit. Space is deliberately excluded from the empty
// cell aliases below: if it meant "empty cell" then a stray trailing space
// from a copy-paste would silently change a row's width instead of being
// caught as an error.
const BLACK_SQUARE_ALIASES = new Set(["#", "x", "X", "■", "*", "@"]);
const EMPTY_CELL_ALIASES = new Set([".", "_", "-"]);

const CANONICAL_BLACK = "#";
const CANONICAL_EMPTY = ".";

export interface FormattedGrid {
  readonly rows: readonly string[];
  readonly width: number;
  readonly height: number;
}

/**
 * Parses raw grid text into a normalized grid. Each non-blank line is a
 * row; each character in a row is a cell. Throws CrosswordFormatError on
 * the first problem found, with the offending line and column.
 */
export function formatGrid(input: string): FormattedGrid {
  const rawLines = input.split(/\r\n|\r|\n/);
  const rows: string[] = [];
  let expectedWidth: number | null = null;
  let firstRowLineNumber = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const lineNumber = i + 1;
    const rawLine = rawLines[i];
    if (rawLine.trim().length === 0) {
      continue;
    }

    const normalized = normalizeRow(rawLine, lineNumber);

    if (expectedWidth === null) {
      expectedWidth = normalized.length;
      firstRowLineNumber = lineNumber;
    } else if (normalized.length !== expectedWidth) {
      const column =
        normalized.length > expectedWidth
          ? expectedWidth + 1
          : normalized.length + 1;
      throw new CrosswordFormatError(
        `row has ${normalized.length} cells, but the grid started with ` +
          `${expectedWidth} cells on line ${firstRowLineNumber}`,
        { line: lineNumber, column },
        rawLine
      );
    }

    rows.push(normalized);
  }

  if (rows.length === 0 || expectedWidth === null) {
    throw new CrosswordFormatError(
      "input has no grid rows",
      { line: 1, column: 1 },
      ""
    );
  }

  return { rows, width: expectedWidth, height: rows.length };
}

function normalizeRow(line: string, lineNumber: number): string {
  let result = "";
  for (let col = 0; col < line.length; col++) {
    const ch = line[col];
    if (BLACK_SQUARE_ALIASES.has(ch)) {
      result += CANONICAL_BLACK;
    } else if (EMPTY_CELL_ALIASES.has(ch)) {
      result += CANONICAL_EMPTY;
    } else if (/[a-zA-Z]/.test(ch)) {
      result += ch.toUpperCase();
    } else {
      throw new CrosswordFormatError(
        `unrecognized character ${JSON.stringify(ch)} in grid`,
        { line: lineNumber, column: col + 1 },
        line
      );
    }
  }
  return result;
}

export function stringifyGrid(grid: FormattedGrid): string {
  return grid.rows.join("\n");
}
