"use client";

import { useState, useEffect } from "react";
import WelcomeBack from "./WelcomeBack";

const WelcomePage = () => {
    const [sessionExists, setSessionExists] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setSessionExists(
                localStorage.getItem("userId") &&
                    localStorage.getItem("username")
            );
        }
    }, []);
    return sessionExists ? (
        <WelcomeBack />
    ) : (
        <div className="flex flex-col justify-center items-center bg-white bg-opacity-40 w-1/2 lg:w-1/4 h-64 xl:h-96 rounded-2xl">
            <div>
                <div className="text-3xl font-bold">
                    <p>Welcome</p>
                </div>
                <div className="flex items-center border-b border-teal-500 py-2 mt-4 lg:mt-10 xl:mt-16">
                    <input
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                        type="text"
                        placeholder="Enter a username"
                        aria-label="Full name"
                    />
                    <button
                        className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded font-bold"
                        type="button"
                    >
                        Start session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
