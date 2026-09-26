import { useEffect, useRef, useState } from "react";
import { SolveResult } from "./solver";
import { Hints } from "./types";

export type Solvability = SolveResult["status"] | "checking";

const DEBOUNCE_MS = 250;

// Checks in a Web Worker whether the hints have a unique solution, so large
// puzzles never block drawing. A new request cancels the previous one.
export function useSolvability(rowHints: Hints, colHints: Hints): Solvability {
    const [status, setStatus] = useState<Solvability>("checking");
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        setStatus("checking");
        const timer = setTimeout(() => {
            workerRef.current?.terminate();
            const worker = new Worker(
                new URL("./solver.worker.ts", import.meta.url),
                { type: "module" }
            );
            workerRef.current = worker;
            worker.onmessage = (e: MessageEvent<{ result: SolveResult }>) => {
                setStatus(e.data.result.status);
                worker.terminate();
                if (workerRef.current === worker) workerRef.current = null;
            };
            worker.postMessage({ rowHints, colHints });
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [rowHints, colHints]);

    useEffect(() => () => workerRef.current?.terminate(), []);

    return status;
}
