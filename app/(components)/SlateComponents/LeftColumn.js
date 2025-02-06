/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
// const LeftColumn = () => {
//     const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
//     return (
//         <div className="flex flex-col items-center w-[200px] min-h-[500px] max-h-[2000px] overflow-y-auto mb-24">
//             {arr.map((x) => (
//                 <div className="bg-white my-2 w-32 h-20" value={x} key={x}>
//                     <div>{x}</div>
//                 </div>
//             ))}
//         </div>
//     );
// };
// export { LeftColumn };

"use client";

import { v4 as uuid } from "uuid";

import { Slide } from "./LeftColumnSlide";
import { Reorder } from "framer-motion";

export const LeftColumn = ({ slides, addNewSlide, handleSlidesReorder }) => {
    const onNewSlideClick = () => {
        addNewSlide(uuid());
    };

    return (
        <>
            <div className="fixed w-[200px] bg-slate-300 px-1 py-1">
                <button
                    type="button"
                    className="mr-[27px] border-2 border-black"
                    onClick={onNewSlideClick}
                >
                    New slide
                </button>
                <button type="button" className="border-2 border-black">
                    Delete Slide
                </button>
            </div>
            <div className="flex flex-col items-center w-[200px] min-h-[500px] max-h-[2000px] overflow-y-auto mb-24 mt-8">
                {slides && slides.length > 0 && (
                    <Reorder.Group
                        axis="y"
                        onReorder={handleSlidesReorder}
                        values={slides}
                    >
                        {slides.map((slide, idx) => (
                            <Slide index={idx} key={slide.id} slide={slide} />
                        ))}
                    </Reorder.Group>
                )}
            </div>
        </>
    );
};
