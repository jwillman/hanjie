import React, { useMemo, useState } from "react";
import Board from "./Board";
import { buildPuzzleLink, DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from "./encoding";
import { Board as BoardState, CellState, EMPTY, FILLED } from "./types";
import { useSolvability, Solvability } from "./useSolvability";
import { boardToGrid, createGrid, getColumnHints, getRowHints } from "./utils";

const SIZES: number[] = [];
for (let s = MIN_SIZE; s <= MAX_SIZE; s += 5) SIZES.push(s);

const STATUS_TEXT: Record<Solvability, { text: string; className: string }> = {
    checking: { text: "Checking the puzzle…", className: "status-info" },
    unique: { text: "This puzzle has a unique solution.", className: "status-ok" },
    multiple: {
        text: "These hints have more than one solution, so players could find a different picture. Try adding or removing cells.",
        className: "status-warn",
    },
    none: { text: "These hints have no solution.", className: "status-error" },
    "too-complex": {
        text: "This puzzle is too complex to check automatically.",
        className: "status-warn",
    },
};

function resizeBoard(board: BoardState, rows: number, cols: number): BoardState {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => board[r]?.[c] ?? EMPTY)
    );
}

const CreatePuzzle: React.FC = () => {
    const [board, setBoard] = useState<BoardState>(() =>
        createGrid<CellState>(DEFAULT_SIZE, DEFAULT_SIZE, EMPTY)
    );
    const rows = board.length;
    const cols = board[0].length;

    const grid = useMemo(() => boardToGrid(board), [board]);
    const rowHints = useMemo(() => getRowHints(grid), [grid]);
    const colHints = useMemo(() => getColumnHints(grid), [grid]);
    const solvability = useSolvability(rowHints, colHints);
    const isEmpty = grid.every((row) => row.every((cell) => !cell));
    const link = useMemo(
        () => buildPuzzleLink(window.location.href, grid),
        [grid]
    );

    const paint = (row: number, col: number, state: CellState) =>
        setBoard((prev) => {
            if (prev[row][col] === state) return prev;
            const next = prev.map((r) => [...r]);
            next[row][col] = state;
            return next;
        });

    const status = isEmpty
        ? { text: "Draw a picture to create a puzzle.", className: "status-info" }
        : STATUS_TEXT[solvability];

    return (
        <div className="page">
            <Board
                board={board}
                rowHints={rowHints}
                colHints={colHints}
                getStrokeState={(start, button) =>
                    button === 0 ? (start === FILLED ? EMPTY : FILLED) : null
                }
                onPaint={paint}
            />
            <p className={`status ${status.className}`} role="status">
                {status.text}
            </p>
            <div className="controls">
                <label>
                    Width{" "}
                    <select
                        value={cols}
                        onChange={(e) => setBoard(resizeBoard(board, rows, Number(e.target.value)))}
                    >
                        {SIZES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Height{" "}
                    <select
                        value={rows}
                        onChange={(e) => setBoard(resizeBoard(board, Number(e.target.value), cols))}
                    >
                        {SIZES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </label>
                <button onClick={() => setBoard(createGrid<CellState>(rows, cols, EMPTY))}>
                    Reset
                </button>
                {isEmpty ? (
                    <span className="link-disabled">Get link to the puzzle</span>
                ) : (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        Get link to the puzzle
                    </a>
                )}
            </div>
        </div>
    );
};

export default CreatePuzzle;
