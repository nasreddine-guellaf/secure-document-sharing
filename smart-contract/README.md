# DocumentRegistry Hardhat Project

This project contains the `DocumentRegistry` smart contract and a local deploy script.

## What's included?

The project uses Hardhat 3, TypeScript config support, and the official Hardhat ethers plugin for deployment scripts.

## Deploy locally

Start the Hardhat local node in one terminal:

```bash
npx hardhat node
```

Then deploy `DocumentRegistry` in another terminal:

```bash
npx hardhat run .\scripts\deploy.js --network localhost
```
