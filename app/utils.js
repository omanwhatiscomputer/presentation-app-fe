import randomColor from "randomcolor";

export function addAlpha(hexColor, opacity) {
    const normalized = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
    return hexColor + normalized.toString(16).toUpperCase();
}

export function getRandomColor() {
    return randomColor({
        luminosity: "dark",
        alpha: 1,
        format: "hex",
    });
}

import { animate, useMotionValue } from "framer-motion";
import { useEffect } from "react";

const inactiveShadow = "0px 0px 0px rgba(0,0,0,0.8)";

export function useRaisedShadow(value) {
    const boxShadow = useMotionValue(inactiveShadow);

    useEffect(() => {
        let isActive = false;
        value.onChange((latest) => {
            const wasActive = isActive;
            if (latest !== 0) {
                isActive = true;
                if (isActive !== wasActive) {
                    animate(boxShadow, "5px 5px 10px rgba(0,0,0,0.3)");
                }
            } else {
                isActive = false;
                if (isActive !== wasActive) {
                    animate(boxShadow, inactiveShadow);
                }
            }
        });
    }, [value, boxShadow]);

    return boxShadow;
}
