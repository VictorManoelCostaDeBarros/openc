import { ethers } from "ethers";
import axios from "axios";

import NFTMarketAbi from "./NFTMarket.abi.json";
import MFTCollectionAbi from "./MFTCollection.abi.json";
import { EventLog } from "ethers";

const marketplaceAddress = `${process.env.MARKETPLACE_ADDRESS}`;
const collectionAddress = `${process.env.COLLECTION_ADDRESS}`;
const chainId = `${process.env.CHAIN_ID}`;

export type NewNFT = {
  name?: string;
  description?: string;
  price?: string;
  image?: File;
}

type Metadata = {
  name: string;
  description: string;
  image: string;
}

export type NFT = {
  itemId: number;
  tokenId: number;
  price: bigint | string;
  seller: string;
  owner: string;
  image: string;
  name: string;
  description: string;
}

async function uploadFile(image: File): Promise<string> {
  const formData = new FormData();
    formData.append("file", image);

    const response = await axios({
        method: "POST",
        url: "/pinata/file",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" }
    })

    return `${response.data.uri}`;
}

async function uploadMetadata(metadata: Metadata): Promise<string> {
  const response = await axios({
    method: "POST",
    url: "/pinata/metadata",
    data: metadata,
    headers: { "Content-Type": "application/json" }
  })

  return `${response.data.uri}`;
}

async function getProvider(): Promise<ethers.BrowserProvider> {
  if (!window.ethereum) {
    throw new Error("No wallet found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

  if (!accounts || !accounts.length) {
    throw new Error("Wallet not permitted!");
  }

  await provider.send("wallet_switchEthereumChain", [{ chainId: chainId }]);

  return provider;
}

export async function loadDetails(itemId: number): Promise<NFT> {
  const provider = await getProvider();

  const marketContract = new ethers.Contract(marketplaceAddress, NFTMarketAbi, provider);
  const collectionContract = new ethers.Contract(collectionAddress, MFTCollectionAbi, provider);

  const item = await marketContract.marketItems(itemId);

  if (!item) {
    return {} as NFT;
  }

  const tokenUri = await collectionContract.tokenURI(item.tokenId);
  const metadata = await axios.get(tokenUri.replace("ipfs://", "https://jade-eldest-newt-886.mypinata.cloud/ipfs/"));
  const price = ethers.formatUnits(item.price.toString(), "ether");

  return {
    itemId: itemId,
    tokenId: item.tokenId,
    price: price,
    seller: item.seller,
    owner: item.owner,
    image: metadata.data.image.replace("ipfs://", "https://jade-eldest-newt-886.mypinata.cloud/ipfs/"),
    name: metadata.data.name,
    description: metadata.data.description,
  }
}

export async function buyNFT(nft: NFT): Promise<void> {
  const provider = await getProvider();

  const signer = await provider.getSigner();

  const marketContract = new ethers.Contract(marketplaceAddress, NFTMarketAbi, signer);

  const price = ethers.parseUnits(nft.price.toString(), "ether");

  const tx = await marketContract.createMarketSale(collectionAddress, nft.itemId, { value: price });
  await tx.wait();
}

async function createItem(url: string, price: string): Promise<number> {
  const provider = await getProvider();

  const signer = await provider.getSigner();

  const collectionContract = new ethers.Contract(collectionAddress, MFTCollectionAbi, signer);

  const mintTx = await collectionContract.mint(url);
  const mintTxReceipt: ethers.ContractTransactionReceipt = await mintTx.wait();
  let eventLog = mintTxReceipt.logs[0] as EventLog
  const tokenId = Number(eventLog.args[2])

  const weiPrice = ethers.parseUnits(price, "ether");
  const marketContract = new ethers.Contract(marketplaceAddress, NFTMarketAbi, signer);
  const listingPrice = (await marketContract.listingPrice()).toString();
  const createTx = await marketContract.createMarketItem(collectionAddress, tokenId, weiPrice, { value: listingPrice });

  const createTxReceipt: ethers.ContractTransactionReceipt = await createTx.wait();
  eventLog = createTxReceipt.logs.find(l => (l as EventLog).eventName === "MarketItemCreated") as EventLog;
  const itemId = Number(eventLog.args[0]);

  return itemId;
}

export async function uploadAndCreate(nft: NewNFT): Promise<number> {
  const { name, description, price, image } = nft;

  if (!name || !description || !price || !image) {
    throw new Error("Missing required fields");
  }

  const uri = await uploadFile(image);

  const metadataUri = await uploadMetadata({
    name,
    description,
    image: uri
  });

  const itemId = await createItem(metadataUri, price);
  
  return itemId;
}

export async function loadMyNFTs(): Promise<NFT[]> {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const marketContract = new ethers.Contract(marketplaceAddress, NFTMarketAbi, provider);
  const collectionContract = new ethers.Contract(collectionAddress, MFTCollectionAbi, provider);

  const data = await marketContract.fetchMyNFTs({ from: signer.address });

  if (!data) {
    return [];
  }

  const nfts = await Promise.all(data.map(async (item: NFT) => {
    const tokenUri = await collectionContract.tokenURI(item.tokenId);
    const metadata = await axios.get(tokenUri.replace("ipfs://", "https://jade-eldest-newt-886.mypinata.cloud/ipfs/"));
    const price = ethers.formatUnits(item.price.toString(), "ether");

    return {
      itemId: item.itemId,
      tokenId: item.tokenId,
      price: price,
      seller: item.seller,
      owner: item.owner,
      image: metadata.data.image.replace("ipfs://", "https://jade-eldest-newt-886.mypinata.cloud/ipfs/"),
      name: metadata.data.name,
      description: metadata.data.description,
    }
  }));

  return nfts;
}

export async function loadNFTs(): Promise<NFT[]> {
  const provider = await getProvider();

  const marketContract = new ethers.Contract(marketplaceAddress, NFTMarketAbi, provider);
  const collectionContract = new ethers.Contract(collectionAddress, MFTCollectionAbi, provider);

  const data = await marketContract.fetchMarketItems();

  if (!data) {
    return [];
  }

  const nfts = await Promise.all(data.map(async (item: NFT) => {
    const tokenUri = await collectionContract.tokenURI(item.tokenId);
    const metadata = await axios.get(tokenUri.replace("ipfs://", "https://jade-eldest-newt-886.mypinata.cloud/ipfs/"));
    const price = ethers.formatUnits(item.price.toString(), "ether");

    return {
      itemId: item.itemId,
      tokenId: item.tokenId,
      price: price,
      seller: item.seller,
      owner: item.owner,
      image: metadata.data.image.replace("ipfs://", "https://jade-eldest-newt-886.mypinata.cloud/ipfs/"),
      name: metadata.data.name,
      description: metadata.data.description,
    }
  }));

  return nfts;
}