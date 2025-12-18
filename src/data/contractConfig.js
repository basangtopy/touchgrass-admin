import abi from "./TouchGrassABI.json";

// Contract address from environment variable (fallback to localhost for dev)
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const CONTRACT_ABI = abi.abi;

// Warn in production if using default address
if (
  import.meta.env.PROD &&
  CONTRACT_ADDRESS === "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
) {
  console.warn(
    "⚠️ Using default localhost contract address in production! Set VITE_CONTRACT_ADDRESS in .env"
  );
}
