import React, { useState } from "react";
import "./App.css";

const App: React.FC = () => {
    const gridSize: number = 15; // 15x15 grid

    // State to track the color of each cell
    const [cellColors, setCellColors] = useState<boolean[]>(
        Array(gridSize * gridSize).fill(false) // Initially, all cells are white (false)
    );

    // State to track mouse button being held down
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    // State to track the target color during drawing
    const [drawTargetColor, setDrawTargetColor] = useState<boolean | null>(
        null
    );

    // Handle mouse down
    const handleMouseDown = (index: number): void => {
        setIsMouseDown(true);
        const targetColor = !cellColors[index]; // Determine the target color for the drawing session
        setDrawTargetColor(targetColor);
        setCellColors((prevColors) => {
            const newColors = [...prevColors];
            newColors[index] = targetColor; // Set the first cell to the target color
            return newColors;
        });
    };

    // Handle mouse up
    const handleMouseUp = (): void => {
        setIsMouseDown(false);
        setDrawTargetColor(null); // Reset the target color after the drawing session
    };

    // Handle mouse over (drawing)
    const handleMouseOver = (index: number): void => {
        if (isMouseDown && drawTargetColor !== null) {
            setCellColors((prevColors) => {
                const newColors = [...prevColors];
                newColors[index] = drawTargetColor; // Set subsequent cells to the target color
                return newColors;
            });
        }
    };

    // Generate the grid
    const cells = Array.from({ length: gridSize * gridSize }, (_, index) => {
        const row: number = Math.floor(index / gridSize) + 1; // Calculate row number (1-based)
        const col: number = (index % gridSize) + 1; // Calculate column number (1-based)

        // Add conditional classes for every 5th row or column
        const isFifthRow: boolean = row % 5 === 0;
        const isFifthCol: boolean = col % 5 === 0;

        return (
            <div
                key={index}
                className={`grid-cell ${
                    isFifthRow ? "border-bottom-thick" : ""
                } ${isFifthCol ? "border-right-thick" : ""}`}
                style={{
                    backgroundColor: cellColors[index] ? "black" : "white", // Change color based on state
                }}
                onMouseDown={() => handleMouseDown(index)} // Start drawing
                onMouseOver={() => handleMouseOver(index)} // Continue drawing
                onMouseUp={handleMouseUp} // Stop drawing
            ></div>
        );
    });

    return (
        <div
            className="grid-container"
            onMouseLeave={handleMouseUp} // Ensure drawing stops if the mouse leaves the grid
            onMouseUp={handleMouseUp} // Ensure mouse up is captured on container level
        >
            {cells}
        </div>
    );
};

export default App;
