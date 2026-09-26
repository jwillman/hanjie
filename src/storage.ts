import { Board, EMPTY, FILLED, MARKED } from "./types";

// localStorage can be unavailable (private mode, blocked storage), so every
// access is guarded and failures fall back to "nothing saved".
export function loadJSON<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
        return null;
    }
}

export function saveJSON(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore
    }
}

export function removeKey(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

export function isValidBoard(
    value: unknown,
    rows?: number,
    cols?: number
): value is Board {
    if (!Array.isArray(value) || value.length === 0) return false;
    const width = Array.isArray(value[0]) ? value[0].length : 0;
    if (width === 0) return false;
    if (rows !== undefined && value.length !== rows) return false;
    if (cols !== undefined && width !== cols) return false;
    return value.every(
        (row) =>
            Array.isArray(row) &&
            row.length === width &&
            row.every((c) => c === EMPTY || c === FILLED || c === MARKED)
    );
}
