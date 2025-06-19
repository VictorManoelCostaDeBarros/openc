import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
  
describe("NFTCollection", function () {
  async function deployFixture() {
    const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
    const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");

    const nftMarket = await NFTMarket.deploy();
    const nftCollection = await NFTCollection.deploy(await nftMarket.getAddress());

    const [owner, otherAccount] = await hre.ethers.getSigners();

    return {  nftCollection, owner, otherAccount, marketAddress: await nftMarket.getAddress() };
  }

    it("Should mint a token", async function () {
      const { nftCollection, owner, otherAccount, marketAddress } = await loadFixture(deployFixture);

      await nftCollection.mint("https://opc.com/1");

      expect(await nftCollection.ownerOf(1)).to.equal(owner.address);
      expect(await nftCollection.tokenURI(1)).to.equal("https://opc.com/1");
    });

    it("Can change approval", async function () {
      const { nftCollection, owner, otherAccount, marketAddress } = await loadFixture(deployFixture);

      const instance = await nftCollection.connect(otherAccount);

      await instance.mint("https://opc.com/1");

      await instance.setApprovalForAll(owner.address, false);

      expect(await nftCollection.isApprovedForAll(otherAccount.address, owner.address)).to.equal(false);
    });

    it("Can not change approval", async function () {
      const { nftCollection, owner, otherAccount, marketAddress } = await loadFixture(deployFixture);

      const instance = await nftCollection.connect(otherAccount);

      await instance.mint("https://opc.com/1");

      await expect(instance.setApprovalForAll(marketAddress, false)).to.be.revertedWith("Cannot remove marketplace approval");
    });
});
