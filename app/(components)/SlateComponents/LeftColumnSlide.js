/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
"use client";
import { useRaisedShadow } from "@/app/utils";
import { Reorder, useMotionValue } from "framer-motion";

export const Slide = ({ slide, index }) => {
    const y = useMotionValue(0);
    const boxShadow = useRaisedShadow(y);

    return (
        <Reorder.Item value={slide} id={slide.id} style={{ boxShadow, y }}>
            <div
                className="bg-white my-2 w-32 h-20"
                value={slide.id}
                key={slide.id}
            >
                <div>{slide.id}</div>
            </div>
        </Reorder.Item>
    );
};
