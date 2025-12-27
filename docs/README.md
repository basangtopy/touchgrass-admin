# TouchGrass Admin Dashboard

> Administrative interface for managing the TouchGrass smart contract.

## Overview

The Admin Dashboard provides a web interface for:

- Monitoring contract status and statistics
- Managing supported tokens
- Configuring fees and parameters
- Recovering excess funds
- Viewing verifier health status

## Quick Start

### Prerequisites

- Node.js 18+
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- Admin wallet connected to the same network as the contract

### Installation

```bash
cd "TouchGrass Admin"
npm install
```

### Configuration

Create a `.env` file:

```env
# Required
VITE_CONTRACT_ADDRESS=0x...          # TouchGrass main contract
VITE_VIEWS_CONTRACT_ADDRESS=0x...    # TouchGrassViews contract
VITE_WALLETCONNECT_PROJECT_ID=...    # WalletConnect Project ID

# Optional
VITE_ADMIN_WALLETS=0x...,0x...       # Comma-separated admin wallets
VITE_VERIFIER_URL=http://localhost:3001  # Verifier server URL
VITE_NETWORK_MODE=local              # local, testnet, or mainnet
```

### Run the Dashboard

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

## Documentation

| Document                                              | Description                    |
| ----------------------------------------------------- | ------------------------------ |
| [Dashboard Guide](./dashboard-guide.md)               | How to use each feature        |
| [Contract Configuration](./contract-configuration.md) | Smart contract admin functions |

## Features

| Page                 | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| **Overview**         | Contract stats, wallet balances, system status |
| **Token Management** | Add/remove supported tokens                    |
| **Fee Management**   | Update fees and minimum stake                  |
| **Fund Recovery**    | Recover excess ETH/ERC20 tokens                |
| **Settings**         | Update addresses, parameters                   |

## Architecture

```
src/
├── pages/           # Route components
│   ├── Overview.jsx
│   ├── FundRecovery.jsx
│   ├── TokenManagement.jsx
│   └── Settings.jsx
├── components/      # Reusable UI components
├── data/            # Contract configs and ABIs
├── hooks/           # Custom React hooks
└── utils/           # Helper functions
```

## Contract Interaction

The dashboard interacts with two contracts:

| Contract            | Purpose                             |
| ------------------- | ----------------------------------- |
| **TouchGrass**      | Main contract - all admin functions |
| **TouchGrassViews** | Read-only views for dashboard data  |

Functions requiring owner permissions will only work when connected with the owner wallet.
