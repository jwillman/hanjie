import React, { useEffect, useRef } from "react";
import { Board as BoardState, CellState, EMPTY, FILLED, Hints, MARKED } from "./types";

interface BoardProps {
    board: BoardState;
    rowHints: Hints;
    colHints: Hints;
    // Decides what a stroke paints, from the cell it starts on and the
    // pointer button (0 = primary, 2 = secondary). null ignores the press.
    getStrokeState: (start: CellState, button: number) => CellState | null;
    onPaint: (row: number, col: number, state: CellState) => void;
}

const CELL_CLASS: Record<CellState, string> = {
    [EMPTY]: "",
    [FILLED]: "filled",
    [MARKED]: "marked",
};

function cellFromPoint(x: number, y: number): [number, number] | null {
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

const Board: React.FC<BoardProps> = ({
    board,
    rowHints,
    colHints,
    getStrokeState,
    onPaint,
}) => {
    const rows = board.length;
    const cols = board[0].length;
    // State painted by the stroke in progress, and the last cell it touched
    const stroke = useRef<{ state: CellState; last: string } | null>(null);

    useEffect(() => {
        const end = () => (stroke.current = null);
        window.addEventListener("pointerup", end);
        window.addEventListener("pointercancel", end);
        return () => {
            window.removeEventListener("pointerup", end);
            window.removeEventListener("pointercancel", end);
        };
    }, []);

    const paintAt = (x: number, y: number) => {
        const cell = cellFromPoint(x, y);
        if (!stroke.current || !cell) return;
        const key = cell.join("-");
        if (key === stroke.current.last) return;
        stroke.current.last = key;
        onPaint(cell[0], cell[1], stroke.current.state);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        const cell = cellFromPoint(e.clientX, e.clientY);
        if (!cell) return;
        e.preventDefault();
        // Touch pointers are captured by the start cell; release so the
        // stroke can move across cells.
        (e.target as Element).releasePointerCapture?.(e.pointerId);
        const state = getStrokeState(board[cell[0]][cell[1]], e.button);
        if (state === null) return;
        stroke.current = { state, last: "" };
        paintAt(e.clientX, e.clientY);
    };

    const style = { "--rows": rows, "--cols": cols } as React.CSSProperties;

    return (
        <div className="board" style={style}>
            <div className="column-hints">
                {colHints.map((hints, c) => (
                    <div key={c} className="column-hint">
                        <HintList hints={hints} />
                    </div>
                ))}
            </div>
            <div className="row-hints">
                {rowHints.map((hints, r) => (
                    <div key={r} className="row-hint">
                        <HintList hints={hints} />
                    </div>
                ))}
            </div>
            <div
                className="grid"
                onPointerDown={handlePointerDown}
                onPointerMove={(e) => paintAt(e.clientX, e.clientY)}
                onContextMenu={(e) => e.preventDefault()}
            >
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const classes = ["cell", CELL_CLASS[cell]];
                        if ((r + 1) % 5 === 0 && r + 1 !== rows) classes.push("thick-bottom");
                        if ((c + 1) % 5 === 0 && c + 1 !== cols) classes.push("thick-right");
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
        </div>
    );
};

export default Board;
