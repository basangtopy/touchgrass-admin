# Dashboard Guide

> Complete guide to using the TouchGrass Admin Dashboard.

---

## Connecting Your Wallet

1. Click **"Connect Wallet"** in the top-right
2. Select your wallet provider (MetaMask, WalletConnect, etc.)
3. Approve the connection
4. Ensure you're on the correct network (Base Sepolia, etc.)

**Admin Access:** Only the contract owner wallet can perform admin actions. Other wallets can view data but not make changes.

---

## Overview Page

The main dashboard showing system health and statistics.

### Stats Cards

| Stat                 | Description                           |
| -------------------- | ------------------------------------- |
| **Total Challenges** | All-time challenges created           |
| **Protected Value**  | USD value locked in active challenges |
| **Current Fee**      | Fee per challenge (in USDC)           |
| **Min Stake**        | Minimum required stake (in USDC)      |

### Wallet Balances

Shows current balances of:

- **Charity Wallet** - Receives charity penalties
- **Treasury Wallet** - Receives fees and dev penalties

### Contract Status

| Field            | Description                 |
| ---------------- | --------------------------- |
| Status           | Active or Paused            |
| Owner            | Contract owner address      |
| Verifier         | Authorized verifier address |
| Charity/Treasury | Wallet addresses            |

### Verifier Health

Shows the status of the verifier server:

- ✅ **Online** - Server responding
- ❌ **Offline** - Server unreachable

---

## Token Management

Manage which tokens can be used for challenges.

### Supported Tokens Table

| Column     | Description                       |
| ---------- | --------------------------------- |
| Symbol     | Token ticker (ETH, USDC, etc.)    |
| Address    | Contract address (0x0 for ETH)    |
| Decimals   | Token decimal places              |
| Price Feed | Chainlink oracle address          |
| Fallback   | Whether fallback price is enabled |

### Adding a Token

1. Click **"Add Token"**
2. Fill in the form:
   - **Symbol** - Token ticker (e.g., "WETH")
   - **Token Address** - ERC20 contract address
   - **Price Feed** - Chainlink TOKEN/USD feed address
   - **Decimals** - Token decimals (e.g., 18)
   - **Staleness Tolerance** - Max age of price data in seconds
3. Click **"Add Token"**
4. Confirm the transaction

### Removing a Token

⚠️ **Only possible if:**

- No funds are locked in challenges for this token
- No pending withdrawals for this token

1. Click the **Remove** button on the token row
2. Confirm the transaction

### Updating Price Feed

1. Click **"Update"** on the token row
2. Enter the new Chainlink price feed address
3. Confirm the transaction

### Enabling Fallback Price

For testing or oracle failures:

1. Click **"Enable Fallback"**
2. Enter the fallback price (in USD, 18 decimals)
3. Confirm the transaction

---

## Fee Management

### Current Fee

The fee charged per challenge in USDC equivalent.

### Scheduling a Fee Update

Fee increases require a 24-hour delay:

1. Enter the **New Fee** (in USDC, e.g., "0.75")
2. Click **"Schedule Update"**
3. After 24 hours, click **"Execute Update"**

Fee decreases are immediate.

### Minimum Stake

The minimum stake value in USDC:

1. Enter the **New Min Stake**
2. Click **"Update"**
3. Confirm the transaction

---

## Fund Recovery

Recover excess funds that are above locked + pending amounts.

### Understanding Recoverable Funds

| Type                 | Description                                 |
| -------------------- | ------------------------------------------- |
| **Contract Balance** | Total tokens in contract                    |
| **Locked**           | Tied to active challenges                   |
| **Pending**          | Awaiting user withdrawal (failed transfers) |
| **Recoverable**      | Balance - Locked - Pending                  |

### Recovering Funds

1. Enter the **Recipient Address** (default: treasury)
2. Either:
   - Click **"Recover"** on a specific token
   - Click **"Recover All"** for batch recovery
3. Confirm the transaction

### Verify Accounting

Click the ✓ button on any token to verify fund accounting:

- **Balanced** - Contract balance matches expected
- **Excess** - Has recoverable funds
- **Deficit** - CRITICAL: Less than expected (should never happen)

---

## Settings

### Update Addresses

| Setting             | Description                     |
| ------------------- | ------------------------------- |
| **Verifier**        | Authorized verification address |
| **Charity Wallet**  | Receives charity donations      |
| **Treasury Wallet** | Receives fees and dev donations |

⚠️ **Constraints:**

- All addresses must be unique
- Verifier cannot be the owner
- No address can be 0x0

### Update Parameters

| Parameter           | Description                 | Limits           |
| ------------------- | --------------------------- | ---------------- |
| **Min Duration**    | Minimum challenge length    | 1 min - 365 days |
| **Max Duration**    | Maximum challenge length    | 1 day - 730 days |
| **Grace Period**    | Time before admin can sweep | Up to 30 days    |
| **Lock Multiplier** | Lock duration multiplier    | 3x - 15x         |
| **Min Penalty**     | Minimum penalty percentage  | 5% - 50%         |

### Emergency Controls

| Action      | Effect                       |
| ----------- | ---------------------------- |
| **Pause**   | Stops new challenge creation |
| **Unpause** | Resumes normal operation     |

Withdrawals continue to work even when paused.

---

## Common Tasks

### After Deployment

1. ✅ Connect owner wallet
2. ✅ Add ETH token with price feed
3. ✅ Add USDC/other tokens
4. ✅ Enable fallback prices (for testing)
5. ✅ Verify verifier health

### Regular Monitoring

- Check wallet balances weekly
- Review pending fee updates
- Monitor for recoverable funds
- Verify accounting periodically

### Troubleshooting

| Issue                | Solution                                      |
| -------------------- | --------------------------------------------- |
| "Unauthorized" error | Ensure you're connected with owner wallet     |
| Transaction fails    | Check gas, check network                      |
| Stale price data     | Update staleness tolerance or enable fallback |
| Can't remove token   | Check for locked/pending funds                |
