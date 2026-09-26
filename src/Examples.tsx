import React from "react";
import { buildPuzzleLink } from "./encoding";
import { EXAMPLES } from "./examples";
import { loadSolveProgress } from "./progress";

const Examples: React.FC = () => (
    <main className="page">
        <h1>Puzzles</h1>
        <p className="lead">Pick a puzzle to solve, or draw your own under Create.</p>
        <ul className="example-list">
            {EXAMPLES.map((example) => {
                const progress = loadSolveProgress(example.grid);
                const rows = example.grid.length;
                const cols = example.grid[0].length;
                return (
                    <li key={example.id}>
                        <a
                            className="example-card"
                            href={buildPuzzleLink(window.location.href, example.grid)}
                        >
                            <span className="example-name">{example.name}</span>
                            <span className="example-meta">
                                {cols}×{rows}
                                {progress?.solved
                                    ? " · Solved ✓"
                                    : progress && progress.elapsedMs > 0
                                      ? " · In progress"
                                      : ""}
                            </span>
                        </a>
                    </li>
                );
            })}
        </ul>
    </main>
);

export default Examples;
