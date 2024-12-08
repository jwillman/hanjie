// Convert boolean[][] to a compact binary format and then Base64-encode
export function encodePuzzle(puzzle: boolean[][]): string {
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

// Decode the Base64 puzzle string back into boolean[][]
export function decodePuzzle(
    encoded: string,
    rows: number,
    cols: number
): boolean[][] {
    const binaryString = atob(encoded);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const puzzle: boolean[][] = Array.from({ length: rows }, () =>
        Array(cols).fill(false)
    );
    let bitIndex = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const byteIndex = Math.floor(bitIndex / 8);
            const bitPos = bitIndex % 8;
            const bitSet = (bytes[byteIndex] & (1 << bitPos)) !== 0;
            puzzle[r][c] = bitSet;
            bitIndex++;
        }
    }

    return puzzle;
}
