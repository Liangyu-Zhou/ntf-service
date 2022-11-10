// SPDX-License-Identifier:MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract SampleNFTERC1155 is ERC1155 {
    constructor() ERC1155("https://sample-token-uri"){
        _mint(msg.sender, 1, 5, "");
        _mint(msg.sender, 2, 5, "");
        _mint(msg.sender, 3, 5, "");
        _mint(msg.sender, 4, 5, "");
        _mint(msg.sender, 5, 5, "");
    }
    
}