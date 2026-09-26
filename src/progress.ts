import { encodePuzzle } from "./encoding";
import { isValidBoard, loadJSON, removeKey, saveJSON } from "./storage";
import { Board, Grid } from "./types";

export const CREATE_KEY = "hanjie:create";

export interface SolveProgress {
    board: Board;
    elapsedMs: number;
    solved: boolean;
}

function solveKey(puzzle: Grid): string {
    return `hanjie:solve:${puzzle[0].length}x${puzzle.length}:${encodePuzzle(puzzle)}`;
}

export function loadSolveProgress(puzzle: Grid): SolveProgress | null {
    const saved = loadJSON<SolveProgress>(solveKey(puzzle));
    if (!saved || !isValidBoard(saved.board, puzzle.length, puzzle[0].length)) {
        return null;
    }
    return {
        board: saved.board,
        elapsedMs: Number.isFinite(saved.elapsedMs) ? saved.elapsedMs : 0,
        solved: saved.solved === true,
    };
}

export function saveSolveProgress(puzzle: Grid, progress: SolveProgress): void {
    saveJSON(solveKey(puzzle), progress);
}

export function clearSolveProgress(puzzle: Grid): void {
    removeKey(solveKey(puzzle));
}

export function loadCreateBoard(): Board | null {
    const saved = loadJSON<unknown>(CREATE_KEY);
    return isValidBoard(saved) ? saved : null;
}

export function saveCreateBoard(board: Board): void {
    saveJSON(CREATE_KEY, board);
}
