import { expect } from "chai";
import {ethers} from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {Contract} from "ethers"
describe("ERC1155 test", function() {
    let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress;
    let MarketPlace, TestNFT, marketplace: Contract, testNFT: Contract;
    before(async ()=> {
        [owner, addr1, addr2] = await ethers.getSigners();
        MarketPlace = await ethers.getContractFactory("ERC1155Marketplace");
        TestNFT = await ethers.getContractFactory("SampleNFTERC1155");
        marketplace = await MarketPlace.deploy();
        testNFT = await TestNFT.connect(addr1).deploy();
        
    });
    describe("test updateFeeAndRecipient", ()=>{
        it("should revert if recipient number is not equal to fee length", async() => {
            const recipients:string[] = [addr1.address];
            const fees : number[] = [1, 2];
            const trx = marketplace.updateFeeAndRecipient(recipients, fees);
            await expect(trx).to.be.revertedWith("updateFee: not match");
        });
    });
    
    it("create list and buy", async () => {
        await testNFT.connect(addr1).setApprovalForAll(marketplace.address, true);
        await marketplace.connect(addr1).createList(testNFT.address, 1, 5, 4000, ethers.utils.parseEther("0.1"));
        await marketplace.connect(addr2).buyListToken(0, {value: ethers.utils.parseEther("0.1")});        
    })
});
