import { describe, expect, it } from "vitest";
import { buildPuzzleLink, decodePuzzle, encodePuzzle, parsePuzzleLink } from "../encoding";

const puzzle = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => (r * 3 + c) % 4 === 0)
);

describe("encoding", () => {
    it("round-trips a rectangular puzzle", () => {
        expect(decodePuzzle(encodePuzzle(puzzle), 7, 9)).toEqual(puzzle);
    });
    it("throws on invalid Base64", () => {
        expect(() => decodePuzzle("!!!", 7, 9)).toThrow();
    });
    it("throws on truncated data", () => {
        expect(() => decodePuzzle(encodePuzzle(puzzle).slice(0, 4), 7, 9)).toThrow();
    });
});

describe("parsePuzzleLink", () => {
    it("parses a link built by buildPuzzleLink", () => {
        const link = new URL(buildPuzzleLink("https://example.com/?mode=create", puzzle));
        expect(parsePuzzleLink(link.search)).toEqual({ kind: "solve", puzzle });
    });
    it("defaults to 15x15 for old links without a size", () => {
        const square = Array.from({ length: 15 }, (_, r) => Array.from({ length: 15 }, (_, c) => r === c));
        const search = `?mode=solve&p=${encodeURIComponent(encodePuzzle(square))}`;
        expect(parsePuzzleLink(search)).toEqual({ kind: "solve", puzzle: square });
    });
    it("reports broken links instead of throwing", () => {
        expect(parsePuzzleLink("?mode=solve&p=abc").kind).toBe("error");
        expect(parsePuzzleLink("?mode=solve").kind).toBe("error");
        expect(parsePuzzleLink("?mode=solve&p=AA&w=1000").kind).toBe("error");
    });
    it("uses create mode without mode=solve", () => {
        expect(parsePuzzleLink("")).toEqual({ kind: "create" });
    });
});
