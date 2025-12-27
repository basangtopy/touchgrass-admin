import abi from "./TouchGrassABI.json";
import viewsAbi from "./TouchGrassViewsABI.json";

// Contract address from environment variable (fallback to localhost for dev)
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

// Views contract address (for extracted view functions)
export const VIEWS_CONTRACT_ADDRESS =
  import.meta.env.VITE_VIEWS_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000"; // Set after deployment

export const CONTRACT_ABI = abi.abi;
export const VIEWS_CONTRACT_ABI = viewsAbi.abi;

// Warn in production if using default addresses
if (
  import.meta.env.PROD &&
  CONTRACT_ADDRESS === "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
) {
  console.warn(
    "⚠️ Using default localhost contract address in production! Set VITE_CONTRACT_ADDRESS in .env"
  );
}

if (
  import.meta.env.PROD &&
  VIEWS_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
) {
  console.warn(
    "⚠️ Views contract address not set in production! Set VITE_VIEWS_CONTRACT_ADDRESS in .env"
  );
}
