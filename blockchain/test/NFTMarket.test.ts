import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
  
describe("NFTMarket", function () {
  async function deployFixture() {
    const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
    const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");

    const nftMarket = await NFTMarket.deploy();
    const nftCollection = await NFTCollection.deploy(await nftMarket.getAddress());

    const [owner, otherAccount] = await hre.ethers.getSigners();

    return {  nftCollection, owner, otherAccount, nftMarket };
  }

    it("Should fetch market items", async function () {
      const { nftCollection, owner, otherAccount, nftMarket } = await loadFixture(deployFixture);

      const listingPrice = (await nftMarket.listingPrice()).toString();
      const auctionPrice = ethers.parseUnits("1", "ether");

      await nftCollection.mint("https://opc.com/1");

      await nftMarket.createMarketItem(nftCollection.target, 1, auctionPrice, { value: listingPrice });

      const marketItems = await nftMarket.fetchMarketItems();

      expect(marketItems.length).to.equal(1);
    });

    it("Should fetch my market items", async function () {
      const { nftCollection, owner, otherAccount, nftMarket } = await loadFixture(deployFixture);

      const listingPrice = (await nftMarket.listingPrice()).toString();
      const auctionPrice = ethers.parseUnits("1", "ether");

      await nftCollection.mint("https://opc.com/1");
      await nftCollection.mint("https://opc.com/2");

      await nftMarket.createMarketItem(nftCollection.target, 1, auctionPrice, { value: listingPrice });
      await nftMarket.createMarketItem(nftCollection.target, 2, auctionPrice, { value: listingPrice });

      const instance = await nftMarket.connect(otherAccount);

      await instance.createMarketSale(nftCollection.target, 2, { value: auctionPrice });

      const myNft = await instance.fetchMyNFTs();

      expect(myNft.length).to.equal(1);
      expect(myNft[0].itemId).to.equal(2);
    });

    it("Should fetch my created items", async function () {
      const { nftCollection, owner, otherAccount, nftMarket } = await loadFixture(deployFixture);

      const listingPrice = (await nftMarket.listingPrice()).toString();
      const auctionPrice = ethers.parseUnits("1", "ether");

      await nftCollection.mint("https://opc.com/1");
      await nftCollection.mint("https://opc.com/2");

      await nftMarket.createMarketItem(nftCollection.target, 1, auctionPrice, { value: listingPrice });
      await nftMarket.createMarketItem(nftCollection.target, 2, auctionPrice, { value: listingPrice });

      const myNft = await nftMarket.fetchItemsCreated();

      expect(myNft.length).to.equal(2);
    });

    it("Should create and execute market sale", async function () {
      const { nftCollection, owner, otherAccount, nftMarket } = await loadFixture(deployFixture);

      const listingPrice = (await nftMarket.listingPrice()).toString();
      const auctionPrice = ethers.parseUnits("1", "ether");

      await nftCollection.mint("https://opc.com/1");

      await nftMarket.createMarketItem(nftCollection.target, 1, auctionPrice, { value: listingPrice });

      const instance = await nftMarket.connect(otherAccount);

      await instance.createMarketSale(nftCollection.target, 1, { value: auctionPrice });

      const nftOwner = await nftCollection.ownerOf(1);
      const marketItem = await nftMarket.fetchMarketItems();

      expect(nftOwner).to.equal(otherAccount.address);
      expect(marketItem.length).to.equal(0);
    });
});
