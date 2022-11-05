import React from "react";
import AddressAvatar from "./AddressAvatar"
import Button from "./Button";

const ConnectButton = () => {
    const address = "";
    const loading = false;
    const connectWallet = () => {
        // TODO:
    };

    if (address) return <AddressAvatar address={address}></AddressAvatar>;
    return (<button 
        className="flex h-10 w-36 items-center justify-center rounded-full bg-black px-4 font-semibold text-white" 
        onClick={connectWallet}
        disabled={loading}>
            {loading ? "Busy..." : "Connect Wallet"}
        </button>
    );
};

export default ConnectButton;