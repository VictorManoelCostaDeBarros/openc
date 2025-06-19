import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    MARKETPLACE_ADDRESS: process.env.MARKETPLACE_ADDRESS,
    COLLECTION_ADDRESS: process.env.COLLECTION_ADDRESS,
    CHAIN_ID: process.env.CHAIN_ID,
    // API_KEY: process.env.API_KEY,
    // API_SECRET: process.env.API_SECRET,
  },
  images: {
    remotePatterns: [{
        protocol: "https",
        hostname: "jade-eldest-newt-886.mypinata.cloud"
    },{
        protocol: "https",
        hostname: "images.unsplash.com"
    }]
}
};

export default nextConfig;
