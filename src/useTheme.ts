import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "./storage";

export type Theme = "auto" | "light" | "dark";
const KEY = "hanjie:theme";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = loadJSON<Theme>(KEY);
        return saved === "light" || saved === "dark" ? saved : "auto";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "auto") delete root.dataset.theme;
        else root.dataset.theme = theme;
        saveJSON(KEY, theme);
    }, [theme]);

    const cycle = () =>
        setTheme((t) => (t === "auto" ? "light" : t === "light" ? "dark" : "auto"));

    return { theme, cycle };
}
