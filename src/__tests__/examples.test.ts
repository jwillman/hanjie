import { describe, expect, it } from "vitest";
import { EXAMPLES } from "../examples";
import { analyzePuzzle } from "../solver";
import { getColumnHints, getRowHints } from "../utils";

describe("examples", () => {
    it.each(EXAMPLES.map((e) => [e.name, e.grid] as const))(
        "%s has a unique solution",
        (_, grid) => {
            expect(grid.every((row) => row.length === grid[0].length)).toBe(true);
            expect(analyzePuzzle(getRowHints(grid), getColumnHints(grid)).status).toBe("unique");
        }
    );
});
