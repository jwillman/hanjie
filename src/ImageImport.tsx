import React, { useEffect, useMemo, useState } from "react";
import { imageToGrid } from "./imageToGrid";
import { Grid } from "./types";

interface Props {
    rows: number;
    cols: number;
    // Called with the converted grid whenever the settings change,
    // or null when the import is closed
    onPreview: (grid: Grid | null) => void;
    onApply: (grid: Grid) => void;
}

const ImageImport: React.FC<Props> = ({ rows, cols, onPreview, onApply }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [threshold, setThreshold] = useState(128);
    const [invert, setInvert] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const preview = useMemo(
        () => (image ? imageToGrid(image, rows, cols, threshold, invert) : null),
        [image, rows, cols, threshold, invert]
    );

    useEffect(() => onPreview(preview), [preview, onPreview]);

    const openFile = (file: File | undefined) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            setImage(img);
            setError(null);
            URL.revokeObjectURL(url);
        };
        img.onerror = () => {
            setError("That file could not be read as an image.");
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const close = () => {
        setImage(null);
        onPreview(null);
    };

    return (
        <div className="import">
            <label className="button-like">
                {image ? "Choose another image" : "Import image"}
                <input
                    type="file"
                    accept="image/*"
                    className="visually-hidden"
                    onChange={(e) => {
                        openFile(e.target.files?.[0]);
                        e.target.value = "";
                    }}
                />
            </label>
            {error && <span className="status-error">{error}</span>}
            {image && preview && (
                <div className="import-panel">
                    <label>
                        Darkness threshold
                        <input
                            type="range"
                            min={1}
                            max={254}
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                        />
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={invert}
                            onChange={(e) => setInvert(e.target.checked)}
                        />{" "}
                        Invert
                    </label>
                    <button
                        className="primary"
                        onClick={() => {
                            onApply(preview);
                            close();
                        }}
                    >
                        Use this picture
                    </button>
                    <button onClick={close}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default ImageImport;
