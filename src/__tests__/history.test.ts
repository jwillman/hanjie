import { describe, expect, it } from "vitest";
import { HistoryAction, HistoryState, historyReducer } from "../useHistory";
import { Board, EMPTY, FILLED } from "../types";

const empty: Board = [[EMPTY, EMPTY, EMPTY]];
const start: HistoryState = { past: [], present: empty, future: [], strokeBase: null };
const run = (actions: HistoryAction[], state = start) => actions.reduce(historyReducer, state);

describe("historyReducer", () => {
    it("treats a whole stroke as one undo step", () => {
        const s = run([
            { type: "begin" },
            { type: "paint", row: 0, col: 0, value: FILLED },
            { type: "paint", row: 0, col: 1, value: FILLED },
            { type: "end" },
        ]);
        expect(s.present).toEqual([[FILLED, FILLED, EMPTY]]);
        expect(s.past).toHaveLength(1);
        expect(run([{ type: "undo" }], s).present).toEqual(empty);
    });

    it("redoes what was undone and clears redo on a new change", () => {
        const painted = run([{ type: "paint", row: 0, col: 2, value: FILLED }]);
        const undone = run([{ type: "undo" }], painted);
        expect(run([{ type: "redo" }], undone).present).toEqual(painted.present);
        const changed = run([{ type: "set", board: [[FILLED, EMPTY, EMPTY]] }], undone);
        expect(changed.future).toEqual([]);
    });

    it("ignores strokes that change nothing", () => {
        const s = run([
            { type: "begin" },
            { type: "paint", row: 0, col: 0, value: EMPTY },
            { type: "end" },
        ]);
        expect(s.past).toHaveLength(0);
    });

    it("does nothing when there is nothing to undo or redo", () => {
        expect(run([{ type: "undo" }, { type: "redo" }])).toEqual(start);
    });
});
