import { Grid, Hints } from "./types";

// Cell knowledge while solving
const UNKNOWN = -1;
const EMPTY = 0;
const FILLED = 1;
type Line = number[];

/**
 * Finds every cell of a line that is forced by the hints and the cells
 * already known. Returns the updated line, or null if the line cannot be
 * completed at all.
 *
 * reach(i, j) answers: can cells i..n-1 hold runs j..k-1, given that cell
 * i-1 (if any) is empty? From every reachable, successful state we record
 * which colours each cell can take; a cell with only one option is forced.
 */
export function solveLine(line: Line, hint: number[]): Line | null {
    const n = line.length;
    const k = hint.length;
    const memo = new Map<number, boolean>();

    // emptyBefore[i] = number of known-empty cells in line[0..i-1]
    const emptyBefore = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        emptyBefore[i + 1] = emptyBefore[i] + (line[i] === EMPTY ? 1 : 0);
    }
    const canPlaceRun = (start: number, len: number) =>
        start + len <= n &&
        emptyBefore[start + len] - emptyBefore[start] === 0 &&
        (start + len === n || line[start + len] !== FILLED);

    const reach = (i: number, j: number): boolean => {
        if (i >= n) return j === k;
        const key = i * (k + 1) + j;
        const cached = memo.get(key);
        if (cached !== undefined) return cached;

        let ok = false;
        if (line[i] !== FILLED && reach(i + 1, j)) ok = true;
        if (!ok && j < k && canPlaceRun(i, hint[j])) {
            ok = reach(i + hint[j] + 1, j + 1);
        }
        memo.set(key, ok);
        return ok;
    };

    if (!reach(0, 0)) return null;

    const canFill = new Array(n).fill(false);
    const canEmpty = new Array(n).fill(false);
    const visited = new Set<number>();
    const stack: [number, number][] = [[0, 0]];
    while (stack.length > 0) {
        const [i, j] = stack.pop()!;
        const key = i * (k + 1) + j;
        if (i >= n || visited.has(key)) continue;
        visited.add(key);

        if (line[i] !== FILLED && reach(i + 1, j)) {
            canEmpty[i] = true;
            stack.push([i + 1, j]);
        }
        if (j < k && canPlaceRun(i, hint[j]) && reach(i + hint[j] + 1, j + 1)) {
            const end = i + hint[j];
            for (let x = i; x < end; x++) canFill[x] = true;
            if (end < n) canEmpty[end] = true;
            stack.push([end + 1, j + 1]);
        }
    }

    return line.map((cell, i) => {
        if (cell !== UNKNOWN) return cell;
        if (canFill[i] && !canEmpty[i]) return FILLED;
        if (canEmpty[i] && !canFill[i]) return EMPTY;
        return UNKNOWN;
    });
}

export type SolveResult =
    | { status: "unique"; solution: Grid }
    | { status: "multiple" }
    | { status: "none" }
    | { status: "too-complex" };

class BudgetExceeded extends Error {}

/**
 * Determines whether the hints describe exactly one picture.
 * Uses line-by-line constraint propagation and falls back to guessing
 * (with backtracking) only when propagation gets stuck. Stops as soon as a
 * second solution is found, or when the work budget runs out.
 */
export function analyzePuzzle(
    rowHints: Hints,
    colHints: Hints,
    budget = 20000
): SolveResult {
    const rows = rowHints.length;
    const cols = colHints.length;
    let lineSolves = 0;
    const solutions: number[][][] = [];

    const getRow = (g: number[][], r: number) => g[r];
    const getCol = (g: number[][], c: number) => g.map((row) => row[c]);

    // Returns false on contradiction. Mutates g.
    const propagate = (g: number[][]): boolean => {
        const dirtyRows = new Set<number>(Array.from({ length: rows }, (_, i) => i));
        const dirtyCols = new Set<number>(Array.from({ length: cols }, (_, i) => i));
        while (dirtyRows.size > 0 || dirtyCols.size > 0) {
            for (const r of dirtyRows) {
                dirtyRows.delete(r);
                if (++lineSolves > budget) throw new BudgetExceeded();
                const solved = solveLine(getRow(g, r), rowHints[r]);
                if (!solved) return false;
                for (let c = 0; c < cols; c++) {
                    if (g[r][c] !== solved[c]) {
                        g[r][c] = solved[c];
                        dirtyCols.add(c);
                    }
                }
            }
            for (const c of dirtyCols) {
                dirtyCols.delete(c);
                if (++lineSolves > budget) throw new BudgetExceeded();
                const solved = solveLine(getCol(g, c), colHints[c]);
                if (!solved) return false;
                for (let r = 0; r < rows; r++) {
                    if (g[r][c] !== solved[r]) {
                        g[r][c] = solved[r];
                        dirtyRows.add(r);
                    }
                }
            }
        }
        return true;
    };

    const search = (g: number[][]) => {
        if (!propagate(g)) return;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (g[r][c] === UNKNOWN) {
                    for (const guess of [FILLED, EMPTY]) {
                        const copy = g.map((row) => [...row]);
                        copy[r][c] = guess;
                        search(copy);
                        if (solutions.length > 1) return;
                    }
                    return;
                }
            }
        }
        solutions.push(g);
    };

    try {
        search(Array.from({ length: rows }, () => Array(cols).fill(UNKNOWN)));
    } catch (e) {
        if (e instanceof BudgetExceeded) return { status: "too-complex" };
        throw e;
    }

    if (solutions.length === 0) return { status: "none" };
    if (solutions.length > 1) return { status: "multiple" };
    return {
        status: "unique",
        solution: solutions[0].map((row) => row.map((cell) => cell === FILLED)),
    };
}
