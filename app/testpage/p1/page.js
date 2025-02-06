"use client";

import { useState, useEffect, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import WebSocket from "ws";
import { Awareness } from "y-protocols/awareness";
import { v4 as uuid } from "uuid";

export default function CollaborativeTextbox() {
    const clientUniqueId = uuid();
    const [text, setText] = useState("");
    // const docRef = useRef(null);
    const yTextRef = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const doc = new Y.Doc();

            // docRef.current = doc;
            const wsOpts = {
                // Set this to false if you want to connect manually using wsProvider.connect()
                connect: true,
                // Specify a query-string / url parameters that will be url-encoded and attached to the serverUrl
                // I.e. params = { auth: "bearer" } will be transformed to "?auth=bearer"
                params: {}, // Object<string,string>
                // You may polyill the Websocket object (https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).
                // E.g. In nodejs, you could specify WebsocketPolyfill = require('ws')
                WebsocketPolyfill: WebSocket,
                // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
                awareness: new Awareness(doc),
                // Specify the maximum amount to wait between reconnects (we use exponential backoff).
                maxBackoffTime: 2500,
            };

            const wsProvider = new WebsocketProvider(
                `ws://localhost:1234?props=${uuid()}`,
                "my-roomname",
                doc,
                wsOpts
            );

            //set current client data -> new field called "user" and its value=>value
            wsProvider.awareness.setLocalState({
                name: "Mark",
                userId: clientUniqueId,
                color: "#00ffff",
            });

            // wsProvider.awareness.setLocalState({ admin: "mark" });

            //get current clientID specific to this awareness instance
            // this client Id can change.. use userID to maintain identity
            console.log("Awareness clientID", wsProvider.awareness.clientID);
            console.log("Doc Client ID: ", doc.clientID);

            // view All clients -> returns Map object where keys
            //  are all the client ids in this room including the current one.
            console.log(
                "get this.client data",
                wsProvider.awareness.getLocalState()
            );

            //----------------------------
            console.log(
                "All clients in this room: ",
                wsProvider.awareness.getStates()
            );

            const yText = doc.getText("shared-text");

            yTextRef.current = yText;

            yText.observe(() => {
                setText(yText.toString());
            });

            return () => {
                wsProvider.destroy();
            };
        }
    }, []);

    const handleChange = (e) => {
        const newText = e.target.value;
        const yText = yTextRef.current;
        if (yText) {
            yText.delete(0, yText.length);
            yText.insert(0, newText);
        }
    };

    return (
        <div>
            <h1>Collaborative Textbox</h1>
            <textarea
                className="text-blue-700"
                value={text}
                onChange={handleChange}
                placeholder="Type something..."
                rows="10"
                cols="50"
            />
        </div>
    );
}
