/**
 * Admin wallet addresses authorized to access this dashboard.
 * Note: The smart contract's onlyOwner modifier is the actual security layer.
 * This list is purely for UX - to hide the dashboard from non-admins.
 */

// Parse admin wallets from environment variable (comma-separated)
const envWallets = import.meta.env.VITE_ADMIN_WALLETS;
const defaultWallets = ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"]; // Hardhat #0

export const ADMIN_WALLETS = (
  envWallets ? envWallets.split(",").map((addr) => addr.trim()) : defaultWallets
).map((addr) => addr.toLowerCase());

// Warn in production if using default wallets
if (import.meta.env.PROD && !envWallets) {
  console.warn("⚠️ Using default admin wallet! Set VITE_ADMIN_WALLETS in .env");
}

/**
 * Check if a wallet address is an authorized admin.
 * @param {string} address - Wallet address to check
 * @returns {boolean} - True if admin
 */
export function isAdmin(address) {
  if (!address) return false;
  return ADMIN_WALLETS.includes(address.toLowerCase());
}
