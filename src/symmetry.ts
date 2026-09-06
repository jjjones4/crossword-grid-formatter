import type { FormattedGrid } from "./parser.js";

export interface SymmetryWarning {
  readonly row: number;
  readonly col: number;
  readonly mirrorRow: number;
  readonly mirrorCol: number;
}

export interface SymmetryCheckResult {
  readonly symmetric: boolean;
  readonly warnings: readonly SymmetryWarning[];
}

/**
 * Checks the grid for standard 180-degree rotational symmetry: a cell is
 * black iff its 180-degree counterpart is also black. This is a convention
 * for published crosswords, not a rule of what makes a grid parseable, so
 * it's surfaced as a warning list rather than a thrown error - callers
 * decide whether to reject, log, or ignore an asymmetric grid.
 *
 * Each asymmetric pair is reported once, keyed on the cell that comes first
 * in reading order.
 */
export function checkRotationalSymmetry(grid: FormattedGrid): SymmetryCheckResult {
  const { rows, width, height } = grid;
  const isBlack = (row: number, col: number) => rows[row][col] === "#";

  const warnings: SymmetryWarning[] = [];

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mirrorRow = height - 1 - row;
      const mirrorCol = width - 1 - col;
      const linearIndex = row * width + col;
      const mirrorLinearIndex = mirrorRow * width + mirrorCol;

      if (mirrorLinearIndex < linearIndex) {
        continue;
      }

      if (isBlack(row, col) !== isBlack(mirrorRow, mirrorCol)) {
        warnings.push({ row, col, mirrorRow, mirrorCol });
      }
    }
  }

  return { symmetric: warnings.length === 0, warnings };
}
