import React, { useState } from "react";
import "./App.css";

const App: React.FC = () => {
    const gridSize: number = 15; // 15x15 grid

    // State to track the color of each cell
    const [cellColors, setCellColors] = useState<boolean[]>(
        Array(gridSize * gridSize).fill(false) // Initially, all cells are white (false)
    );

    // Toggle cell color on click
    const toggleCellColor = (index: number): void => {
        setCellColors((prevColors) => {
            const newColors = [...prevColors];
            newColors[index] = !newColors[index]; // Toggle color
            return newColors;
        });
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
                onClick={() => toggleCellColor(index)} // Handle click event
            ></div>
        );
    });

    return <div className="grid-container">{cells}</div>;
};

export default App;
