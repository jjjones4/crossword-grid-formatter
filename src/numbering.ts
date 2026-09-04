import type { FormattedGrid } from "./parser.js";

export interface ClueEntry {
  readonly number: number;
  readonly row: number;
  readonly col: number;
  readonly length: number;
}

export interface ClueNumbering {
  /** cellNumbers[row][col] is the clue number that starts at that cell, or null. */
  readonly cellNumbers: readonly (number | null)[][];
  readonly across: readonly ClueEntry[];
  readonly down: readonly ClueEntry[];
}

/**
 * Derives standard crossword clue numbers from grid shape alone, the same
 * way a human would: walk the grid in reading order, and give a cell a
 * number if it opens an across entry, a down entry, or both. One counter is
 * shared between across and down, per convention (a cell that opens both
 * gets one number that both clues reuse).
 */
export function deriveClueNumbers(grid: FormattedGrid): ClueNumbering {
  const { rows, width, height } = grid;
  const isBlack = (row: number, col: number) => rows[row][col] === "#";

  const cellNumbers: (number | null)[][] = Array.from({ length: height }, () =>
    new Array<number | null>(width).fill(null)
  );
  const across: ClueEntry[] = [];
  const down: ClueEntry[] = [];
  let nextNumber = 1;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (isBlack(row, col)) {
        continue;
      }

      const opensAcross =
        (col === 0 || isBlack(row, col - 1)) &&
        col + 1 < width &&
        !isBlack(row, col + 1);
      const opensDown =
        (row === 0 || isBlack(row - 1, col)) &&
        row + 1 < height &&
        !isBlack(row + 1, col);

      if (!opensAcross && !opensDown) {
        continue;
      }

      const number = nextNumber++;
      cellNumbers[row][col] = number;

      if (opensAcross) {
        let length = 0;
        while (col + length < width && !isBlack(row, col + length)) {
          length++;
        }
        across.push({ number, row, col, length });
      }

      if (opensDown) {
        let length = 0;
        while (row + length < height && !isBlack(row + length, col)) {
          length++;
        }
        down.push({ number, row, col, length });
      }
    }
  }

  return { cellNumbers, across, down };
}
