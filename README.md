# crossword-grid-formatter

Crossword grids get typed by hand, pasted out of spreadsheets, exported from
half a dozen incompatible editors, and passed around as plain text long
before anyone bothers with a real file format. The result is always slightly
inconsistent: one tool marks black squares with `#`, another uses `X`, a
third pastes in a solid block character. Empty cells show up as `.`, `_`, or
`-` depending on who typed the grid. Rows drift a character short because
someone's editor trimmed trailing whitespace. None of this is a real error
in the puzzle, it's just noise, but it breaks anything downstream that
expects a consistent grid.

This library takes that messy text and turns it into a canonical grid:
`#` for black squares, `.` for empty cells, uppercase letters for filled
cells. If the input can't be normalized, it tells you exactly where the
problem is instead of failing with something like "invalid grid".

## Usage

```ts
import { format } from "crossword-grid-formatter";

const messy = `
X . . x .
. A B . .
. C d . X
`;

console.log(format(messy));
// #.....
// .AB...
// .Cd... (Cd -> CD, letters are uppercased)
```

For access to the parsed structure instead of a joined string:

```ts
import { formatGrid } from "crossword-grid-formatter";

const grid = formatGrid("#..\n.A#\n#.#");
grid.width;   // 3
grid.height;  // 3
grid.rows;    // ["#..", ".A#", "#.#"]
```

## Error messages

Malformed input throws `CrosswordFormatError`, which carries `line` and
`column` fields and a message that already includes a source snippet:

```ts
import { format, CrosswordFormatError } from "crossword-grid-formatter";

try {
  format("#..\n.A#\n#.?");
} catch (err) {
  if (err instanceof CrosswordFormatError) {
    console.log(err.message);
  }
}
```

```
unrecognized character "?" in grid (line 3, column 3)

  #.?
    ^
```

Ragged rows are caught the same way, pointing at the column where the row
stopped matching the width established by the first row:

```
row has 2 cells, but the grid started with 3 cells on line 1 (line 3, column 3)

  .A
    ^
```

## Clue numbering

Once a grid is normalized, `deriveClueNumbers` works out standard clue
numbers from the grid shape alone: a cell opens an across entry if the cell
to its left is black (or off the grid) and the cell to its right is not, and
symmetrically for down. A cell that opens both gets a single number shared
by both clues, per convention.

```ts
import { formatGrid, deriveClueNumbers } from "crossword-grid-formatter";

const grid = formatGrid("ABC\n#.#\nDEF");
const numbering = deriveClueNumbers(grid);

numbering.cellNumbers; // [[1, 2, null], [null, null, null], [3, null, null]]
numbering.across;      // [{ number: 1, row: 0, col: 0, length: 3 }, { number: 3, row: 2, col: 0, length: 3 }]
numbering.down;        // [{ number: 2, row: 0, col: 1, length: 3 }]
```

## Rotational symmetry

Published crosswords conventionally have 180-degree rotational symmetry in
their black squares: rotate the grid a half turn and the black squares land
in the same place. That's a convention, not a parsing rule, so a grid that
breaks it still parses fine - `checkRotationalSymmetry` just reports where.

```ts
import { formatGrid, checkRotationalSymmetry } from "crossword-grid-formatter";

const grid = formatGrid("#.#\n...\n#..");
const result = checkRotationalSymmetry(grid);

result.symmetric; // false
result.warnings;  // [{ row: 2, col: 0, mirrorRow: 0, mirrorCol: 2 }]
```

Each asymmetric pair is reported once. Nothing is thrown; it's up to the
caller to decide whether an asymmetric grid is acceptable.

## What counts as a valid cell

- Black square: `#`, `x`, `X`, `■`, `*`, `@`
- Empty cell: `.`, `_`, `-`
- Filled cell: any letter, normalized to uppercase

Space is intentionally not treated as an empty cell. If it were, a stray
trailing space from a paste would silently change a row's width instead of
being reported as an error.

## Status

Early skeleton. Parses and normalizes single grids, derives clue numbers
from grid shape, and checks rotational symmetry. No file I/O yet.

## Install

No package has been published yet. Clone the repo and run `tsc` to build
`dist/` from `src/`.
