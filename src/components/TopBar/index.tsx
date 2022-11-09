import Link from "next/link"
import ConnectButton from "../ConnectButton";
import NavBar from "./NavBar";
import React from "react";


const TopBar = () => {
    return (
        <div className="fixed top-0 w-full">
            <div className="relative flex w-full items-center px-4 py-4 shadow">
                <Link href="/" className="text-lg font-bold">
                    NFT Service
                </Link>
                <div className="flex-grow">
                    <NavBar></NavBar>
                </div>
                <ConnectButton></ConnectButton>
            </div>
        </div>
    );
}

export default TopBar;