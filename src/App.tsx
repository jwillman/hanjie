import React, { useState, useMemo } from "react";
import "./App.css";
import { getHanjieHints } from "./utils";
import { Hints } from "./types";
import { encodePuzzle, decodePuzzle } from "./encoding";
import confetti from "canvas-confetti";

const App: React.FC = () => {
    const gridSize: number = 15;

    // Check URL for mode and puzzle
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const puzzleParam = urlParams.get("p");

    const originalPuzzle: boolean[][] =
        mode === "solve" && puzzleParam
            ? decodePuzzle(puzzleParam, gridSize, gridSize)
            : Array.from({ length: gridSize }, () =>
                  Array(gridSize).fill(false)
              );

    // 0=white, 1=black, 2=grey
    const [cellColors, setCellColors] = useState<number[][]>(() => {
        return Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    });

    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [drawTargetColor, setDrawTargetColor] = useState<number | null>(null);

    // We'll add states to show success or error messages
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const rowHints: Hints = useMemo(() => {
        const puzzleForHints =
            mode === "solve"
                ? originalPuzzle
                : cellColors.map((row) => row.map((c) => c === 1));
        return puzzleForHints.map((row) => getHanjieHints(row));
    }, [cellColors, originalPuzzle, mode]);

    const columnHints: Hints = useMemo(() => {
        const puzzleForHints =
            mode === "solve"
                ? originalPuzzle
                : cellColors.map((row) => row.map((c) => c === 1));
        const hints = [];
        for (let c = 0; c < gridSize; c++) {
            const col = puzzleForHints.map((row) => row[c]);
            hints.push(getHanjieHints(col));
        }
        return hints;
    }, [cellColors, originalPuzzle, mode, gridSize]);

    function toggleCellColor(row: number, col: number, color: number) {
        setCellColors((prevColors) => {
            const newColors = prevColors.map((r) => [...r]);
            newColors[row][col] = color;
            return newColors;
        });
        // Reset messages when the puzzle changes
        setShowSuccess(false);
        setErrorMessage(null);
    }

    const handleMouseDown = (
        e: React.MouseEvent,
        row: number,
        col: number
    ): void => {
        e.preventDefault();
        setIsMouseDown(true);

        const currentColor = cellColors[row][col];

        if (e.button === 0) {
            // Left-click: toggle black/white
            const targetColor = currentColor === 1 ? 0 : 1;
            setDrawTargetColor(targetColor);
            toggleCellColor(row, col, targetColor);
        } else if (e.button === 2 && mode === "solve") {
            // Right-click in solve mode: toggle grey/white
            const targetColor = currentColor === 2 ? 0 : 2;
            setDrawTargetColor(targetColor);
            toggleCellColor(row, col, targetColor);
        }
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

    const resetCells = () => {
        if (mode === "solve") {
            setCellColors(
                Array.from({ length: gridSize }, () => Array(gridSize).fill(0))
            );
        } else {
            setCellColors(
                Array.from({ length: gridSize }, () => Array(gridSize).fill(0))
            );
        }
        setShowSuccess(false);
        setErrorMessage(null);
    };

    const generateSolveLink = () => {
        const puzzleForLink =
            mode === "solve"
                ? originalPuzzle
                : cellColors.map((row) => row.map((c) => c === 1));
        const encoded = encodePuzzle(puzzleForLink);
        const url = new URL(window.location.href);
        url.searchParams.set("mode", "solve");
        url.searchParams.set("p", encoded);
        return url.toString();
    };

    const checkUserSolution = () => {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const puzzleBlack = originalPuzzle[r][c];
                const userColor = cellColors[r][c];
                if (puzzleBlack) {
                    if (userColor !== 1) {
                        // Not correct
                        setShowSuccess(false);
                        setErrorMessage("Not correct. Keep trying!");
                        return;
                    }
                } else {
                    // puzzle expects white
                    if (userColor === 1) {
                        // Not correct
                        setShowSuccess(false);
                        setErrorMessage("Not correct. Keep trying!");
                        return;
                    }
                }
            }
        }
        // If we reach here, solution is correct!
        setShowSuccess(true);
        setErrorMessage(null);
        // Trigger confetti animation
        confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 },
        });
    };

    const cells = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const rowNumber = r + 1;
            const colNumber = c + 1;
            const isFifthRow = rowNumber % 5 === 0;
            const isFifthCol = colNumber % 5 === 0;

            let bgColor = "white";
            if (cellColors[r][c] === 1) bgColor = "black";
            else if (cellColors[r][c] === 2) bgColor = "#e0e0e0";

            cells.push(
                <div
                    key={`${r}-${c}`}
                    className={`grid-cell ${
                        isFifthRow ? "border-bottom-thick" : ""
                    } ${isFifthCol ? "border-right-thick" : ""}`}
                    style={{ backgroundColor: bgColor }}
                    onMouseDown={(e) => handleMouseDown(e, r, c)}
                    onMouseOver={() => handleMouseOver(r, c)}
                    onMouseUp={handleMouseUp}
                    onContextMenu={(e) => e.preventDefault()} // prevent default context menu
                ></div>
            );
        }
    }

    return (
        <div className="page-container">
            {/* If solution is correct, show success text */}
            {showSuccess && (
                <div className="success-message">
                    Congratulations! You've solved it!
                </div>
            )}
            {/* If there's an error message, show it in red text */}
            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}

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
                        <a
                            href={generateSolveLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Get link to the puzzle
                        </a>
                    </>
                ) : (
                    <>
                        <button onClick={resetCells}>Reset</button>
                        <button onClick={checkUserSolution}>
                            Check My Solution
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default App;
