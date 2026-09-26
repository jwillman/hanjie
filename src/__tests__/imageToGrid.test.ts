import { expect, it } from "vitest";
import { pixelsToGrid } from "../imageToGrid";

// 1×3 image: black, transparent black, light grey
const data = new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 0, 200, 200, 200, 255]);

it("fills dark pixels and treats transparency as white", () => {
    expect(pixelsToGrid(data, 1, 3, 128, false)).toEqual([[true, false, false]]);
});

it("respects the threshold and invert", () => {
    expect(pixelsToGrid(data, 1, 3, 220, false)).toEqual([[true, false, true]]);
    expect(pixelsToGrid(data, 1, 3, 128, true)).toEqual([[false, true, true]]);
});
