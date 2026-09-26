import { Board, FILLED, Grid, Hints } from "./types";

export function getHanjieHints(line: boolean[]): number[] {
    const hints: number[] = [];
    let count = 0;
    for (let i = 0; i < line.length; i++) {
        if (line[i]) {
            count++;
        } else {
            if (count > 0) {
                hints.push(count);
                count = 0;
            }
        }
    }
    if (count > 0) hints.push(count);
    return hints;
}

export function createGrid<T>(rows: number, cols: number, value: T): T[][] {
    return Array.from({ length: rows }, () => Array(cols).fill(value));
}

export function getRowHints(grid: Grid): Hints {
    return grid.map((row) => getHanjieHints(row));
}

export function getColumnHints(grid: Grid): Hints {
    const cols = grid[0]?.length ?? 0;
    const hints: Hints = [];
    for (let c = 0; c < cols; c++) {
        hints.push(getHanjieHints(grid.map((row) => row[c])));
    }
    return hints;
}

export function boardToGrid(board: Board): Grid {
    return board.map((row) => row.map((cell) => cell === FILLED));
}

function sameHints(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

// A grid is a valid solution when it produces exactly the given hints.
// Nonograms can have several valid solutions, so this is the correct check
// rather than comparing against the original drawing.
export function matchesHints(
    grid: Grid,
    rowHints: Hints,
    colHints: Hints
): boolean {
    const actualRows = getRowHints(grid);
    const actualCols = getColumnHints(grid);
    return (
        actualRows.length === rowHints.length &&
        actualCols.length === colHints.length &&
        actualRows.every((h, i) => sameHints(h, rowHints[i])) &&
        actualCols.every((h, i) => sameHints(h, colHints[i]))
    );
}
