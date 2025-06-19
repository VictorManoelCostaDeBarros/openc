# OpenC - NFT Marketplace

OpenC is a decentralized NFT marketplace built on the Ethereum blockchain. This project allows users to create, buy, sell, and trade NFTs in a secure and decentralized manner.

## Project Structure

The project is divided into two main parts:

```
├── blockchain/         # Smart contract development
│   ├── contracts/     # Solidity smart contracts
│   ├── test/         # Contract test files
│   └── ignition/     # Deployment configuration
└── dapp/             # Frontend application
    ├── public/       # Static assets
    └── src/         # React components and pages
```

## Technologies Used

### Blockchain (Smart Contracts)
- Solidity - Smart contract development
- Hardhat - Development environment and testing
- OpenZeppelin - Smart contract security standards
- TypeScript - Development language
- Ignition - Deployment framework

### Frontend (DApp)
- Next.js 15.3 - React framework
- React 19 - UI library
- ethers.js - Ethereum interaction
- TailwindCSS - Styling
- TypeScript - Development language

## Smart Contracts

The project includes two main smart contracts:

1. `NFTCollection.sol` - ERC721 token implementation for NFT creation
2. `NFTMarket.sol` - Marketplace functionality for buying and selling NFTs

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet

### Installation

1. Clone the repository
```bash
git clone https://github.com/VictorManoelCostaDeBarros/openc.git
cd openc
```

2. Install Blockchain Dependencies
```bash
cd blockchain
npm install
```

3. Install Frontend Dependencies
```bash
cd ../dapp
npm install
```

### Running the Project

1. Start the Blockchain Development Environment
```bash
cd blockchain
npx hardhat node
```

2. Deploy Smart Contracts (in a new terminal)
```bash
cd blockchain
npm run deploy
```

3. Start the Frontend Development Server
```bash
cd dapp
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing

To run smart contract tests:
```bash
cd blockchain
npm test
```

## Deployment

### Smart Contracts
Deploy to Sepolia testnet:
```bash
cd blockchain
npm run deploy
```

### Frontend
Build and deploy the frontend:
```bash
cd dapp
npm run build
npm run start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 