import React, { useState, useMemo } from "react";
import "./App.css";
import { solveNonogram } from "./solver";
import { getHanjieHints } from "./utils";
import { Hints } from "./types";
import { encodePuzzle, decodePuzzle } from "./encoding";

const App: React.FC = () => {
    const gridSize: number = 15;

    // Check URL for mode and puzzle
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const puzzleParam = urlParams.get("p");

    // If in solve mode, decode the original puzzle (solution)
    // Else, start with an empty puzzle for creation.
    const originalPuzzle: boolean[][] =
        mode === "solve" && puzzleParam
            ? decodePuzzle(puzzleParam, gridSize, gridSize)
            : Array.from({ length: gridSize }, () =>
                  Array(gridSize).fill(false)
              );

    // In solve mode, the grid starts all white (user tries to solve).
    // In creation mode, the grid is the puzzle being created.
    const [cellColors, setCellColors] = useState<boolean[][]>(() => {
        if (mode === "solve") {
            return Array.from({ length: gridSize }, () =>
                Array(gridSize).fill(false)
            );
        } else {
            return Array.from({ length: gridSize }, () =>
                Array(gridSize).fill(false)
            );
        }
    });

    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [drawTargetColor, setDrawTargetColor] = useState<boolean | null>(
        null
    );

    // Compute hints from originalPuzzle in solve mode, or from cellColors in creation mode.
    const rowHints: Hints = useMemo(() => {
        const puzzleForHints = mode === "solve" ? originalPuzzle : cellColors;
        return puzzleForHints.map((row) => getHanjieHints(row));
    }, [cellColors, originalPuzzle, mode]);

    const columnHints: Hints = useMemo(() => {
        const puzzleForHints = mode === "solve" ? originalPuzzle : cellColors;
        const hints = [];
        for (let c = 0; c < gridSize; c++) {
            const col = puzzleForHints.map((row) => row[c]);
            hints.push(getHanjieHints(col));
        }
        return hints;
    }, [cellColors, originalPuzzle, mode, gridSize]);

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
        if (mode === "solve") {
            // In solve mode, reset to all white again
            setCellColors(
                Array.from({ length: gridSize }, () =>
                    Array(gridSize).fill(false)
                )
            );
        } else {
            // In creation mode, reset to blank
            setCellColors(
                Array.from({ length: gridSize }, () =>
                    Array(gridSize).fill(false)
                )
            );
        }
    };

    const checkSolvability = () => {
        if (mode !== "solve") {
            const solution = solveNonogram(gridSize, rowHints, columnHints);
            alert(solution ? "Puzzle is solvable." : "Puzzle is not solvable.");
        }
    };

    const generateSolveLink = () => {
        // In creation mode, use cellColors as originalPuzzle
        const puzzleForLink = mode === "solve" ? originalPuzzle : cellColors;
        const encoded = encodePuzzle(puzzleForLink);
        const url = new URL(window.location.href);
        url.searchParams.set("mode", "solve");
        url.searchParams.set("p", encoded);
        return url.toString();
    };

    const checkUserSolution = () => {
        // Compare cellColors to originalPuzzle
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (cellColors[r][c] !== originalPuzzle[r][c]) {
                    alert("Not correct. Keep trying!");
                    return;
                }
            }
        }
        alert("Congratulations! You've solved it correctly!");
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
            <div className="controls">
                {mode !== "solve" ? (
                    <>
                        <button onClick={resetCells}>Reset</button>
                        {/* <button onClick={checkSolvability}>
                            Check Solvability
                        </button> */}
                        <a
                            href={generateSolveLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Get a link to the puzzle
                        </a>
                    </>
                ) : (
                    <>
                        <button onClick={resetCells}>Reset</button>
                        <button onClick={checkUserSolution}>Check</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default App;
