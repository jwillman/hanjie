import { describe, expect, it } from "vitest";
import { getColumnHints, getHanjieHints, getRowHints, matchesHints } from "../utils";

describe("getHanjieHints", () => {
    it("counts runs of filled cells", () => {
        expect(getHanjieHints([true, true, false, true, false, false, true])).toEqual([2, 1, 1]);
    });
    it("returns an empty list for an empty line", () => {
        expect(getHanjieHints([false, false])).toEqual([]);
    });
});

describe("matchesHints", () => {
    const grid = [
        [true, false],
        [false, true],
    ];
    const rowHints = getRowHints(grid);
    const colHints = getColumnHints(grid);

    it("accepts the original grid", () => {
        expect(matchesHints(grid, rowHints, colHints)).toBe(true);
    });
    it("accepts a different grid that satisfies the same hints", () => {
        const other = [
            [false, true],
            [true, false],
        ];
        expect(matchesHints(other, rowHints, colHints)).toBe(true);
    });
    it("rejects a grid that breaks the hints", () => {
        expect(matchesHints([[true, true], [false, false]], rowHints, colHints)).toBe(false);
    });
});
