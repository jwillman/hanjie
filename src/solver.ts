import { Hints, Grid } from "./types";

function generateLinePatterns(hint: number[], length: number): boolean[][] {
    const results: boolean[][] = [];

    function backtrack(pos: number, hintIndex: number, line: boolean[]) {
        if (hint.length === 0) {
            // No runs means all white
            results.push(Array(length).fill(false));
            return;
        }

        if (hintIndex === hint.length) {
            for (let i = pos; i < length; i++) line[i] = false;
            results.push([...line]);
            return;
        }

        const runLength = hint[hintIndex];
        for (let start = pos; start + runLength <= length; start++) {
            // Fill gap before this run
            for (let i = pos; i < start; i++) line[i] = false;

            // Place run
            for (let i = start; i < start + runLength; i++) line[i] = true;

            backtrack(start + runLength + 1, hintIndex + 1, line);
        }
    }

    if (hint.length === 0) {
        results.push(Array(length).fill(false));
    } else {
        backtrack(0, 0, Array(length).fill(false));
    }

    return results;
}

function isCompatibleWithColumns(
    grid: Grid,
    rowIndex: number,
    rowPattern: boolean[],
    colHints: Hints
): boolean {
    const n = grid.length;
    for (let c = 0; c < n; c++) {
        grid[rowIndex][c] = rowPattern[c];
    }

    // Basic check: ensure we don't exceed max blacks in any column
    for (let c = 0; c < n; c++) {
        const col = [];
        for (let r = 0; r <= rowIndex; r++) {
            col.push(grid[r][c]);
        }
        const maxBlacks = colHints[c].reduce((a, b) => a + b, 0);
        const assignedBlacks = col.filter((x) => x).length;
        if (assignedBlacks > maxBlacks) {
            // revert row assignment for cleanup
            for (let cc = 0; cc < n; cc++) {
                grid[rowIndex][cc] = false;
            }
            return false;
        }
    }

    return true;
}

function solvePuzzleRecursive(
    grid: Grid,
    rowIndex: number,
    rowPatterns: boolean[][][],
    colHints: Hints
): boolean {
    const n = grid.length;
    if (rowIndex === n) {
        return true; // all rows assigned
    }

    for (const pattern of rowPatterns[rowIndex]) {
        if (isCompatibleWithColumns(grid, rowIndex, pattern, colHints)) {
            if (
                solvePuzzleRecursive(grid, rowIndex + 1, rowPatterns, colHints)
            ) {
                return true;
            }
            // revert row
            for (let c = 0; c < n; c++) {
                grid[rowIndex][c] = false;
            }
        }
    }

    return false;
}

export function solveNonogram(
    n: number,
    rowHints: Hints,
    colHints: Hints
): Grid | null {
    const grid: Grid = Array.from({ length: n }, () => Array(n).fill(false));
    const rowPatterns = rowHints.map((rh) => generateLinePatterns(rh, n));

    const solved = solvePuzzleRecursive(grid, 0, rowPatterns, colHints);
    return solved ? grid : null;
}
