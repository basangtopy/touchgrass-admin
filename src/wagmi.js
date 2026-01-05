import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  baseAccount,
  walletConnectWallet,
  rainbowWallet,
  trustWallet,
  rabbyWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
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

// Configure wallet connectors with injectedWallet first for in-app browser detection
// injectedWallet catches ANY wallet's dApp browser (Trust, SafePal, Zerion, etc.)
const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        injectedWallet, // Catches any in-app browser wallet
        metaMaskWallet,
        baseAccount,
        walletConnectWallet,
        rainbowWallet,
        trustWallet,
        rabbyWallet,
      ],
    },
  ],
  {
    appName: "TouchGrass Admin",
    projectId,
  }
);

export const config = createConfig({
  connectors,
  chains,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    ...(isDev && { [hardhat.id]: http() }),
  },
  ssr: false,
});
