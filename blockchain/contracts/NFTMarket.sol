// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {

    address payable owner;
    uint public listingPrice = 0.025 ether;
    uint private _itemIds;
    uint private _itemsSold;

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint => MarketItem) public marketItems; // itemId => MarketItem

    event MarketItemCreated(
        uint indexed itemId,
        address indexed nftContract,
        uint indexed tokenId,
        address seller,
        uint price
    );

    constructor() {
        owner = payable(msg.sender);
    }

    function createMarketItem(address nftContract, uint tokenId, uint price) public payable nonReentrant {
        require(price > 0, "Price cannot be 0");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        _itemIds++;

        marketItems[_itemIds] = MarketItem(
            _itemIds,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            _itemIds,
            nftContract,
            tokenId,
            msg.sender,
            price
        );
    }

    function createMarketSale(address nftContract, uint itemId) public payable nonReentrant {
        uint price = marketItems[itemId].price;
        uint tokenId = marketItems[itemId].tokenId;

        require(msg.value == price, "Please submit the asking price in order to complete purchase");
        
        marketItems[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        marketItems[itemId].owner = payable(msg.sender);
        marketItems[itemId].sold = true;
        _itemsSold++;

        payable(owner).transfer(listingPrice);
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint unsoldItemCount = _itemIds - _itemsSold;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        uint currentIndex = 0;
        for (uint i = 1; i <= _itemIds; ++i) {
            if (marketItems[i].owner == address(0) && !marketItems[i].sold) {
                items[currentIndex] = marketItems[i];
                ++currentIndex;
            }
        }

        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds;
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 1; i <= totalItemCount; ++i) {
            if (marketItems[i].owner == msg.sender) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint i = 1; i <= totalItemCount; ++i) {
            if (marketItems[i].owner == msg.sender) {
                items[currentIndex] = marketItems[i];
                ++currentIndex;
            }
        }

        return items;
    }

    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds;
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 1; i <= totalItemCount; ++i) {
            if (marketItems[i].seller == msg.sender) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint i = 0; i < totalItemCount; ++i) {
            if (marketItems[i].seller == msg.sender) {
                items[currentIndex] = marketItems[i];
                ++currentIndex;
            }
        }

        return items;
    }
}
