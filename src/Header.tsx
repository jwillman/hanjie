import React from "react";
import { useTheme } from "./useTheme";

const THEME_LABEL = { auto: "Theme: auto", light: "Theme: light", dark: "Theme: dark" };

const Header: React.FC<{ current: "create" | "examples" | "solve" }> = ({ current }) => {
    const { theme, cycle } = useTheme();
    const path = window.location.pathname;
    return (
        <header className="header">
            <a className="logo" href={path}>
                <span className="logo-mark" aria-hidden="true" />
                Hanjie
            </a>
            <nav>
                <a href={path} aria-current={current === "create" ? "page" : undefined}>
                    Create
                </a>
                <a
                    href={`${path}?mode=examples`}
                    aria-current={current === "examples" ? "page" : undefined}
                >
                    Puzzles
                </a>
            </nav>
            <button className="theme-toggle" onClick={cycle} title="Switch colour theme">
                {THEME_LABEL[theme]}
            </button>
        </header>
    );
};

export default Header;
