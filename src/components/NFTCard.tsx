import classNames from "classnames";
import { BigNumber } from "ethers";
import React from "react";
import { useEffect, useState } from "react";
import { ipfsToHTTPS } from "../helpers";
import { NFT } from "../state/nft-market/interfaces";
import AddressAvatar from "./AddressAvatar";
import SellPopup from "./SellPopup";

type NFTMetadata = {
    name: string;
    description: string;
    imageURL: string;
};

type NFTCardProps = {
    nft: NFT;
    className?: string;
}

const NFTCard = (props: NFTCardProps) => {
    const { nft, className } = props;
    const address = "";
    const [meta, setMeta] = useState<NFTMetadata>();
    const [loading, setLoading] = useState(false);
    const [SellPopupOpen, setSellPopupOpen] = useState(false);
    const forSale = nft.price != "0";
    const owned = nft.owner == address?.toLowerCase();

    useEffect(() => {
        const fetchMetadata = async () => {
            const metadataResponse = await fetch(ipfsToHTTPS(nft.tokenURI));
            if (metadataResponse.status != 200) return;
            const json = await metadataResponse.json();
            setMeta({
                name: json.name,
                description: json.description,
                imageURL: ipfsToHTTPS(json.image),
            });
        }
    }, [nft.tokenURI]);

    const onBuyCliked = async () => {

    };
    const onCancelClicked = async () => {

    };
    const onSellConfirmed = async () => {

    };

    const onButtonClick = async () => {
        if (owned) {
            if (forSale) onCancelClicked();
            else setSellPopupOpen(true);
        } else {
            if (forSale) onBuyCliked();
            else throw new Error("onButtonClick called when NFT is not owned or is not for sell, should never happen");

        }
    };

    return (
        <div className={classNames("flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-xl border font-semibold shadow-sm",
            className)}
        >
            {meta ? (
                <img
                    src={meta?.imageURL}
                    alt={meta?.name}
                    className="h-80 w-full object-cover object-center"
                />
            ) : (
                <div className="flex h-80 w-full items-center justify-center">
                    loading...
                </div>
            )}
            <div className="flex flex-col p-4">
                <p className="text-lg">{meta?.name ?? "..."}</p>
                <span className="text-sm font-normal">{meta?.description ?? "..."}</span>
                <AddressAvatar address={nft.owner}></AddressAvatar>
            </div>
            <button
                className="group flex h-16 items-center justify-center bg-black text-lg font-semibold text-white"
                onClick={onButtonClick}
                disabled={loading}
            >
                {loading && "Busying"}
                {!loading && (
                    <>
                        {!forSale && "SELL"}
                        {forSale && owned && (
                            <>
                                <span className="group-hover:hidden">{nft.price} ETH</span>
                                <span className="hidden group-hover:inline">CANCEL</span>
                            </>
                        )}
                        {forSale && !owned && (
                            <>
                                <span className="group-hover:hidden">{nft.price} ETH</span>
                                <span className="hidden group-hover:inline">BUY</span>
                            </>
                        )}
                    </>
                )}
            </button>
            <SellPopup 
                open={SellPopupOpen}
                onClose={()=> setSellPopupOpen(false)}
                onSubmit={onSellConfirmed}
            />
        </div>
    );
};
export default NFTCard;