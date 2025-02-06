"use client";

import dynamic from "next/dynamic";

import {
    CursorOverlayData,
    useRemoteCursorOverlayPositions,
} from "@slate-yjs/react";
import React, { useRef } from "react";
import { addAlpha } from "../utils";

function Caret({ caretPosition, data }) {
    const caretStyle = {
        ...caretPosition,
        background: data?.color,
    };

    const labelStyle = {
        transform: "translateY(-100%)",
        background: data?.color,
    };

    return (
        <div style={caretStyle} className="w-0.5 absolute">
            <div
                className="absolute text-xs text-white whitespace-nowrap top-0 rounded rounded-bl-none px-1.5 py-0.5"
                style={labelStyle}
            >
                {data?.name}
            </div>
        </div>
    );
}

function RemoteSelection({ data, selectionRects, caretPosition }) {
    if (!data) {
        return null;
    }

    const selectionStyle = {
        // Add a opacity to the background color
        backgroundColor: addAlpha(data.color, 0.5),
    };

    return (
        <React.Fragment>
            {selectionRects.map((position, i) => (
                <div
                    style={{ ...selectionStyle, ...position }}
                    className="absolute pointer-events-none"
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                />
            ))}
            {caretPosition && (
                <Caret caretPosition={caretPosition} data={data} />
            )}
        </React.Fragment>
    );
}

export default function RemoteCursorOverlay({ className, children }) {
    const containerRef = useRef(null);
    const [cursors] = useRemoteCursorOverlayPositions({
        containerRef,
    });

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {children}
            {cursors.map((cursor) => (
                <RemoteSelection key={cursor.clientId} {...cursor} />
            ))}
        </div>
    );
}
