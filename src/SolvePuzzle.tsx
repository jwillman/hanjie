import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import Board, { PRIMARY, SECONDARY } from "./Board";
import { clearSolveProgress, loadSolveProgress, saveSolveProgress } from "./progress";
import { CellState, EMPTY, FILLED, Grid, MARKED } from "./types";
import { useBoardHistory, useUndoShortcuts } from "./useHistory";
import { boardToGrid, createGrid, getColumnHints, getHanjieHints, getRowHints, matchesHints } from "./utils";

type Tool = typeof FILLED | typeof MARKED;

const sameHints = (a: number[], b: number[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

function formatTime(ms: number): string {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = String(total % 60).padStart(2, "0");
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

const noop = () => {};

const SolvePuzzle: React.FC<{ puzzle: Grid }> = ({ puzzle }) => {
    const rows = puzzle.length;
    const cols = puzzle[0].length;
    const rowHints = useMemo(() => getRowHints(puzzle), [puzzle]);
    const colHints = useMemo(() => getColumnHints(puzzle), [puzzle]);
    const saved = useMemo(() => loadSolveProgress(puzzle), [puzzle]);
    const emptyBoard = useCallback(() => createGrid<CellState>(rows, cols, EMPTY), [rows, cols]);

    const history = useBoardHistory(() => saved?.board ?? emptyBoard());
    const { board, setBoard } = history;
    const [tool, setTool] = useState<Tool>(FILLED);
    const [solved, setSolved] = useState(saved?.solved ?? false);
    const [showMistakes, setShowMistakes] = useState(false);
    useUndoShortcuts(solved ? noop : history.undo, solved ? noop : history.redo);

    // Timer: time banked so far, plus the running period if any. It starts
    // on the first move and pauses while the page is hidden.
    const [banked, setBanked] = useState(saved?.elapsedMs ?? 0);
    const [runningSince, setRunningSince] = useState<number | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const elapsed = banked + (runningSince !== null ? now - runningSince : 0);
    const elapsedRef = useRef(elapsed);
    elapsedRef.current = elapsed;

    const runningRef = useRef(runningSince);
    runningRef.current = runningSince;

    const pauseTimer = useCallback(() => {
        const since = runningRef.current;
        if (since === null) return;
        runningRef.current = null;
        setBanked((b) => b + Date.now() - since);
        setRunningSince(null);
    }, []);

    useEffect(() => {
        if (runningSince === null) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [runningSince]);

    // Save progress whenever the board changes and when the page is hidden
    useEffect(() => {
        saveSolveProgress(puzzle, { board, solved, elapsedMs: elapsedRef.current });
    }, [puzzle, board, solved]);

    useEffect(() => {
        const onHide = () => {
            if (document.visibilityState !== "hidden") return;
            pauseTimer();
            saveSolveProgress(puzzle, { board, solved, elapsedMs: elapsedRef.current });
        };
        document.addEventListener("visibilitychange", onHide);
        return () => document.removeEventListener("visibilitychange", onHide);
    }, [puzzle, board, solved, pauseTimer]);

    // Detect the moment the puzzle is solved. Any grid that matches the
    // hints counts, even if it differs from the creator's drawing.
    useEffect(() => {
        if (solved || !matchesHints(boardToGrid(board), rowHints, colHints)) return;
        setSolved(true);
        pauseTimer();
        confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
    }, [board, solved, rowHints, colHints, pauseTimer]);

    const startStroke = () => {
        if (runningSince === null) {
            setRunningSince(Date.now());
            setNow(Date.now());
        }
        history.beginStroke();
    };

    // Primary button uses the selected tool, secondary always marks.
    // A stroke that starts on a cell already in that state clears instead.
    const getStrokeState = (start: CellState, button: number): CellState | null => {
        const target = button === SECONDARY ? MARKED : button === PRIMARY ? tool : null;
        if (target === null) return null;
        return start === target ? EMPTY : target;
    };

    const playAgain = () => {
        clearSolveProgress(puzzle);
        setBoard(emptyBoard());
        setSolved(false);
        setBanked(0);
        setRunningSince(null);
    };

    const filled = boardToGrid(board);
    const rowDone = filled.map((row, r) => sameHints(getHanjieHints(row), rowHints[r]));
    const colDone = colHints.map((hints, c) =>
        sameHints(getHanjieHints(filled.map((row) => row[c])), hints)
    );

    const isMistake = (r: number, c: number) =>
        (board[r][c] === FILLED && !puzzle[r][c]) || (board[r][c] === MARKED && puzzle[r][c]);
    const mistakeCount = showMistakes
        ? board.reduce((n, row, r) => n + row.filter((_, c) => isMistake(r, c)).length, 0)
        : 0;

    return (
        <main className="page">
            <div className="solve-header">
                <span className="timer" aria-label={`Time ${formatTime(elapsed)}`}>
                    {formatTime(elapsed)}
                </span>
            </div>
            <Board
                board={board}
                rowHints={rowHints}
                colHints={colHints}
                getStrokeState={getStrokeState}
                onPaint={history.paint}
                onStrokeStart={startStroke}
                onStrokeEnd={history.endStroke}
                readOnly={solved}
                rowDone={rowDone}
                colDone={colDone}
                cellClass={showMistakes && !solved ? (r, c) => (isMistake(r, c) ? "mistake" : "") : undefined}
                className={solved ? "solved" : ""}
            />
            <div className="status" role="status">
                {solved ? (
                    <span className="status-ok">
                        Congratulations! You solved it in {formatTime(elapsed)}.
                    </span>
                ) : showMistakes ? (
                    <span className={mistakeCount > 0 ? "status-error" : "status-ok"}>
                        {mistakeCount === 0
                            ? "No mistakes so far."
                            : `${mistakeCount} ${mistakeCount === 1 ? "cell is" : "cells are"} wrong.`}
                    </span>
                ) : null}
            </div>

            {solved ? (
                <div className="toolbar">
                    <button className="primary" onClick={playAgain}>Play again</button>
                    <a href={`${window.location.pathname}?mode=examples`}>More puzzles</a>
                    <a href={window.location.pathname}>Create your own</a>
                </div>
            ) : (
                <>
                    <div className="toolbar">
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
                        <div className="group">
                            <button onClick={history.undo} disabled={!history.canUndo} title="Undo (Ctrl+Z)">
                                Undo
                            </button>
                            <button onClick={history.redo} disabled={!history.canRedo} title="Redo (Ctrl+Shift+Z)">
                                Redo
                            </button>
                            <button onClick={() => setBoard(emptyBoard())}>Clear</button>
                        </div>
                        <label className="inline-toggle">
                            <input
                                type="checkbox"
                                checked={showMistakes}
                                onChange={(e) => setShowMistakes(e.target.checked)}
                            />{" "}
                            Show mistakes
                        </label>
                    </div>
                    <details className="info-text">
                        <summary>Controls</summary>
                        <ul>
                            <li>Click or drag: use the selected tool</li>
                            <li>Right-click: mark a cell as empty</li>
                            <li>Click a cell again to clear it</li>
                            <li>Keyboard: arrow keys move, Space fills, X marks, Delete clears, Shift+arrow extends</li>
                            <li>Ctrl+Z / Ctrl+Shift+Z: undo / redo</li>
                        </ul>
                    </details>
                </>
            )}
        </main>
    );
};

export default SolvePuzzle;
