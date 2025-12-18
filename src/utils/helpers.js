/**
 * Format a number as USD currency
 * @param {string|number} value - The value to format
 * @param {object} options - Formatting options
 */
export function formatUSD(value, options = {}) {
  const { compact = false, decimals = 2 } = options;
  const num = parseFloat(value) || 0;

  if (compact) {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  }

  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format an Ethereum address for display
 * @param {string} address - Full address
 * @param {number} chars - Characters to show on each side
 */
export function formatAddress(address, chars = 4) {
  if (!address) return "—";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format seconds into human-readable duration
 * @param {number} seconds - Duration in seconds
 */
export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  return `${(seconds / 86400).toFixed(1)}d`;
}

/**
 * Format a timestamp as relative time
 * @param {number} timestamp - Unix timestamp in milliseconds
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);

  if (absDiff < 60000) return "just now";
  if (absDiff < 3600000)
    return `${Math.floor(absDiff / 60000)}m ${diff > 0 ? "left" : "ago"}`;
  if (absDiff < 86400000)
    return `${Math.floor(absDiff / 3600000)}h ${diff > 0 ? "left" : "ago"}`;
  return `${Math.floor(absDiff / 86400000)}d ${diff > 0 ? "left" : "ago"}`;
}

/**
 * Format a token amount with proper decimals
 * @param {string|bigint} amount - Amount in base units
 * @param {number} decimals - Token decimals
 * @param {number} displayDecimals - Decimals to display
 */
export function formatTokenAmount(amount, decimals = 18, displayDecimals = 6) {
  const value = parseFloat(amount) / Math.pow(10, decimals);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

/**
 * Parse a token amount to base units
 * @param {string|number} amount - Human-readable amount
 * @param {number} decimals - Token decimals
 */
export function parseTokenAmount(amount, decimals = 18) {
  const value = parseFloat(amount) || 0;
  return BigInt(Math.floor(value * Math.pow(10, decimals)));
}

/**
 * Validate an Ethereum address
 * @param {string} address - Address to validate
 */
export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get block explorer URL for the current chain
 * @param {number} chainId - Chain ID
 */
export function getExplorerUrl(chainId) {
  const explorers = {
    1: "https://etherscan.io",
    8453: "https://basescan.org",
    84532: "https://sepolia.basescan.org",
    31337: null, // Local
  };
  return explorers[chainId] || null;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to wait
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate a string in the middle
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 */
export function truncateMiddle(str, maxLength = 20) {
  if (!str || str.length <= maxLength) return str;
  const half = Math.floor((maxLength - 3) / 2);
  return `${str.slice(0, half)}...${str.slice(-half)}`;
}
