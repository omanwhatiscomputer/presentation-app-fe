/* eslint-disable react/react-in-jsx-scope */
"use client";

import "material-icons/iconfont/material-icons.css";
import { useCallback, useMemo, useEffect, useState } from "react";

import isHotkey from "is-hotkey";
import { Editable, withReact, Slate } from "slate-react";
import { createEditor } from "slate";
// import { withHistory } from "slate-history";

import { Toolbar } from "@/app/(components)/SlateComponents/common";

import { withYHistory, withYjs, YjsEditor, withCursors } from "@slate-yjs/core";
import * as Y from "yjs";
import { withNormalize } from "@/app/plugins/withNormalize";
import { withMarkdown } from "@/app/plugins/withMarkdown";

import { WebsocketProvider } from "y-websocket";
import WebSocket from "ws";
import { Awareness } from "y-protocols/awareness";
import { v4 as uuid } from "uuid";

import { getRandomColor } from "@/app/utils";

import dynamic from "next/dynamic";
import {
    BlockButton,
    Element,
    HOTKEYS,
    initialValue,
    Leaf,
    MarkButton,
    toggleMark,
} from "./slide.utils";
import { LeftColumn } from "@/app/(components)/SlateComponents/LeftColumn";
import RightColumn from "@/app/(components)/SlateComponents/RightColumn";

let RemoteCursorOverlay = dynamic(
    () => import("@/app/(components)/Overlay").then((mod) => mod.default),
    { ssr: false }
);

const Room = () => {
    const [value, setValue] = useState(initialValue);
    const [currentSlideId, setCurrentSlideId] = useState(null);

    const [slides, setSlides] = useState([]);

    const clientUniqueId = useMemo(() => {
        return uuid();
    }, []);

    const handleSlidesReorder = (newValue) => {
        // console.log("param", newValue);
        slidesArray.length > 0 && slidesArray.delete(0, slidesArray.length);
        slidesArray.insert(0, newValue);
    };

    // init provider
    const provider = useMemo(() => {
        const doc = new Y.Doc();
        const wsOpts = {
            connect: true,
            params: {},
            WebsocketPolyfill: WebSocket,
            awareness: new Awareness(doc),
            maxBackoffTime: 2500,
        };
        return new WebsocketProvider(
            `ws://localhost:1234?props=${clientUniqueId}`,
            "my-roomname",
            doc,
            wsOpts
        );
    }, []);

    useEffect(() => {
        () => {
            provider.awareness.setLocalStateField("online", false);
        };
    }, []);

    // ===================================================================================================
    // Slides management using Y.Map
    const slideMetadata = useMemo(() => {
        const data = provider.doc.getMap("slideMetadata");
        if (typeof data.get("offsetKey") === "undefined") {
            data.set("offsetKey", 0);
        }
        return data;
    }, [provider.doc]);

    // get slide offsetKey
    const getSlideOffsetKey = () => {
        return slideMetadata.get("offsetKey");
    };
    // increment slide offsetKey
    const incrementSlideOffsetKey = () => {
        slideMetadata.set("offsetKey", getSlideOffsetKey() + 1);
    };

    const slidesArray = useMemo(
        () => provider.doc.getArray("slidesArray"),
        [provider.doc]
    );

    const handleSlideSelect = (id) => {
        provider.awareness.setLocalStateField("currentSlideId", id);
        setCurrentSlideId(id);
    };

    useEffect(() => {
        const handleSync = () => {
            console.log("Yjs synced!");
            if (slidesArray.length > 0) {
                // setCurrentSlideId(slidesArray.get(0).id);
                provider.awareness.setLocalStateField(
                    "currentSlideId",
                    slidesArray.get(0).id
                );
            } else {
                // Only create a slide if none exists
                const id = uuid();
                slidesArray.push([{ id, offset: getSlideOffsetKey() + 1 }]);
                incrementSlideOffsetKey();
                const slideText = provider.doc.get(id, Y.XmlText);
                slideText.insert(0, "New Slide Content");
                // setCurrentSlideId(id);
                provider.awareness.setLocalStateField("currentSlideId", id);
            }
            setSlides(slidesArray.toArray());
            // console.log("Slides array after sync:", slidesArray.toArray());
            console.log("getstates", provider.awareness.getStates().entries());
            console.log("localstates", provider.awareness.getLocalState());
        };
        slidesArray.observe(() => {
            console.log("observed");
            setSlides(slidesArray.toArray());
        });

        provider.on("sync", handleSync);
        return () => {
            slidesArray.unobserve();
            provider.off("sync", handleSync);
        };
    }, [slidesArray]);

    const addNewSlide = (slideKey) => {
        const newSlideId = slideKey;

        slidesArray.push([{ id: newSlideId, offset: getSlideOffsetKey() }]);
        incrementSlideOffsetKey();
        const slideText = provider.doc.get(newSlideId, Y.XmlText);

        slideText.insert(0, "New Slide Content");

        // setCurrentSlideId(newSlideId);
    };

    // ===================================================================================================

    const editor = useMemo(() => {
        // const sharedType = provider.doc.get(`${currentSlideId}`, Y.XmlText);
        const sharedType = provider.doc.get(
            `${
                provider.awareness.getLocalState()["currentSlideId"] ||
                "default"
            }`,
            Y.XmlText
        );

        sharedType.observe(() => {
            console.log("observed");
        });

        const cursorData = {
            color: getRandomColor(),
            name: `user ${clientUniqueId}`,
            online: true,
        };

        return withMarkdown(
            withNormalize(
                withReact(
                    withCursors(
                        withYHistory(withYjs(createEditor(), sharedType)),
                        provider.awareness,
                        { data: cursorData }
                    )
                )
            )
        );
    }, [provider.awareness, currentSlideId]);

    // Connect editor in useEffect to comply with concurrent mode requirements.
    useEffect(() => {
        YjsEditor.connect(editor);
        return () => YjsEditor.disconnect(editor);
    }, [editor]);

    useEffect(() => {
        // Cleanup logic for the WebSocket provider
        return () => {
            provider.disconnect();
        };
    }, [provider]);

    //------------------------------------------------------------

    const renderElement = useCallback((props) => <Element {...props} />, []);
    const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

    return (
        <div className="flex h-full w-full pt-[40px] flex-1">
            <div className="h-screen bg-slate-300 basis-[200px] w-[200px] shrink-0 fixed overflow-y-auto  left-0 z-10">
                <LeftColumn
                    handleSlideSelect={handleSlideSelect}
                    slides={slides}
                    addNewSlide={addNewSlide}
                    handleSlidesReorder={handleSlidesReorder}
                />
            </div>
            <div className="flex flex-grow justify-center items-center mx-[250px] overflow-y-auto">
                <Slate
                    initialValue={initialValue}
                    value={value}
                    editor={editor}
                    onChange={setValue}
                >
                    <RemoteCursorOverlay>
                        <Toolbar className="fixed bg-white top-0 left-0 w-full flex justify-center">
                            <MarkButton format="bold" icon="format_bold" />
                            <MarkButton format="italic" icon="format_italic" />
                            <MarkButton
                                format="underline"
                                icon="format_underlined"
                            />
                            <MarkButton format="code" icon="code" />
                            <BlockButton
                                format="heading-one"
                                icon="looks_one"
                            />
                            <BlockButton
                                format="heading-two"
                                icon="looks_two"
                            />
                            <BlockButton
                                format="block-quote"
                                icon="format_quote"
                            />
                            <BlockButton
                                format="numbered-list"
                                icon="format_list_numbered"
                            />
                            <BlockButton
                                format="bulleted-list"
                                icon="format_list_bulleted"
                            />
                            <BlockButton
                                format="left"
                                icon="format_align_left"
                            />
                            <BlockButton
                                format="center"
                                icon="format_align_center"
                            />
                            <BlockButton
                                format="right"
                                icon="format_align_right"
                            />
                            <BlockButton
                                format="justify"
                                icon="format_align_justify"
                            />
                        </Toolbar>
                        <Editable
                            className="data-slate-editor break-words border-2 h-[400px] w-[500px] xl:h-[550px] xl:w-[800px]  2xl:w-[1200px] 2xl:h-[750px]"
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                            placeholder="Enter some rich text…"
                            spellCheck
                            autoFocus
                            onKeyDown={(event) => {
                                for (const hotkey in HOTKEYS) {
                                    if (isHotkey(hotkey, event)) {
                                        event.preventDefault();
                                        const mark = HOTKEYS[hotkey];
                                        toggleMark(editor, mark);
                                    }
                                }
                            }}
                        />
                    </RemoteCursorOverlay>
                </Slate>
            </div>
            <div className="h-full bg-slate-300 basis-[200px] shrink-0 w-[200px] fixed overflow-hidden right-0 z-10">
                <RightColumn />
            </div>
        </div>
    );
};

export default Room;
