import { useEffect, useRef, useState } from "react";

// A short message that disappears after a few seconds
export function useNotice(durationMs = 2500) {
    const [notice, setNotice] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => () => clearTimeout(timer.current), []);

    const showNotice = (message: string) => {
        clearTimeout(timer.current);
        setNotice(message);
        timer.current = setTimeout(() => setNotice(null), durationMs);
    };

    return { notice, showNotice };
}
