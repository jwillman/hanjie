import { Grid } from "./types";

export const MIN_SIZE = 5;
export const MAX_SIZE = 25;
export const DEFAULT_SIZE = 15;

// Convert boolean[][] to a compact binary format and then Base64-encode
export function encodePuzzle(puzzle: Grid): string {
    const rows = puzzle.length;
    const cols = puzzle[0].length;

    // Flatten puzzle into a bit array
    const bitCount = rows * cols;
    const bytes = new Uint8Array(Math.ceil(bitCount / 8));
    let bitIndex = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (puzzle[r][c]) {
                const byteIndex = Math.floor(bitIndex / 8);
                const bitPos = bitIndex % 8;
                bytes[byteIndex] |= 1 << bitPos;
            }
            bitIndex++;
        }
    }

    // Base64-encode the bytes
    return btoa(String.fromCharCode(...bytes));
}

// Decode the Base64 puzzle string back into boolean[][].
// Throws if the string is not valid Base64 or has the wrong length.
export function decodePuzzle(encoded: string, rows: number, cols: number): Grid {
    let binaryString: string;
    try {
        binaryString = atob(encoded);
    } catch {
        throw new Error("The puzzle data in the link is not valid.");
    }
    if (binaryString.length !== Math.ceil((rows * cols) / 8)) {
        throw new Error("The puzzle data in the link is incomplete.");
    }

    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const puzzle: Grid = Array.from({ length: rows }, () =>
        Array(cols).fill(false)
    );
    let bitIndex = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const byteIndex = Math.floor(bitIndex / 8);
            const bitPos = bitIndex % 8;
            puzzle[r][c] = (bytes[byteIndex] & (1 << bitPos)) !== 0;
            bitIndex++;
        }
    }

    return puzzle;
}

function parseSize(value: string | null): number {
    if (value === null) return DEFAULT_SIZE; // links made before sizes existed
    const n = Number(value);
    if (!Number.isInteger(n) || n < MIN_SIZE || n > MAX_SIZE) {
        throw new Error("The puzzle size in the link is not valid.");
    }
    return n;
}

export type ParsedLink =
    | { kind: "create" }
    | { kind: "solve"; puzzle: Grid }
    | { kind: "error"; message: string };

export function parsePuzzleLink(search: string): ParsedLink {
    const params = new URLSearchParams(search);
    if (params.get("mode") !== "solve") return { kind: "create" };

    const encoded = params.get("p");
    if (!encoded) {
        return { kind: "error", message: "The link does not contain a puzzle." };
    }
    try {
        const rows = parseSize(params.get("h"));
        const cols = parseSize(params.get("w"));
        return { kind: "solve", puzzle: decodePuzzle(encoded, rows, cols) };
    } catch (e) {
        return { kind: "error", message: (e as Error).message };
    }
}

export function buildPuzzleLink(baseUrl: string, puzzle: Grid): string {
    const url = new URL(baseUrl);
    url.search = "";
    url.searchParams.set("mode", "solve");
    url.searchParams.set("w", String(puzzle[0].length));
    url.searchParams.set("h", String(puzzle.length));
    url.searchParams.set("p", encodePuzzle(puzzle));
    return url.toString();
}
