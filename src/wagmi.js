import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia, hardhat } from "wagmi/chains";

// WalletConnect project ID from environment variable
const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "touchgrass-admin-dev";

// Warn in production if using placeholder
if (import.meta.env.PROD && projectId === "touchgrass-admin-dev") {
  console.warn(
    "⚠️ Using placeholder WalletConnect ID! Get one from https://cloud.walletconnect.com/"
  );
}

// Get chains based on environment
const isDev = import.meta.env.DEV;
const chains = isDev ? [base, baseSepolia, hardhat] : [baseSepolia, base];

export const config = getDefaultConfig({
  appName: "TouchGrass Admin",
  projectId,
  chains,
  ssr: false,
});
