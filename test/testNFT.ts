import { NodesmithProvider } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { constants, transcode } from "buffer";
import { expect } from "chai";
import exp from "constants";
import { sign } from "crypto";
import { Contract, constants as ethersConstans } from "ethers";
import { ethers } from "hardhat";
import { any } from "hardhat/internal/core/params/argumentTypes";
import { hasUncaughtExceptionCaptureCallback } from "process";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("NFT service", () => {
    let nftService: Contract
    let signers: SignerWithAddress[]
    const tokenURI = "https://sample/token.uri"

    before(async ()=>{
        const NFTService = await ethers.getContractFactory('NFTService');
        nftService = await NFTService.deploy();
        await nftService.deployed();
        signers = await ethers.getSigners();
    });
    const createNFT = async (tokenURI: string)=> {
        const transaction = await nftService.createNFT(tokenURI);
        const receipt = await transaction.wait();
        const tokenID = receipt.events[0].args.tokenId;
        return tokenID;
    }
    const createAndSell = async (price: number)=>{
        const tokenID = await createNFT(tokenURI);
        const transaction = await nftService.putOnShelf(tokenID, price);
        await transaction.wait();
        return tokenID;
    }
    

    describe("CreateNFT", ()=>{
        it("should create NFT with the specified owner and tokenURI", async ()=>{
            const transaction = await nftService.createNFT(tokenURI);
            const receipt = await transaction.wait();
            const tokenID = receipt.events[0].args.tokenId;

            //tokenURI this method is inherited from ERC721
            const mintedURI = await nftService.tokenURI(tokenID);
            expect(mintedURI).to.equal(tokenURI);

            const mintedOwner = await nftService.ownerOf(tokenID);
            const ethersAddr = await signers[0].getAddress();
            expect(mintedOwner).to.equal(ethersAddr);

            const event = receipt.events[1].args;
            expect(event.tokenID).to.equal(tokenID);
            expect(event.from).to.equal(ethersConstans.AddressZero);
            expect(event.to).to.equal(mintedOwner);
            expect(event.tokenURI).to.equal(tokenURI);
            expect(event.price).to.equal(0);
        });
    })


    describe("Put NFT On Shelf For Sell", ()=>{
        it("should revert if price is 0", async ()=>{
            const tokenID = await createNFT(tokenURI);
            const transaction = nftService.putOnShelf(tokenID, 0);
            await expect(transaction).to.be.revertedWith(
                "NFTService: price must be greater than 0"
            );
        });
        
        it("should revert if not called by the owner", async ()=>{
           const tokenID = await createNFT(tokenURI);
           const transaction = nftService.connect(signers[1]).putOnShelf(tokenID, 232);
           await expect(transaction).to.be.revertedWith(
                "ERC721: caller is not token owner nor approved"
           );
        });

        it("should put NFT on shelf for sell", async ()=>{
            const price = 10000;
            const tokenID = await createNFT(tokenURI);
            const transaction = await nftService.putOnShelf(tokenID, price);
            const receipt = await transaction.wait();
            
            const owner = await nftService.ownerOf(tokenID);
            expect(owner).to.equal(nftService.address);
            
            const event = receipt.events[2].args;
            expect(event.tokenID).to.equal(tokenID);
            expect(event.from).to.equal(signers[0].address);
            expect(event.to).to.equal(nftService.address);
            expect(event.tokenURI).to.equal("");
            expect(event.price).to.equal(price);
        });
    });
    

    describe("buyNFT", ()=>{
        it("should revert if NFT is not for sell", async ()=>{
            const impossibleTokenID = 11111111
            const transaction = nftService.buyNFT(impossibleTokenID);
            await expect(transaction).to.be.revertedWith(
                "NFTService: this NFT is not for sale"
            );
        });

        it("should revert if sent value is not equal to price", async()=>{
            const tokenID = await createAndSell(121);
            const transaction = nftService.buyNFT(tokenID);
            await expect(transaction).to.be.revertedWith(
                "NFTService: price is not correct"
            );
        });

        it("should transfer NFT to buyer", async()=>{
            const price = 1000;
            const fee = Math.floor((price * 5) / 100);
            const sellerProfit = price - fee;
            const contractBalance = await nftService.provider.getBalance(nftService.address);
            const tokenID = await createAndSell(price);
            
            await new Promise( (r) => {setTimeout(r, 100)} );
            const oldSellerBalance = await signers[0].getBalance();
            const trx = await nftService.connect(signers[1]).buyNFT(tokenID, {value:price});
            const receipt = await trx.wait();

            await new Promise( (r) => {setTimeout(r, 100)});
            const newSellerBalance = await signers[0].getBalance();
            const diff = newSellerBalance.sub(oldSellerBalance);
            expect(diff).to.equal(sellerProfit);
            
            const newContractBalance = await nftService.provider.getBalance(nftService.address);
            const contractDiff = newContractBalance.sub(contractBalance);
            expect(contractDiff).to.equal(fee);

            const owner = await nftService.ownerOf(tokenID);
            expect(owner).to.equal(signers[1].address);

            const event = receipt.events[2].args;
            expect(event.tokenID).to.equal(tokenID);
            expect(event.from).to.equal(nftService.address);
            expect(event.to).to.equal(signers[1].address);
            expect(event.tokenURI).to.equal("");
            expect(event.price).to.equal(price);
        });
    });


    describe("cancel selling", ()=>{
       it("should revert if the NFT is not for sell", async () => {
           const impossibleTokenID = 11111111;
           const trx = nftService.cancelSelling(impossibleTokenID);
           await expect(trx).to.be.revertedWith("NFTService: nft is not for sell");
       });

       it("should revert if the caller is not the owner", async ()=>{
            const tokenID = await createAndSell(10000);
            const trx = nftService.connect(signers[1]).cancelSelling(tokenID);
           await expect(trx).to.be.revertedWith("NFTSerivce: only the owner can cancel selling");
       });

       it("should cancel selling and transfer NFT to owner", async()=>{
           const tokenID = await createAndSell(10000);
            const trx = await nftService.cancelSelling(tokenID);
            const receipt = await trx.wait();
            
            const owner = await nftService.ownerOf(tokenID);
            expect(owner).to.equal(signers[0].address);
            const event = receipt.events[2].args;
            expect(event.tokenID).to.equal(tokenID);
            expect(event.from).to.equal(nftService.address);
            expect(event.to).to.equal(signers[0].address);
            expect(event.tokenURI).to.equal("");
            expect(event.price).to.equal(10000);
       });
    });
    

    describe("withdrawFunds", ()=>{
        it("should revert if not called by owner", async ()=>{
            const trx = nftService.connect(signers[1]).withdrawFunds();
            await expect(trx).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("should withdrawFunds to owner of contract", async()=>{
            const contractBalance = await nftService.provider.getBalance(nftService.address);
            const ownerBalance = await signers[0].getBalance();
            
            const trx = await nftService.withdrawFunds();
            const receipt = await trx.wait();
            
            await new Promise( (r) => {setTimeout(r, 100)});
            const newOwnerBalance = await signers[0].getBalance();
            
            const gas = receipt.gasUsed.mul(receipt.effectiveGasPrice);
            const transferred = newOwnerBalance.add(gas).sub(ownerBalance);
            expect(transferred).to.equal(contractBalance);
        });

        it("should revert if contract balance is 0", async()=>{
            const trx = nftService.withdrawFunds();
            await expect(trx).to.be.revertedWith("NFTService: No balance to withdraw");
        })
    })
});