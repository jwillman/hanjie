import React, { useState, useMemo, useEffect } from "react";
import "./App.css";
import { solveNonogram } from "./solver";
import { getHanjieHints } from "./utils";
import { Hints } from "./types";

const App: React.FC = () => {
    const gridSize: number = 15;

    const [cellColors, setCellColors] = useState<boolean[][]>(
        Array.from({ length: gridSize }, () => Array(gridSize).fill(false))
    );

    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [drawTargetColor, setDrawTargetColor] = useState<boolean | null>(
        null
    );
    const [isSolvable, setIsSolvable] = useState<boolean>(true);

    const toggleCellColor = (row: number, col: number, color: boolean) => {
        setCellColors((prevColors) => {
            const newColors = prevColors.map((r) => [...r]);
            newColors[row][col] = color;
            return newColors;
        });
    };

    const handleMouseDown = (row: number, col: number): void => {
        setIsMouseDown(true);
        const currentColor = cellColors[row][col];
        const targetColor = !currentColor;
        setDrawTargetColor(targetColor);
        toggleCellColor(row, col, targetColor);
    };

    const handleMouseUp = (): void => {
        setIsMouseDown(false);
        setDrawTargetColor(null);
    };

    const handleMouseOver = (row: number, col: number): void => {
        if (isMouseDown && drawTargetColor !== null) {
            toggleCellColor(row, col, drawTargetColor);
        }
    };

    const rowHints: Hints = useMemo(() => {
        return cellColors.map((row) => getHanjieHints(row));
    }, [cellColors]);

    const columnHints: Hints = useMemo(() => {
        const hints = [];
        for (let c = 0; c < gridSize; c++) {
            const col = cellColors.map((row) => row[c]);
            hints.push(getHanjieHints(col));
        }
        return hints;
    }, [cellColors, gridSize]);

    // Check solvability whenever cellColors change
    useEffect(() => {
        const solution = solveNonogram(gridSize, rowHints, columnHints);
        console.log("solution", solution);
        setIsSolvable(solution !== null);
    }, [cellColors, rowHints, columnHints, gridSize]);

    const cells = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const rowNumber = r + 1;
            const colNumber = c + 1;

            const isFifthRow = rowNumber % 5 === 0;
            const isFifthCol = colNumber % 5 === 0;

            cells.push(
                <div
                    key={`${r}-${c}`}
                    className={`grid-cell ${
                        isFifthRow ? "border-bottom-thick" : ""
                    } ${isFifthCol ? "border-right-thick" : ""}`}
                    style={{
                        backgroundColor: cellColors[r][c] ? "black" : "white",
                    }}
                    onMouseDown={() => handleMouseDown(r, c)}
                    onMouseOver={() => handleMouseOver(r, c)}
                    onMouseUp={handleMouseUp}
                ></div>
            );
        }
    }

    const resetCells = () => {
        setCellColors(
            Array.from({ length: gridSize }, () => Array(gridSize).fill(false))
        );
    };

    return (
        <div className="page-container">
            <div className="puzzle-container">
                <div className="grid-wrapper">
                    <div className="column-hints-container">
                        {columnHints.map((hints, c) => (
                            <div key={c} className="column-hint">
                                {hints.length > 0 ? (
                                    hints.map((hint, idx) => (
                                        <div key={idx}>{hint}</div>
                                    ))
                                ) : (
                                    <div>0</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="row-hints-container">
                        {rowHints.map((hints, r) => (
                            <div key={r} className="row-hint">
                                {hints.length > 0 ? (
                                    hints.map((hint, idx) => (
                                        <div key={idx}>{hint}</div>
                                    ))
                                ) : (
                                    <div>0</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div
                        className="grid-container"
                        onMouseLeave={handleMouseUp}
                        onMouseUp={handleMouseUp}
                    >
                        {cells}
                    </div>
                </div>
            </div>
            <div className="solvable-label">
                {isSolvable
                    ? "This puzzle is solvable."
                    : "This puzzle is not solvable."}
            </div>
            <div className="controls">
                <button onClick={resetCells}>Reset</button>
            </div>
        </div>
    );
};

export default App;
