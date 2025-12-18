import { http } from "wagmi";
import { base, baseSepolia, hardhat } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// WalletConnect project ID from environment variable
const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "touchgrass-admin-dev";

// Warn in production if using placeholder
if (import.meta.env.PROD && projectId === "touchgrass-admin-dev") {
  console.warn(
    "⚠️ Using placeholder WalletConnect ID! Get one from https://cloud.walletconnect.com/"
  );
}

export const config = getDefaultConfig({
  appName: "TouchGrass Admin",
  projectId,
  chains: [base, baseSepolia, hardhat],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
