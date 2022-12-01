import Link from "next/link"
import ConnectButton from "../ConnectButton";
import React from "react";


const TopBar = () => {
    return (
        <div className="fixed top-0 w-full">
            <div className="relative flex w-full items-center px-4 py-4 shadow">
                <ConnectButton></ConnectButton>
            </div>
        </div>
    );
}

export default TopBar;