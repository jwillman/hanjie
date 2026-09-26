import { useCallback, useEffect, useReducer } from "react";
import { Board, CellState } from "./types";

const MAX_HISTORY = 200;

export interface HistoryState {
    past: Board[];
    present: Board;
    future: Board[];
    // Board as it was when the current stroke started
    strokeBase: Board | null;
}

export type HistoryAction =
    | { type: "begin" }
    | { type: "paint"; row: number; col: number; value: CellState }
    | { type: "end" }
    | { type: "set"; board: Board }
    | { type: "undo" }
    | { type: "redo" };

function push(past: Board[], board: Board): Board[] {
    return [...past, board].slice(-MAX_HISTORY);
}

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
    switch (action.type) {
        case "begin":
            return { ...state, strokeBase: state.present };
        case "paint": {
            const { row, col, value } = action;
            if (state.present[row][col] === value) return state;
            const present = state.present.map((r) => [...r]);
            present[row][col] = value;
            // A paint outside a stroke is its own undo step
            if (state.strokeBase === null) {
                return { ...state, past: push(state.past, state.present), present, future: [] };
            }
            return { ...state, present };
        }
        case "end":
            if (state.strokeBase === null) return state;
            if (state.strokeBase === state.present) return { ...state, strokeBase: null };
            return {
                past: push(state.past, state.strokeBase),
                present: state.present,
                future: [],
                strokeBase: null,
            };
        case "set":
            if (action.board === state.present) return state;
            return {
                past: push(state.past, state.present),
                present: action.board,
                future: [],
                strokeBase: null,
            };
        case "undo":
            if (state.past.length === 0) return state;
            return {
                past: state.past.slice(0, -1),
                present: state.past[state.past.length - 1],
                future: [state.present, ...state.future],
                strokeBase: null,
            };
        case "redo":
            if (state.future.length === 0) return state;
            return {
                past: push(state.past, state.present),
                present: state.future[0],
                future: state.future.slice(1),
                strokeBase: null,
            };
    }
}

// Board state with undo/redo. A whole drag stroke is one undo step.
export function useBoardHistory(init: () => Board) {
    const [state, dispatch] = useReducer(historyReducer, undefined, () => ({
        past: [],
        present: init(),
        future: [],
        strokeBase: null,
    }));

    return {
        board: state.present,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        beginStroke: useCallback(() => dispatch({ type: "begin" }), []),
        endStroke: useCallback(() => dispatch({ type: "end" }), []),
        paint: useCallback(
            (row: number, col: number, value: CellState) =>
                dispatch({ type: "paint", row, col, value }),
            []
        ),
        setBoard: useCallback((board: Board) => dispatch({ type: "set", board }), []),
        undo: useCallback(() => dispatch({ type: "undo" }), []),
        redo: useCallback(() => dispatch({ type: "redo" }), []),
    };
}

// Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z and Ctrl+Y redo.
export function useUndoShortcuts(undo: () => void, redo: () => void) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
            const target = e.target as HTMLElement | null;
            if (target?.tagName === "INPUT" && (target as HTMLInputElement).type === "text") return;
            const key = e.key.toLowerCase();
            if (key === "z" && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if ((key === "z" && e.shiftKey) || key === "y") {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [undo, redo]);
}
