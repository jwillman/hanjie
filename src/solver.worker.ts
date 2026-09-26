import { analyzePuzzle } from "./solver";
import { Hints } from "./types";

export type SolverRequest = { rowHints: Hints; colHints: Hints };

self.onmessage = (e: MessageEvent<SolverRequest>) => {
    const { rowHints, colHints } = e.data;
    self.postMessage({ result: analyzePuzzle(rowHints, colHints) });
};
