export interface SourcePosition {
  /** 1-based line number, matching how editors and diff tools count lines. */
  line: number;
  /** 1-based column number within that line. */
  column: number;
}

/**
 * Thrown for any problem in the input grid. The message is pre-formatted
 * with a source snippet and a caret, the way a compiler error reads, since
 * "row 4 is malformed" is useless without seeing row 4.
 */
export class CrosswordFormatError extends Error {
  readonly line: number;
  readonly column: number;
  readonly sourceLine: string;

  constructor(message: string, position: SourcePosition, sourceLine: string) {
    const caretOffset = Math.max(0, position.column - 1);
    const pointer = " ".repeat(caretOffset) + "^";
    const located =
      `${message} (line ${position.line}, column ${position.column})\n\n` +
      `  ${sourceLine}\n` +
      `  ${pointer}`;
    super(located);
    this.name = "CrosswordFormatError";
    this.line = position.line;
    this.column = position.column;
    this.sourceLine = sourceLine;
  }
}
