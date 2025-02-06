"use client";
const WelcomeBack = () => {
    const username = localStorage.getItem("username");
    return (
        <div className="flex flex-col justify-center items-center bg-white opacity-60 w-1/2 lg:w-1/4 h-64 xl:h-96 rounded-2xl">
            <div>
                <div className="text-3xl font-bold">
                    <p>
                        Welcome back{" "}
                        <span className="text-teal-600">{username}</span>!
                    </p>
                </div>
            </div>
            <div className="mt-16 flex flex-col">
                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 focus:ring-4 focus:outline-none focus:ring-lime-200 ">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-teal-500 rounded-md group-hover:bg-opacity-0 font-semibold text-white group-hover:text-slate-800">
                        Join existing presentations
                    </span>
                </button>
                <button className="relative self-center inline-flex items-center justify-center p-0.5 mb-2 me-2  overflow-hidden text-sm font-medium text-gray-900 rounded-lg group group-hover:from-teal-300 group-hover:to-lime-300   focus:outline-none focus:ring-lime-200">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75  bg-teal-500 rounded-md group-hover:bg-teal-600 font-semibold text-white">
                        Create a new session
                    </span>
                </button>
            </div>
        </div>
    );
};

export default WelcomeBack;
