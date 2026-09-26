import React, { useCallback, useEffect, useMemo, useState } from "react";
import Board, { PRIMARY } from "./Board";
import ImageImport from "./ImageImport";
import { buildPuzzleLink, DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from "./encoding";
import { loadCreateBoard, saveCreateBoard } from "./progress";
import { Board as BoardState, CellState, EMPTY, FILLED, Grid } from "./types";
import { useBoardHistory, useUndoShortcuts } from "./useHistory";
import { Solvability, useSolvability } from "./useSolvability";
import { useNotice } from "./useNotice";
import { boardToGrid, createGrid, getColumnHints, getRowHints } from "./utils";

const SIZES: number[] = [];
for (let s = MIN_SIZE; s <= MAX_SIZE; s++) SIZES.push(s);

const STATUS_TEXT: Record<Solvability["status"], { text: string; className: string }> = {
    checking: { text: "Checking the puzzle…", className: "status-info" },
    unique: { text: "This puzzle has a unique solution.", className: "status-ok" },
    multiple: {
        text: "These hints have more than one solution, so players could find a different picture.",
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

const gridToBoard = (grid: Grid): BoardState =>
    grid.map((row) => row.map((cell) => (cell ? FILLED : EMPTY)));

const CreatePuzzle: React.FC = () => {
    const history = useBoardHistory(
        () => loadCreateBoard() ?? createGrid<CellState>(DEFAULT_SIZE, DEFAULT_SIZE, EMPTY)
    );
    const { board, setBoard, undo, redo } = history;
    useUndoShortcuts(undo, redo);
    useEffect(() => saveCreateBoard(board), [board]);

    const [preview, setPreview] = useState<Grid | null>(null);
    const [showAmbiguous, setShowAmbiguous] = useState(false);
    const { notice, showNotice } = useNotice();

    const rows = board.length;
    const cols = board[0].length;
    const grid = useMemo(() => boardToGrid(board), [board]);
    const rowHints = useMemo(() => getRowHints(preview ?? grid), [preview, grid]);
    const colHints = useMemo(() => getColumnHints(preview ?? grid), [preview, grid]);
    const solvability = useSolvability(rowHints, colHints);
    const isEmpty = grid.every((row) => row.every((cell) => !cell));
    const link = useMemo(() => buildPuzzleLink(window.location.href, grid), [grid]);

    // Cells where another picture that fits the same hints differs
    const ambiguous = useMemo(() => {
        if (solvability.status !== "multiple" || preview) return null;
        const alt = solvability.solutions.find((s) =>
            s.some((row, r) => row.some((cell, c) => cell !== grid[r][c]))
        );
        return alt ? alt.map((row, r) => row.map((cell, c) => cell !== grid[r][c])) : null;
    }, [solvability, grid, preview]);

    const status = isEmpty && !preview
        ? { text: "Draw a picture, or import one, to create a puzzle.", className: "status-info" }
        : STATUS_TEXT[solvability.status];

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(link);
            showNotice("Link copied to the clipboard.");
        } catch {
            window.prompt("Copy this link:", link);
        }
    };

    const shareLink = async () => {
        try {
            await navigator.share({ title: "Hanjie puzzle", text: "Can you solve this puzzle?", url: link });
        } catch {
            // cancelled by the user
        }
    };

    const onPreview = useCallback((g: Grid | null) => setPreview(g), []);

    return (
        <main className="page">
            <Board
                board={preview ? gridToBoard(preview) : board}
                rowHints={rowHints}
                colHints={colHints}
                getStrokeState={(start, button) =>
                    button === PRIMARY ? (start === FILLED ? EMPTY : FILLED) : null
                }
                onPaint={history.paint}
                onStrokeStart={history.beginStroke}
                onStrokeEnd={history.endStroke}
                readOnly={preview !== null}
                cellClass={
                    showAmbiguous && ambiguous
                        ? (r, c) => (ambiguous[r][c] ? "ambiguous" : "")
                        : undefined
                }
                className={preview ? "previewing" : ""}
            />
            <div className={`status ${status.className}`} role="status">
                {preview ? "Previewing the imported image." : status.text}
                {ambiguous && (
                    <label className="inline-toggle">
                        <input
                            type="checkbox"
                            checked={showAmbiguous}
                            onChange={(e) => setShowAmbiguous(e.target.checked)}
                        />{" "}
                        Show the cells that can differ
                    </label>
                )}
            </div>

            <div className="toolbar">
                <div className="group">
                    <button onClick={undo} disabled={!history.canUndo} title="Undo (Ctrl+Z)">
                        Undo
                    </button>
                    <button onClick={redo} disabled={!history.canRedo} title="Redo (Ctrl+Shift+Z)">
                        Redo
                    </button>
                    <button
                        onClick={() => setBoard(createGrid<CellState>(rows, cols, EMPTY))}
                        disabled={isEmpty}
                    >
                        Clear
                    </button>
                </div>
                <div className="group">
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
                </div>
                <ImageImport
                    rows={rows}
                    cols={cols}
                    onPreview={onPreview}
                    onApply={(g) => setBoard(gridToBoard(g))}
                />
            </div>

            <div className="toolbar">
                <button className="primary" onClick={copyLink} disabled={isEmpty}>
                    Copy link
                </button>
                {"share" in navigator && (
                    <button onClick={shareLink} disabled={isEmpty}>
                        Share…
                    </button>
                )}
                {isEmpty ? (
                    <span className="link-disabled">Solve it yourself</span>
                ) : (
                    <a href={link}>Solve it yourself</a>
                )}
            </div>
            <div className="notice" role="status" aria-live="polite">
                {notice}
            </div>
        </main>
    );
};

export default CreatePuzzle;
