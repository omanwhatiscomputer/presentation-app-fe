"use client";

import "material-icons/iconfont/material-icons.css";
import { useCallback, useMemo, useEffect, useState } from "react";

import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import {
    Editor,
    Transforms,
    createEditor,
    Element as SlateElement,
} from "slate";
import { withHistory } from "slate-history";

import {
    Button,
    Icon,
    Menu,
    Toolbar,
} from "@/app/(components)/SlateComponents/common";

//-------------------------------------------------------------------

import { withYHistory, withYjs, YjsEditor, withCursors } from "@slate-yjs/core";
import * as Y from "yjs";
import { withNormalize } from "@/app/plugins/withNormalize";
import { withMarkdown } from "@/app/plugins/withMarkdown";

import { WebsocketProvider } from "y-websocket";
import WebSocket from "ws";
import { Awareness } from "y-protocols/awareness";
import { v4 as uuid } from "uuid";
import { slateNodesToInsertDelta } from "@slate-yjs/core";
import { getRandomColor } from "@/app/utils";

import dynamic from "next/dynamic";

let RemoteCursorOverlay = dynamic(
    () => import("@/app/(components)/Overlay").then((mod) => mod.default),
    { ssr: false }
);

// import { RemoteCursorOverlay } from "@/app/(components)/Overlay";

//-------------------------------------------------------------------

const HOTKEYS = {
    "mod+b": "bold",
    "mod+i": "italic",
    "mod+u": "underline",
    "mod+`": "code",
};
const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
const initialValue = [
    {
        type: "paragraph",
        children: [{ text: "" }],
    },
];
const RichTextExample = () => {
    //------------------------------------------------------------

    const clientUniqueId = uuid();
    const [value, setValue] = useState(initialValue); // editor data

    const provider = useMemo(() => {
        const doc = new Y.Doc();
        const wsOpts = {
            connect: true,
            params: {}, // Object<string,string>
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

    const editor = useMemo(() => {
        const sharedType = provider.doc.get("content", Y.XmlText);

        sharedType.observe(() => {
            console.log("observed");
        });
        const cursorData = {
            color: getRandomColor(),
            name: `user ${clientUniqueId}`,
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
    }, [provider.awareness]);

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
    // const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    return (
        <div className="flex h-full w-full pt-[40px] flex-1">
            <div className="h-full bg-slate-300 basis-[200px] shrink-0">
                Left col
            </div>
            <div className="flex flex-grow justify-center items-center px-8">
                <Slate
                    initialValue={initialValue}
                    value={value}
                    editor={editor}
                    onChange={setValue}
                >
                    <RemoteCursorOverlay>
                        <Toolbar className="fixed bg-white top-0 left-0 w-full flex justify-center z-10">
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
            <div className="h-full bg-slate-300 basis-[200px] shrink-0">
                Right col
            </div>
        </div>
    );
};
const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
    );
    const isList = LIST_TYPES.includes(format);
    Transforms.unwrapNodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            LIST_TYPES.includes(n.type) &&
            !TEXT_ALIGN_TYPES.includes(format),
        split: true,
    });
    let newProperties;
    if (TEXT_ALIGN_TYPES.includes(format)) {
        newProperties = {
            align: isActive ? undefined : format,
        };
    } else {
        newProperties = {
            type: isActive ? "paragraph" : isList ? "list-item" : format,
        };
    }
    Transforms.setNodes(editor, newProperties);
    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};
const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};
const isBlockActive = (editor, format, blockType = "type") => {
    const { selection } = editor;
    if (!selection) return false;
    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n[blockType] === format,
        })
    );
    return !!match;
};
const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
};
const Element = ({ attributes, children, element }) => {
    const style = { textAlign: element.align };
    switch (element.type) {
        case "block-quote":
            return (
                <blockquote style={style} {...attributes}>
                    {children}
                </blockquote>
            );
        case "bulleted-list":
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            );
        case "heading-one":
            return (
                <h1 style={style} {...attributes}>
                    {children}
                </h1>
            );
        case "heading-two":
            return (
                <h2 style={style} {...attributes}>
                    {children}
                </h2>
            );
        case "list-item":
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            );
        case "numbered-list":
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            );
        default:
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            );
    }
};
const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }
    if (leaf.code) {
        children = <code>{children}</code>;
    }
    if (leaf.italic) {
        children = <em>{children}</em>;
    }
    if (leaf.underline) {
        children = <u>{children}</u>;
    }
    return <span {...attributes}>{children}</span>;
};
const BlockButton = ({ format, icon }) => {
    const editor = useSlate();
    return (
        <Button
            active={isBlockActive(
                editor,
                format,
                TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
            )}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    );
};
const MarkButton = ({ format, icon }) => {
    const editor = useSlate();
    return (
        <Button
            active={isMarkActive(editor, format)}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    );
};
// const initialValue = [
//     {
//         type: "paragraph",
//         children: [
//             { text: "This is editable " },
//             { text: "rich", bold: true },
//             { text: " text, " },
//             { text: "much", italic: true },
//             { text: " better than a " },
//             { text: "<textarea>", code: true },
//             { text: "!" },
//         ],
//     },
//     {
//         type: "paragraph",
//         children: [
//             {
//                 text: "Since it's rich text, you can do things like turn a selection of text ",
//             },
//             { text: "bold", bold: true },
//             {
//                 text: ", or add a semantically rendered block quote in the middle of the page, like this:",
//             },
//         ],
//     },
//     {
//         type: "block-quote",
//         children: [{ text: "A wise quote." }],
//     },
//     {
//         type: "paragraph",
//         align: "center",
//         children: [{ text: "Try it out for yourself!" }],
//     },
// ];
export default RichTextExample;
