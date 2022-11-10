// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Marketplace {
    using SafeMath for uint256;
    uint256 private marketplaceFee = 5;
    address private admin;

    struct SellList {
        address seller;
        address token;
        uint256 tokenId;
        uint256 amountOfToken;
        uint256 deadline;
        uint256 price;
        bool isSold;
    }
    struct OfferData {
        address offerAddress;
        uint256 offerPrice;
        bool isAccepted;
    }
    enum Action {
        RESERVED, STARTED
    }
    struct AuctionData {
        address creator;
        address token;
        address highestBidder;
        uint256 tokenId;
        uint256 amountOfToken;
        uint256 highestBid;
        uint256 startPrice;
        uint256 minIncrement;
        uint256 startDate;
        uint256 duration;
        Action action;
    }

    mapping (uint => address) public recepient;
    mapping (uint => uint) public fee;
    uint256 public recepientCount;

    mapping (uint => SellList) public sales;
    uint256 public salesId;

    mapping (address => uint) public escrowAmount;
    mapping (uint => AuctionData) public auction;
    uint256 public auctionId;

    mapping (uint => mapping (uint => OfferData)) public offerInfo;
    mapping (uint => uint) public offerCount;

    event SellEvent (
        address _seller,
        address _token,
        uint256 _offerId,
        uint256 _tokenId,
        uint256 _amount
    );
    
    event CancelledSell (
        address _seller,
        address _token,
        uint256 _tokenId,
        uint256 _amountOfToken
    );

    event BuyEvent (
        address _buyer,
        address _token,
        uint256 _tokenId,
        uint256 _amountOfToken,
        uint256 _price
    );

    constructor() {
        admin = msg.sender;
    }


    function updateTransactionFee(uint256 newFee) external onlyAdmin{
        marketplaceFee = newFee;
    }

    function updateFeeAndRecipient(address[] memory _recipient, uint256[] memory _fee) external onlyAdmin {
        require(_recipient.length == _fee.length, "updateFee: not match");
        recepientCount = _fee.length;
        for (uint i = 0; i < recepientCount; i++) {
            recepient[i] = _recipient[i];
            fee[i] = _fee[i];
        }
    }
    
    function createList (
        address _token,
        uint256 _tokenId,
        uint256 _amountOfToken,
        uint256 _deadline,
        uint256 _price
        ) external returns (bool) {
            require(_amountOfToken > 0, "The amount of tokens to list for sell, needs to be greater than 0");
            require(_price > 0, "Price should be greater than 0");
            require(_deadline > 3600, "deadline should be more than a hour");
            sales[salesId] = SellList(msg.sender, _token, _tokenId, _amountOfToken, block.timestamp+_deadline, _price, false);
            salesId++;
            emit SellEvent(msg.sender, _token, salesId, _tokenId, _amountOfToken);
            return true;
    }

    function buyListToken(uint256 _sellId) external payable returns (bool) {
        require(msg.sender != address(0), "Invalid address");
        require(sales[_sellId].isSold != true, "Token already sold");
        require(msg.value >= sales[_sellId].price, "price should be greater or equal");
        
        uint256 salePrice = sales[_sellId].price;
        uint256 feePrice = salePrice * marketplaceFee / 100;
        payable(sales[_sellId].seller).transfer(salePrice - feePrice);
        for (uint i = 0; i < recepientCount; i++) {
            payable(recepient[i]).transfer(feePrice * fee[i] / 100);
        }
        IERC1155(sales[_sellId].token).safeTransferFrom(
            sales[_sellId].seller,
            msg.sender,
            sales[_sellId].tokenId,
            sales[_sellId].amountOfToken,
            "0x0"
        );
        return true;
    }

    function cancelList(uint256 _sellId) external returns(bool) {
        require(sales[_sellId].seller == msg.sender, "sender should be owner");
        require(sales[_sellId].isSold != true, "already sold");

        delete sales[_sellId];
        emit CancelledSell(
            sales[_sellId].seller, 
            sales[_sellId].token, 
            sales[_sellId].tokenId,
            sales[_sellId].amountOfToken
        );
        return true;
    }
   
   function transfer(
       address _receiver,
       address _token,
       uint256 _tokenId,
       uint256 _amountOfToken
    ) external returns(bool) {
        IERC1155(_token).safeTransferFrom(
            msg.sender,
            _receiver,
            _tokenId,
            _amountOfToken,
            "0x0"
        );
        return true;
    }

    function makeOffer(uint256 _sellId, uint256 _price) external payable returns (bool) {
        require(msg.value == _price, "value sent should be equal to price");
        require(sales[_sellId].seller != msg.sender, "seller should not offer a price");
        require(sales[_sellId].isSold != true, "token already sold");

        uint256 counter = offerCount[_sellId];
        offerInfo[_sellId][counter] = OfferData(
            msg.sender, msg.value, false
        );
        offerCount[_sellId] ++;
        escrowAmount[msg.sender] += msg.value;
        return true;
    }

    function acceptOffer(uint256 _sellId, uint256 _offerCount) external returns (bool) {
        OfferData memory offer = offerInfo[_sellId][_offerCount];
        require(sales[_sellId].isSold != true, "already sold.");
        require(sales[_sellId].seller == msg.sender, "not seller");
        require(offer.isAccepted == false, "already accepted");
        require(offer.offerPrice <= escrowAmount[offer.offerAddress], "lower escrowed amount than offer price");

        uint256 offerPrice = offer.offerPrice;
        uint256 feePrice = offerPrice * marketplaceFee / 100;

        payable(offer.offerAddress).transfer(offerPrice - feePrice);
        for (uint i = 0; i < recepientCount; i++) {
            payable(recepient[i]).transfer(feePrice * fee[i] / 100);
        }
        escrowAmount[offer.offerAddress] -= offerPrice;
        IERC1155(sales[_sellId].token).safeTransferFrom(
            sales[_sellId].seller,
            offer.offerAddress,
            sales[_sellId].tokenId,
            sales[_sellId].amountOfToken,
            "0x0"
        );
        offerInfo[_sellId][_offerCount].isAccepted = true;
        return true;
    }

    function cancelOffer(uint256 _sellId, uint256 _offerCount) external returns(bool) {
        OfferData memory offer = offerInfo[_sellId][_offerCount];
        require(msg.sender == offer.offerAddress, "ont offer address");
        require(offer.isAccepted == false, "already accepted");
        require(offer.offerPrice <= escrowAmount[msg.sender], "should lower than escrowedAmount");
        
        payable(offer.offerAddress).transfer(offer.offerPrice);
        escrowAmount[msg.sender] -= offer.offerPrice;
        delete offerInfo[_sellId][_offerCount];
        return true;
    }

    function depositEscrow() external payable returns(bool) {
        escrowAmount[msg.sender] += msg.value;
        return true;
    }

    function withdrawEscrow(uint256 _amount) external payable returns(bool) {
        require(_amount < escrowAmount[msg.sender], "insuffient number");
        payable(msg.sender).transfer(_amount);
        escrowAmount[msg.sender] -= _amount;
        return true;
    }

    function createAuction(
        address _token,
        uint256 _tokenId,
        uint256 _amountOfToken,
        uint256 _startPrice,
        uint256 _minIncrement,
        uint256 _startDate,
        uint256 _duration,
        bool _reserved
    ) external returns (bool) {
        require(_amountOfToken > 0, "createAuction: The amount of tokens to sell, needs to be greater than 0");
        require(_startPrice > 0, "createAuction: The startPrice for the tokens need to be greater than 0");
        require(_duration > 86400, "createAuction: The deadline should to be greater than 1 day");
        require(_startPrice > 0, "createAuction: The start Price should be bigger than 0");
        require(_minIncrement > 0, "createAuction: The minIncrement should be bigger than 0");
        require(_startDate > block.timestamp, "createAuction: The start date should be after now");
        // require(msg.sender == ownerOf(_tokenId), "only owner can  create an auction");

        Action action = Action.RESERVED;
        if (! _reserved) {
            action = Action.STARTED;
        }
        auction[auctionId] = AuctionData (
            msg.sender,
            _token,
            address(0),
            _tokenId,
            _amountOfToken,
            _startPrice - _minIncrement,
            _startPrice,
            _minIncrement,
            _startDate,
            _duration,
            action
        );
        auctionId++;
        return true;
    }

    function placeBid(uint256 _auctionId) external payable returns (bool) {
        AuctionData memory auctionInfo = auction[_auctionId];
        require(msg.value >= auctionInfo.highestBid + auctionInfo.minIncrement, "bit amount should be bigger than highestBid");
        require(msg.sender != auctionInfo.creator, "creator of auction cannot bid");
        require(block.timestamp >= auctionInfo.startDate, "auction hasn't started");
        require(auctionInfo.action == Action.RESERVED || auctionInfo.startDate + auctionInfo.duration > block.timestamp, "auction has ended");

        if (auctionInfo.highestBidder != address(0)) {
            payable(auctionInfo.highestBidder).transfer(auctionInfo.highestBid);
        }

        if (auctionInfo.action == Action.RESERVED) {
            auction[_auctionId].startDate = block.timestamp;
            auction[_auctionId].action = Action.STARTED;
        }
        auction[_auctionId].highestBidder = msg.sender;
        auction[_auctionId].highestBid = msg.value;
        return true;
    }

    function cancelAuction(uint256 _auctionId) external returns(bool) {
        AuctionData memory auctionInfo = auction[_auctionId];

        require(msg.sender == auctionInfo.highestBidder, "msg sender should be the highest bidder");
        require(block.timestamp > auctionInfo.startDate + auctionInfo.duration, "auction hasn't started");
        require(auctionInfo.highestBidder == address(0), "auction can be canceled only when there's no bidder");

        delete auction[_auctionId];
        return true;         
    }

    function claimAuction(uint256 _auctionId) external returns(bool) {
        AuctionData memory auctionInfo = auction[_auctionId];
        require(msg.sender == auctionInfo.highestBidder, "only highest bidder can claim auction");
        require(block.timestamp > auctionInfo.startDate + auctionInfo.duration, "auction hasn't ended");
        
        IERC1155(auctionInfo.token).safeTransferFrom(
            auctionInfo.creator,
            auctionInfo.highestBidder,
            auctionInfo.tokenId,
            auctionInfo.amountOfToken,
            "0x0"
        );
        uint256 bidPrice = auctionInfo.highestBid;
        uint256 feePrice = bidPrice * marketplaceFee / 100;
        payable(auctionInfo.creator).transfer(bidPrice - feePrice);
        for (uint i = 0; i < recepientCount; i++) {
            payable(recepient[i]).transfer(feePrice * fee[i] / 100);
        }
        return true;
    }

    modifier onlyAdmin {
        require(admin == msg.sender, "only admin can access");
        _;
    }
}