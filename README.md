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

## What counts as a valid cell

- Black square: `#`, `x`, `X`, `■`, `*`, `@`
- Empty cell: `.`, `_`, `-`
- Filled cell: any letter, normalized to uppercase

Space is intentionally not treated as an empty cell. If it were, a stray
trailing space from a paste would silently change a row's width instead of
being reported as an error.

## Status

Early skeleton. Parses and normalizes single grids; no clue numbering, no
symmetry checks, no file I/O yet.

## Install

No package has been published yet. Clone the repo and run `tsc` to build
`dist/` from `src/`.
