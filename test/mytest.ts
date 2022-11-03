import {loadFixture, time} from "@nomicfoundation/hardhat-network-helpers"
import { lookupService } from "dns/promises";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Lock", function () {
    async function deployOneYearLockFixture() {
        const ONE_YEAR_IN_SECS = 365 * 24 *60 * 60;
        const ONE_GWEI = 1_000_000_000;
        
        const lockedAmount = ONE_GWEI;
        const unlocktime = (await time.latest()) + ONE_YEAR_IN_SECS;
        
        const [owner, otherAccount] = await ethers.getSigners();
        const LockFactory = await ethers.getContractFactory("Lock");
        const lock = await LockFactory.deploy(unlocktime, {value : lockedAmount});
        return {lock, unlocktime, lockedAmount, owner, otherAccount};
    }

    describe("Deployment", function() {
        it("Should set the right unlocktime", async function() {
            const {lock, unlocktime} = await loadFixture(deployOneYearLockFixture)
            expect(await lock.unlockTime()).to.equal(unlocktime);
        })
        
        it("should set the right owner", async function() {
            const {lock, owner} = await loadFixture(deployOneYearLockFixture);
            expect(await lock.owner()).to.equal(owner.address); 
        })
        it ("Should receive and store the funds to lock", async function() {
            const {lock, lockedAmount} = await loadFixture(deployOneYearLockFixture);
            expect(await ethers.provider.getBalance(lock.address)).to.equal(lockedAmount);
        }); 
        it("Should fail if the locktime is not in the future", async function()  {
            const {lock, unlocktime} = await loadFixture(deployOneYearLockFixture);
            const latestTime = await time.latest();
            const LockFactory = await ethers.getContractFactory("Lock");
            await expect(LockFactory.deploy(latestTime, {value : 1})).to.be.revertedWith(
                "Unlock time should be in the future"
            );
        })
    });

})