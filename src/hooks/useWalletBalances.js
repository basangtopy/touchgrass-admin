import { useState, useEffect, useCallback } from "react";
import { Contract, formatUnits } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../data/contractConfig";

// Standard ERC-20 ABI for balanceOf
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// Known token decimals fallback
const KNOWN_DECIMALS = {
  ETH: 18,
  WETH: 18,
  USDC: 6,
  USDT: 6,
  DAI: 18,
};

/**
 * Hook to fetch all token balances for a wallet address
 * @param {string} walletAddress - The wallet address to fetch balances for
 * @returns {{ balances: Array, loading: boolean, error: string, refetch: Function }}
 */
export function useWalletBalances(walletAddress) {
  const signer = useEthersSigner();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBalances = useCallback(async () => {
    if (!signer || !walletAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const provider = signer.provider;
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Fetch ETH balance
      const ethBalance = await provider.getBalance(walletAddress);
      const balanceList = [
        {
          symbol: "ETH",
          balance: formatUnits(ethBalance, 18),
          decimals: 18,
          isNative: true,
        },
      ];

      // Get supported tokens from contract
      try {
        const supportedTokens = await contract.getAllSupportedTokens();

        for (let i = 0; i < supportedTokens.length; i++) {
          const symbol = supportedTokens[i];
          if (symbol === "ETH") continue; // Skip native ETH, already added

          try {
            // Get the bytes32 tokenId from the supportedTokenIds array
            const tokenId = await contract.supportedTokenIds(i);
            const config = await contract.tokenConfigs(tokenId);
            const tokenAddress = config.tokenAddress;

            // Skip if no token address (native token) or zero address
            if (
              !tokenAddress ||
              tokenAddress === "0x0000000000000000000000000000000000000000"
            ) {
              continue;
            }

            const decimals =
              Number(config.decimals) || KNOWN_DECIMALS[symbol] || 18;

            // Fetch token balance
            const tokenContract = new Contract(
              tokenAddress,
              ERC20_ABI,
              provider
            );
            const tokenBalance = await tokenContract.balanceOf(walletAddress);

            balanceList.push({
              symbol,
              balance: formatUnits(tokenBalance, decimals),
              decimals,
              isNative: false,
              tokenAddress,
            });
          } catch (e) {
            console.warn(`Could not fetch balance for ${symbol}:`, e.message);
          }
        }
      } catch (e) {
        console.warn("Could not fetch supported tokens:", e.message);
      }

      setBalances(balanceList);
    } catch (err) {
      console.error("Error fetching balances:", err);
      setError("Failed to fetch balances");
    } finally {
      setLoading(false);
    }
  }, [signer, walletAddress]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { balances, loading, error, refetch: fetchBalances };
}

/**
 * Fetch balances for multiple wallets at once
 * @param {Array<{name: string, address: string}>} wallets - Array of wallet objects
 * @returns {{ walletBalances: Object, loading: boolean, error: string }}
 */
export function useMultiWalletBalances(wallets) {
  const signer = useEthersSigner();
  const [walletBalances, setWalletBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Serialize wallet addresses for stable dependency comparison
  const walletAddresses = wallets
    ?.map((w) => w.address || "")
    .filter(Boolean)
    .join(",");

  const fetchAllBalances = useCallback(async () => {
    if (!signer || !wallets || wallets.length === 0 || !walletAddresses) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const provider = signer.provider;
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Get supported tokens once
      let supportedTokens = [];
      let tokenConfigs = {};

      try {
        supportedTokens = await contract.getAllSupportedTokens();

        // Get the actual bytes32 token IDs from the contract
        // The contract stores them in supportedTokenIds array
        for (let i = 0; i < supportedTokens.length; i++) {
          const symbol = supportedTokens[i];
          if (symbol === "ETH") continue;

          try {
            // Get the bytes32 tokenId from the array at index i
            const tokenId = await contract.supportedTokenIds(i);
            const config = await contract.tokenConfigs(tokenId);
            tokenConfigs[symbol] = {
              address: config.tokenAddress,
              decimals: Number(config.decimals) || KNOWN_DECIMALS[symbol] || 18,
            };
          } catch {
            // Skip
          }
        }
      } catch {
        // Skip on error
      }

      const results = {};

      for (const wallet of wallets) {
        if (!wallet.address) continue;

        const balanceList = [];

        // ETH balance
        try {
          const ethBalance = await provider.getBalance(wallet.address);
          balanceList.push({
            symbol: "ETH",
            balance: formatUnits(ethBalance, 18),
            decimals: 18,
            isNative: true,
          });
        } catch (e) {
          console.warn(
            `Could not fetch ETH balance for ${wallet.name}:`,
            e.message
          );
        }

        // Token balances
        for (const [symbol, config] of Object.entries(tokenConfigs)) {
          if (
            !config.address ||
            config.address === "0x0000000000000000000000000000000000000000"
          ) {
            continue;
          }

          try {
            const tokenContract = new Contract(
              config.address,
              ERC20_ABI,
              provider
            );
            const tokenBalance = await tokenContract.balanceOf(wallet.address);
            balanceList.push({
              symbol,
              balance: formatUnits(tokenBalance, config.decimals),
              decimals: config.decimals,
              isNative: false,
            });
          } catch {
            // Skip
          }
        }

        results[wallet.name] = balanceList;
      }

      setWalletBalances(results);
    } catch (err) {
      console.error("Error fetching balances:", err);
      setError("Failed to fetch balances");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer, walletAddresses]);

  useEffect(() => {
    fetchAllBalances();
  }, [fetchAllBalances]);

  return { walletBalances, loading, error, refetch: fetchAllBalances };
}
