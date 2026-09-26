import React, { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import Board from "./Board";
import { Board as BoardState, CellState, EMPTY, FILLED, Grid, MARKED } from "./types";
import { boardToGrid, createGrid, getColumnHints, getRowHints, matchesHints } from "./utils";

type Tool = typeof FILLED | typeof MARKED;
type Result = "correct" | "incorrect" | null;

const SolvePuzzle: React.FC<{ puzzle: Grid }> = ({ puzzle }) => {
    const rows = puzzle.length;
    const cols = puzzle[0].length;
    const rowHints = useMemo(() => getRowHints(puzzle), [puzzle]);
    const colHints = useMemo(() => getColumnHints(puzzle), [puzzle]);

    const [board, setBoard] = useState<BoardState>(() =>
        createGrid<CellState>(rows, cols, EMPTY)
    );
    const [tool, setTool] = useState<Tool>(FILLED);
    const [result, setResult] = useState<Result>(null);

    const paint = (row: number, col: number, state: CellState) => {
        setBoard((prev) => {
            if (prev[row][col] === state) return prev;
            const next = prev.map((r) => [...r]);
            next[row][col] = state;
            return next;
        });
        setResult(null);
    };

    // Primary button uses the selected tool, secondary always marks.
    // A stroke that starts on a cell already in that state clears instead.
    const getStrokeState = (start: CellState, button: number): CellState | null => {
        const target = button === 2 ? MARKED : button === 0 ? tool : null;
        if (target === null) return null;
        return start === target ? EMPTY : target;
    };

    const checkSolution = () => {
        if (matchesHints(boardToGrid(board), rowHints, colHints)) {
            setResult("correct");
            confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
        } else {
            setResult("incorrect");
        }
    };

    return (
        <div className="page">
            <Board
                board={board}
                rowHints={rowHints}
                colHints={colHints}
                getStrokeState={getStrokeState}
                onPaint={paint}
            />
            <p className="status" role="status">
                {result === "correct" && (
                    <span className="status-ok">Congratulations! You've solved it!</span>
                )}
                {result === "incorrect" && (
                    <span className="status-error">Not correct. Keep trying!</span>
                )}
            </p>
            <div className="controls">
                <div className="tool-toggle" role="group" aria-label="Tool">
                    <button
                        className={tool === FILLED ? "active" : ""}
                        aria-pressed={tool === FILLED}
                        onClick={() => setTool(FILLED)}
                    >
                        Fill
                    </button>
                    <button
                        className={tool === MARKED ? "active" : ""}
                        aria-pressed={tool === MARKED}
                        onClick={() => setTool(MARKED)}
                    >
                        Mark empty
                    </button>
                </div>
                <button
                    onClick={() => {
                        setBoard(createGrid<CellState>(rows, cols, EMPTY));
                        setResult(null);
                    }}
                >
                    Reset
                </button>
                <button onClick={checkSolution}>Check the solution</button>
            </div>
            <div className="info-text">
                <p>Controls:</p>
                <ul>
                    <li>Click or drag: use the selected tool</li>
                    <li>Right-click: mark a cell as empty</li>
                    <li>Click a cell again to clear it</li>
                </ul>
            </div>
        </div>
    );
};

export default SolvePuzzle;
