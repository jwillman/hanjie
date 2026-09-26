export type Hints = number[][];
export type Grid = boolean[][];

// State of a cell on the board the user draws on.
export const EMPTY = 0;
export const FILLED = 1;
export const MARKED = 2; // marked as "definitely empty" in solve mode
export type CellState = typeof EMPTY | typeof FILLED | typeof MARKED;
export type Board = CellState[][];
