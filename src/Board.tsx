import React, { useEffect, useRef, useState } from "react";
import { Board as BoardState, CellState, EMPTY, FILLED, Hints, MARKED } from "./types";

// Pointer buttons, also used for the matching keyboard actions
export const PRIMARY = 0;
export const SECONDARY = 2;

interface BoardProps {
    board: BoardState;
    rowHints: Hints;
    colHints: Hints;
    // Decides what a stroke paints, from the cell it starts on and the
    // button (PRIMARY / SECONDARY). null ignores the press.
    getStrokeState: (start: CellState, button: number) => CellState | null;
    onPaint: (row: number, col: number, state: CellState) => void;
    onStrokeStart?: () => void;
    onStrokeEnd?: () => void;
    readOnly?: boolean;
    // Hints that are already satisfied are dimmed
    rowDone?: boolean[];
    colDone?: boolean[];
    // Extra CSS classes for a cell (mistakes, ambiguous cells, ...)
    cellClass?: (row: number, col: number) => string;
    className?: string;
}

const CELL_CLASS: Record<CellState, string> = {
    [EMPTY]: "",
    [FILLED]: "filled",
    [MARKED]: "marked",
};

const CELL_NAME: Record<CellState, string> = {
    [EMPTY]: "empty",
    [FILLED]: "filled",
    [MARKED]: "marked empty",
};

type Cell = [number, number];

function cellFromPoint(x: number, y: number): Cell | null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const row = el?.dataset.row;
    const col = el?.dataset.col;
    if (row === undefined || col === undefined) return null;
    return [Number(row), Number(col)];
}

const HintList: React.FC<{ hints: number[] }> = ({ hints }) => (
    <>
        {(hints.length > 0 ? hints : [0]).map((hint, idx) => (
            <span key={idx}>{hint}</span>
        ))}
    </>
);

const hintText = (hints: number[]) => (hints.length > 0 ? hints.join(" ") : "0");

const Board: React.FC<BoardProps> = ({
    board,
    rowHints,
    colHints,
    getStrokeState,
    onPaint,
    onStrokeStart,
    onStrokeEnd,
    readOnly = false,
    rowDone,
    colDone,
    cellClass,
    className = "",
}) => {
    const rows = board.length;
    const cols = board[0].length;
    // State painted by the stroke in progress, and the last cell it touched
    const stroke = useRef<{ state: CellState; last: string } | null>(null);
    const [hover, setHover] = useState<Cell | null>(null);
    const [cursor, setCursor] = useState<Cell>([0, 0]);
    const [focused, setFocused] = useState(false);
    // Cell whose state the screen-reader live region describes. The text is
    // derived at render time so it reflects the hints after a change.
    const [announced, setAnnounced] = useState<Cell | null>(null);

    // Keep the keyboard cursor inside the board when it is resized
    const cursorRow = Math.min(cursor[0], rows - 1);
    const cursorCol = Math.min(cursor[1], cols - 1);

    useEffect(() => {
        const end = () => {
            if (stroke.current) {
                stroke.current = null;
                onStrokeEnd?.();
            }
        };
        window.addEventListener("pointerup", end);
        window.addEventListener("pointercancel", end);
        return () => {
            window.removeEventListener("pointerup", end);
            window.removeEventListener("pointercancel", end);
        };
    }, [onStrokeEnd]);

    const paintCell = (cell: Cell) => {
        if (!stroke.current) return;
        const key = cell.join("-");
        if (key === stroke.current.last) return;
        stroke.current.last = key;
        onPaint(cell[0], cell[1], stroke.current.state);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (readOnly) return;
        const cell = cellFromPoint(e.clientX, e.clientY);
        if (!cell) return;
        e.preventDefault();
        // Touch pointers are captured by the start cell; release so the
        // stroke can move across cells.
        (e.target as Element).releasePointerCapture?.(e.pointerId);
        const state = getStrokeState(board[cell[0]][cell[1]], e.button);
        if (state === null) return;
        stroke.current = { state, last: "" };
        setAnnounced(null);
        onStrokeStart?.();
        paintCell(cell);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const cell = cellFromPoint(e.clientX, e.clientY);
        if (e.pointerType === "mouse" && (cell?.[0] !== hover?.[0] || cell?.[1] !== hover?.[1])) {
            setHover(cell);
        }
        if (cell) paintCell(cell);
    };

    const describe = (r: number, c: number, state: CellState) =>
        `Row ${r + 1}, column ${c + 1}: ${CELL_NAME[state]}. ` +
        `Row hints ${hintText(rowHints[r])}. Column hints ${hintText(colHints[c])}.`;

    // Arrow keys move, Space/Enter act like a click, X like a right-click,
    // Delete/Backspace clears. Shift+arrow keeps painting while moving.
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const moves: Record<string, Cell> = {
            ArrowUp: [-1, 0],
            ArrowDown: [1, 0],
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1],
        };
        let [r, c] = [cursorRow, cursorCol];
        let action: CellState | null = null;

        if (moves[e.key]) {
            r = Math.max(0, Math.min(rows - 1, r + moves[e.key][0]));
            c = Math.max(0, Math.min(cols - 1, c + moves[e.key][1]));
            // Extend a line: copy the current cell's state to the next one
            if (e.shiftKey) action = board[cursorRow][cursorCol];
        } else if (e.key === " " || e.key === "Enter") {
            action = getStrokeState(board[r][c], PRIMARY);
        } else if (e.key === "x" || e.key === "X") {
            action = getStrokeState(board[r][c], SECONDARY);
        } else if (e.key === "Delete" || e.key === "Backspace") {
            action = EMPTY;
        } else {
            return;
        }
        e.preventDefault();
        setFocused(true);
        setCursor([r, c]);

        if (action !== null && !readOnly) {
            onStrokeStart?.();
            onPaint(r, c, action);
            onStrokeEnd?.();
        }
        setAnnounced([r, c]);
    };

    // Row/column to highlight: under the mouse, else the keyboard cursor
    const [activeRow, activeCol] = hover ?? (focused ? [cursorRow, cursorCol] : [-1, -1]);
    const style = { "--rows": rows, "--cols": cols } as React.CSSProperties;

    return (
        <div className={`board ${className}`} style={style}>
            <div className="column-hints" aria-hidden="true">
                {colHints.map((hints, c) => (
                    <div
                        key={c}
                        className={`column-hint${colDone?.[c] ? " done" : ""}${c === activeCol ? " active" : ""}`}
                    >
                        <HintList hints={hints} />
                    </div>
                ))}
            </div>
            <div className="row-hints" aria-hidden="true">
                {rowHints.map((hints, r) => (
                    <div
                        key={r}
                        className={`row-hint${rowDone?.[r] ? " done" : ""}${r === activeRow ? " active" : ""}`}
                    >
                        <HintList hints={hints} />
                    </div>
                ))}
            </div>
            <div
                className="grid"
                tabIndex={0}
                role="application"
                aria-label={`Puzzle grid, ${cols} by ${rows}. Use the arrow keys to move, Space to fill, X to mark as empty, Delete to clear.`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerLeave={() => setHover(null)}
                onContextMenu={(e) => e.preventDefault()}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                    // Only keyboard focus shows the cursor; clicks don't focus the grid
                    setFocused(e.target.matches(":focus-visible"));
                    setAnnounced([cursorRow, cursorCol]);
                }}
                onBlur={() => setFocused(false)}
            >
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const classes = ["cell", CELL_CLASS[cell]];
                        if ((r + 1) % 5 === 0 && r + 1 !== rows) classes.push("thick-bottom");
                        if ((c + 1) % 5 === 0 && c + 1 !== cols) classes.push("thick-right");
                        if (r === activeRow || c === activeCol) classes.push("crosshair");
                        if (r === cursorRow && c === cursorCol) classes.push("cursor");
                        const extra = cellClass?.(r, c);
                        if (extra) classes.push(extra);
                        return (
                            <div
                                key={`${r}-${c}`}
                                className={classes.join(" ")}
                                data-row={r}
                                data-col={c}
                            />
                        );
                    })
                )}
            </div>
            <div className="visually-hidden" aria-live="polite">
                {announced && announced[0] < rows && announced[1] < cols
                    ? describe(announced[0], announced[1], board[announced[0]][announced[1]])
                    : ""}
            </div>
        </div>
    );
};

export default Board;
