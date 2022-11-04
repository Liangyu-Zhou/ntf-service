// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9; 
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct NFTForSell {
    uint256 price;
    address seller;
}

contract NFTService is ERC721URIStorage, Ownable{
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    
    Counters.Counter private _tokenIDs;
    mapping(uint256 => NFTForSell) private _sellList;

    event NFTTransfer(uint256 tokenID, address from, address to, string tokenURI, uint256 price);
    
    constructor() ERC721("my nfts", "ANFT") {}

    function createNFT(string calldata tokenURI) public {
        _tokenIDs.increment();
        uint256 currentID = _tokenIDs.current();
        _safeMint(msg.sender, currentID);
        _setTokenURI(currentID, tokenURI);
        emit NFTTransfer(currentID, address(0), msg.sender, tokenURI, 0);
    }
    
    function putOnShelf(uint256 tokenID, uint256 price) public {
        require(price > 0, "NFTService: price must be greater than 0");
        transferFrom(msg.sender, address(this), tokenID);
        _sellList[tokenID] = NFTForSell(price, msg.sender);
        emit NFTTransfer(tokenID, msg.sender, address(this), "", price);
    }

    function buyNFT(uint256 tokenID) public payable {
        NFTForSell memory nft = _sellList[tokenID];
        require(nft.price > 0, "NFTService: this NFT is not for sale");
        require(msg.value == nft.price, "NFTService: price is not correct");
        ERC721(address(this)).transferFrom(address(this), msg.sender, tokenID);
        removeFormSellList(tokenID);
        payable(nft.seller).transfer(nft.price.mul(95).div(100));
        emit NFTTransfer(tokenID, address(this), msg.sender, "", nft.price);
    }

    function cancelSelling(uint256 tokenID) public{
        NFTForSell memory nft = _sellList[tokenID];
        require(nft.price > 0, "NFTService: nft is not for sell");
        require(nft.seller == msg.sender, "NFTSerivce: only the owner can cancel selling");
        ERC721(address(this)).transferFrom(address(this), nft.seller, tokenID);
        removeFormSellList(tokenID);
        emit NFTTransfer(tokenID, address(this), msg.sender, "", nft.price);
    } 
    
    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "NFTService: No balance to withdraw");
        payable(msg.sender).transfer(balance);
    }

    function removeFormSellList(uint256 tokenID) private {
        _sellList[tokenID].price = 0;
        _sellList[tokenID].seller = address(0);
    }
}