const RightColumn = () => {
    return (
        <div className="fixed w-[200px] bg-slate-300">
            <div className="fixed w-[200px] bg-slate-300 flex flex-col items-center border-b-2 border-black">
                <button
                    type="button"
                    className="mx-1 my-2 border-2 border-black"
                >
                    Present Now
                </button>
                <p className="text-sm"> Connected users</p>
            </div>
            <div className="flex flex-col items-left pl-5 w-[200px] min-h-[500px] max-h-[2000px] overflow-y-auto mb-24 mt-[4.5rem]">
                Right column
            </div>
        </div>
    );
};

export default RightColumn;
