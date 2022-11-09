import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, Contract, ethers } from "ethers";
import { CreationValues } from "../../modules/CreationPage/CreationForm";
import useSigner from "../signer";
import NFT_MARKET from "../../../artifacts/contracts/NFTService.sol/NFTService.json";
import { NFT_MARKET_ADDRESS } from "./config";
import { NFT } from "./interfaces";
import useListedNFTs from "./useListedNFTs";
import useOwnedListedNFTs from "./useOwnedListedNFTs";
import useOwnedNFTs from "./useOwnedNFTs";

const useNFTMarket = () => {
    const { signer } = useSigner();
    const contractAddr = NFT_MARKET_ADDRESS;
    const nftMarket = new Contract("0x1a530E6840aE58a752C7a8f82d84e0686Dc9E944", NFT_MARKET.abi, signer);

    const ownedNFTs = useOwnedNFTs();
    const ownedListedNFTs = useOwnedListedNFTs();
    const listedNFTs = useListedNFTs();

    const createNFT = async (values: CreationValues) => {
        try {
            const data = new FormData();
            data.append("name", values.name);
            data.append("description", values.description);
            data.append("image", values.image!);
            const response = await fetch("/api/nft-storage", {
                method: "POST",
                body: data,
            });
            if (response.status == 201) {
                const json = await response.json();
                const transaction: TransactionResponse = await nftMarket.createNFT(
                    json.uri
                );
                await transaction.wait();
            }
        } catch (e) {
            console.log(e);
        }
    };

    const listNFT = async (tokenID: string, price: BigNumber) => {
        const transaction: TransactionResponse = await nftMarket.putOnShelf(
            tokenID,
            price
        );
        await transaction.wait();
    };

    const cancelListing = async (tokenID: string) => {
        const transaction: TransactionResponse = await nftMarket.cancelSelling(
            tokenID
        );
        await transaction.wait();
    };

    const buyNFT = async (nft: NFT) => {
        const transaction: TransactionResponse = await nftMarket.buyNFT(nft.id, {
            value: ethers.utils.parseEther(nft.price),
        });
        await transaction.wait();
    };

    return {
        createNFT,
        listNFT,
        cancelListing,
        buyNFT,
        ...ownedNFTs,
        ...ownedListedNFTs,
        ...listedNFTs,
    };
};

export default useNFTMarket;
