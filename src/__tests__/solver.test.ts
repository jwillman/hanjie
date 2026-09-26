import { describe, expect, it } from "vitest";
import { analyzePuzzle, solveLine } from "../solver";
import { getColumnHints, getRowHints } from "../utils";

const U = -1;

describe("solveLine", () => {
    it("fills the overlap of a long run", () => {
        expect(solveLine([U, U, U, U, U], [4])).toEqual([U, 1, 1, 1, U]);
    });
    it("fills a line that fits exactly", () => {
        expect(solveLine([U, U, U, U, U], [2, 2])).toEqual([1, 1, 0, 1, 1]);
    });
    it("empties a line with no runs", () => {
        expect(solveLine([U, U, U], [])).toEqual([0, 0, 0]);
    });
    it("uses known cells", () => {
        expect(solveLine([U, 1, U, U, U], [2])).toEqual([U, 1, U, 0, 0]);
    });
    it("detects contradictions", () => {
        expect(solveLine([1, 1, 1], [2])).toBeNull();
    });
});

function fromStrings(rows: string[]) {
    return rows.map((r) => [...r].map((ch) => ch === "#"));
}

describe("analyzePuzzle", () => {
    it("finds a unique solution", () => {
        const grid = fromStrings([
            ".###.",
            "#...#",
            "#####",
            "#...#",
            "#...#",
        ]);
        const result = analyzePuzzle(getRowHints(grid), getColumnHints(grid));
        expect(result).toEqual({ status: "unique", solution: grid });
    });

    it("detects multiple solutions", () => {
        const grid = fromStrings(["#.", ".#"]);
        expect(analyzePuzzle(getRowHints(grid), getColumnHints(grid)).status).toBe("multiple");
    });

    it("detects impossible hints", () => {
        expect(analyzePuzzle([[2], [2]], [[1], [0]]).status).toBe("none");
    });

    it("respects column hints, not just column totals", () => {
        // Row patterns alone allow the columns [1,1] vs [2]; the solver must tell them apart.
        const grid = fromStrings(["#..", "...", "#.."]);
        const result = analyzePuzzle(getRowHints(grid), getColumnHints(grid));
        expect(result.status).toBe("unique");
    });

    it("gives up on puzzles that exceed the budget", () => {
        const grid = fromStrings(["#.", ".#"]);
        expect(analyzePuzzle(getRowHints(grid), getColumnHints(grid), 1).status).toBe("too-complex");
    });

    it("handles a 25x25 drawing quickly", () => {
        const grid = Array.from({ length: 25 }, (_, r) =>
            Array.from({ length: 25 }, (_, c) => (r * 7 + c * 3) % 5 < 2 || r === c)
        );
        const start = performance.now();
        const result = analyzePuzzle(getRowHints(grid), getColumnHints(grid));
        expect(["unique", "multiple", "too-complex"]).toContain(result.status);
        expect(performance.now() - start).toBeLessThan(2000);
    });
});
