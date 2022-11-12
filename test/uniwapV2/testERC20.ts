import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers"
describe("ERC1155 test", function () {
    let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress;
    let MarketPlace, TestNFT, marketplace: Contract, testNFT: Contract;
    before(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
        MarketPlace = await ethers.getContractFactory("ERC1155Marketplace");
        TestNFT = await ethers.getContractFactory("SampleNFTERC1155");
        marketplace = await MarketPlace.deploy();
        testNFT = await TestNFT.connect(addr1).deploy();

    });

    describe("test updateFeeAndRecipient", () => {
        it("should revert if recipient number is not equal to fee length", async () => {
            const recipients: string[] = [addr1.address];
            const fees: number[] = [1, 2];
            const trx = marketplace.updateFeeAndRecipient(recipients, fees);
            await expect(trx).to.be.revertedWith("updateFee: not match");
        });
    });

    it("create list and buy", async () => {
        await testNFT.connect(addr1).setApprovalForAll(marketplace.address, true);
        await marketplace.connect(addr1).createList(testNFT.address, 1, 5, 4000, ethers.utils.parseEther("0.1"));
        await marketplace.connect(addr2).buyListToken(0, { value: ethers.utils.parseEther("0.1") });
    });
});








// import chai, { expect } from 'chai'
// import { Contract } from 'ethers'
// import { MaxUint256 } from 'ethers/constants'
// import { bigNumberify, hexlify, keccak256, defaultAbiCoder, toUtf8Bytes } from 'ethers/utils'
// import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
// import { ecsign } from 'ethereumjs-util'

// import { expandTo18Decimals, getApprovalDigest } from './shared/utilities'

// import ERC20 from '../build/ERC20.json'

// chai.use(solidity)

// const TOTAL_SUPPLY = expandTo18Decimals(10000)
// const TEST_AMOUNT = expandTo18Decimals(10)

// describe('UniswapV2ERC20', () => {
//     const provider = new MockProvider({
//         hardfork: 'istanbul',
//         mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
//         gasLimit: 9999999
//     })
//     const [wallet, other] = provider.getWallets()

//     let token: Contract
//     beforeEach(async () => {
//         token = await deployContract(wallet, ERC20, [TOTAL_SUPPLY])
//     })

//     it('name, symbol, decimals, totalSupply, balanceOf, DOMAIN_SEPARATOR, PERMIT_TYPEHASH', async () => {
//         const name = await token.name()
//         expect(name).to.eq('Uniswap V2')
//         expect(await token.symbol()).to.eq('UNI-V2')
//         expect(await token.decimals()).to.eq(18)
//         expect(await token.totalSupply()).to.eq(TOTAL_SUPPLY)
//         expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY)
//         expect(await token.DOMAIN_SEPARATOR()).to.eq(
//             keccak256(
//                 defaultAbiCoder.encode(
//                     ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
//                     [
//                         keccak256(
//                             toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
//                         ),
//                         keccak256(toUtf8Bytes(name)),
//                         keccak256(toUtf8Bytes('1')),
//                         1,
//                         token.address
//                     ]
//                 )
//             )
//         )
//         expect(await token.PERMIT_TYPEHASH()).to.eq(
//             keccak256(toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'))
//         )
//     })

//     it('approve', async () => {
//         await expect(token.approve(other.address, TEST_AMOUNT))
//             .to.emit(token, 'Approval')
//             .withArgs(wallet.address, other.address, TEST_AMOUNT)
//         expect(await token.allowance(wallet.address, other.address)).to.eq(TEST_AMOUNT)
//     })

//     it('transfer', async () => {
//         await expect(token.transfer(other.address, TEST_AMOUNT))
//             .to.emit(token, 'Transfer')
//             .withArgs(wallet.address, other.address, TEST_AMOUNT)
//         expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
//         expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
//     })

//     it('transfer:fail', async () => {
//         await expect(token.transfer(other.address, TOTAL_SUPPLY.add(1))).to.be.reverted // ds-math-sub-underflow
//         await expect(token.connect(other).transfer(wallet.address, 1)).to.be.reverted // ds-math-sub-underflow
//     })

//     it('transferFrom', async () => {
//         await token.approve(other.address, TEST_AMOUNT)
//         await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
//             .to.emit(token, 'Transfer')
//             .withArgs(wallet.address, other.address, TEST_AMOUNT)
//         expect(await token.allowance(wallet.address, other.address)).to.eq(0)
//         expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
//         expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
//     })

//     it('transferFrom:max', async () => {
//         await token.approve(other.address, MaxUint256)
//         await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
//             .to.emit(token, 'Transfer')
//             .withArgs(wallet.address, other.address, TEST_AMOUNT)
//         expect(await token.allowance(wallet.address, other.address)).to.eq(MaxUint256)
//         expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
//         expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
//     })

//     it('permit', async () => {
//         const nonce = await token.nonces(wallet.address)
//         const deadline = MaxUint256
//         const digest = await getApprovalDigest(
//             token,
//             { owner: wallet.address, spender: other.address, value: TEST_AMOUNT },
//             nonce,
//             deadline
//         )

//         const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(wallet.privateKey.slice(2), 'hex'))

//         await expect(token.permit(wallet.address, other.address, TEST_AMOUNT, deadline, v, hexlify(r), hexlify(s)))
//             .to.emit(token, 'Approval')
//             .withArgs(wallet.address, other.address, TEST_AMOUNT)
//         expect(await token.allowance(wallet.address, other.address)).to.eq(TEST_AMOUNT)
//         expect(await token.nonces(wallet.address)).to.eq(bigNumberify(1))
//     })
// })
