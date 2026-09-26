import React, { useMemo } from "react";
import "./App.css";
import CreatePuzzle from "./CreatePuzzle";
import Examples from "./Examples";
import Header from "./Header";
import SolvePuzzle from "./SolvePuzzle";
import { parsePuzzleLink } from "./encoding";

const App: React.FC = () => {
    const link = useMemo(() => parsePuzzleLink(window.location.search), []);

    switch (link.kind) {
        case "solve":
            return (
                <>
                    <Header current="solve" />
                    <SolvePuzzle puzzle={link.puzzle} />
                </>
            );
        case "examples":
            return (
                <>
                    <Header current="examples" />
                    <Examples />
                </>
            );
        case "error":
            return (
                <>
                    <Header current="solve" />
                    <main className="page">
                        <p className="status status-error" role="alert">
                            {link.message}
                        </p>
                        <a href={window.location.pathname}>Create a new puzzle</a>
                    </main>
                </>
            );
        case "create":
            return (
                <>
                    <Header current="create" />
                    <CreatePuzzle />
                </>
            );
    }
};

export default App;
