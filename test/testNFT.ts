import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT service", () => {
    it("Should do something", async () => {
        const NFTService = await ethers.getContractFactory('NFTService');
        const nftService = await NFTService.deploy();
        await nftService.deployed();
        
        const tokenURI = 'https://some-url';
        const trx = await nftService.createNFT(tokenURI);
        // console.log(trx);
        const receipt = await trx.wait();
        console.log(receipt);
        
        expect

    })
})