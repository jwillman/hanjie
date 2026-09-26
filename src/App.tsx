import React, { useMemo } from "react";
import "./App.css";
import CreatePuzzle from "./CreatePuzzle";
import SolvePuzzle from "./SolvePuzzle";
import { parsePuzzleLink } from "./encoding";

const App: React.FC = () => {
    const link = useMemo(() => parsePuzzleLink(window.location.search), []);

    if (link.kind === "solve") return <SolvePuzzle puzzle={link.puzzle} />;
    if (link.kind === "error") {
        return (
            <div className="page">
                <p className="status status-error" role="alert">
                    {link.message}
                </p>
                <a href={window.location.pathname}>Create a new puzzle</a>
            </div>
        );
    }
    return <CreatePuzzle />;
};

export default App;
