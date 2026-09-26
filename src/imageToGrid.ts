import { Grid } from "./types";

/**
 * Turns RGBA pixels (one pixel per cell, rows × cols) into a grid: a cell
 * is filled when the pixel is darker than the threshold (0–255).
 * Transparent pixels count as white.
 */
export function pixelsToGrid(
    data: Uint8ClampedArray,
    rows: number,
    cols: number,
    threshold: number,
    invert: boolean
): Grid {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
            const i = (r * cols + c) * 4;
            const alpha = data[i + 3] / 255;
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const onWhite = lum * alpha + 255 * (1 - alpha);
            return onWhite < threshold !== invert;
        })
    );
}

// Scales the image to fit the grid (keeping its aspect ratio, centred on
// white) and converts it to a grid.
export function imageToGrid(
    image: HTMLImageElement,
    rows: number,
    cols: number,
    threshold: number,
    invert: boolean
): Grid {
    const canvas = document.createElement("canvas");
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.imageSmoothingQuality = "high";
    const scale = Math.min(cols / image.naturalWidth, rows / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    ctx.drawImage(image, (cols - w) / 2, (rows - h) / 2, w, h);
    const { data } = ctx.getImageData(0, 0, cols, rows);
    return pixelsToGrid(data, rows, cols, threshold, invert);
}
