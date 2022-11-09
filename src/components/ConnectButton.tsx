import React from "react";
import AddressAvatar from "./AddressAvatar"
import Button from "./Button";
import useSigner from "../state/signer";
const ConnectButton = () => {
    const { address, loading, connectWallet } = useSigner();

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