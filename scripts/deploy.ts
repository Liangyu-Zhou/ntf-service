import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signer } from "ethers";
import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const addr = await signers[0].getAddress();
  const balance = await signers[0].getBalance();
  console.log(`${addr} has ${balance}`);
  const NFTService = await ethers.getContractFactory('NFTService');
  
  const nftService = await NFTService.deploy();
  const trx =  await nftService.deployed();
  console.log(trx.estimateGas)
  console.log("nftService deployed at", nftService.address);
  // console.log(`Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
