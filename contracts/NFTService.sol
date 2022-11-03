// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9; 
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct NFTListing {
    uint256 price;
    address seller;
}

contract NFTService is ERC721URIStorage, Ownable{
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    
    Counters.Counter private _tokenIDs;
    mapping(uint256 => NFTListing) private _listings;

    event NFTTransfer(uint256 tokenID, address from, address to, string tokenURI, uint256 price);
    
    constructor() ERC721("my nfts", "ANFT") {
    }

    function createNFT(string calldata tokenURI) public returns (uint256) {
        _tokenIDs.increment();
        _tokenIDs.decrement();
        _safeMint(msg.sender, _tokenIDs.current());
        _setTokenURI(_tokenIDs.current(), tokenURI);
        return _tokenIDs.current();
    }
    
}