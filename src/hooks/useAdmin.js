import { useCallback } from "react";
import { Contract } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../data/contractConfig";
import { useTransactionState } from "./useTransactionState";

/**
 * Hook providing all admin contract write functions
 */
export function useAdmin() {
  const signer = useEthersSigner();
  const txState = useTransactionState();

  const getContract = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected");
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, [signer]);

  const executeTransaction = useCallback(
    async (operation, successMessage) => {
      txState.setPending();
      try {
        const tx = await operation();
        txState.setConfirming(tx.hash);
        await tx.wait();
        txState.setSuccess(successMessage, tx.hash);
        return { success: true, tx };
      } catch (error) {
        txState.setError(error);
        return { success: false, error };
      }
    },
    [txState]
  );

  // ===== Token Management =====
  const addToken = useCallback(
    (symbol, address, priceFeed, decimals, staleness) =>
      executeTransaction(
        () =>
          getContract().addToken(
            symbol,
            address,
            priceFeed,
            decimals,
            staleness
          ),
        `Token ${symbol} added successfully`
      ),
    [getContract, executeTransaction]
  );

  const removeToken = useCallback(
    (symbol) =>
      executeTransaction(
        () => getContract().removeToken(symbol),
        `Token ${symbol} removed`
      ),
    [getContract, executeTransaction]
  );

  const updatePriceFeed = useCallback(
    (symbol, newPriceFeed) =>
      executeTransaction(
        () => getContract().updatePriceFeed(symbol, newPriceFeed),
        `Price feed updated for ${symbol}`
      ),
    [getContract, executeTransaction]
  );

  const enableFallbackPrice = useCallback(
    (symbol, fallbackPrice) =>
      executeTransaction(
        () => getContract().enableFallbackPrice(symbol, fallbackPrice),
        `Fallback price enabled for ${symbol}`
      ),
    [getContract, executeTransaction]
  );

  const disableFallbackPrice = useCallback(
    (symbol) =>
      executeTransaction(
        () => getContract().disableFallbackPrice(symbol),
        `Fallback price disabled for ${symbol}`
      ),
    [getContract, executeTransaction]
  );

  // ===== Fee Configuration =====
  const scheduleUSDCFeeUpdate = useCallback(
    (newFee) =>
      executeTransaction(
        () => getContract().scheduleUSDCFeeUpdate(newFee),
        "Fee update scheduled"
      ),
    [getContract, executeTransaction]
  );

  const cancelUSDCFeeUpdate = useCallback(
    () =>
      executeTransaction(
        () => getContract().cancelUSDCFeeUpdate(),
        "Fee update cancelled"
      ),
    [getContract, executeTransaction]
  );

  const executeUSDCFeeUpdate = useCallback(
    () =>
      executeTransaction(
        () => getContract().executeUSDCFeeUpdate(),
        "Fee update executed"
      ),
    [getContract, executeTransaction]
  );

  const setUSDCMinStake = useCallback(
    (newMinStake) =>
      executeTransaction(
        () => getContract().setUSDCMinStake(newMinStake),
        "Min stake updated"
      ),
    [getContract, executeTransaction]
  );

  const updateDurationBounds = useCallback(
    (minDuration, maxDuration) =>
      executeTransaction(
        () => getContract().updateDurationBounds(minDuration, maxDuration),
        "Duration bounds updated"
      ),
    [getContract, executeTransaction]
  );

  const setGracePeriod = useCallback(
    (days) =>
      executeTransaction(
        () => getContract().setGracePeriod(days),
        "Grace period updated"
      ),
    [getContract, executeTransaction]
  );

  const setLockMultiplier = useCallback(
    (multiplier) =>
      executeTransaction(
        () => getContract().setLockMultiplier(multiplier),
        "Lock multiplier updated"
      ),
    [getContract, executeTransaction]
  );

  const setMinPenaltyPercentage = useCallback(
    (percent) =>
      executeTransaction(
        () => getContract().setMinPenaltyPercentage(percent),
        "Min penalty percentage updated"
      ),
    [getContract, executeTransaction]
  );

  // ===== Fund Recovery =====
  const recoverETH = useCallback(
    (to) =>
      executeTransaction(() => getContract().recoverETH(to), "ETH recovered"),
    [getContract, executeTransaction]
  );

  const recoverERC20BySymbol = useCallback(
    (symbol, to) =>
      executeTransaction(
        () => getContract().recoverERC20BySymbol(symbol, to),
        `${symbol} recovered`
      ),
    [getContract, executeTransaction]
  );

  const recoverERC20ByAddress = useCallback(
    (tokenAddress, to) =>
      executeTransaction(
        () => getContract().recoverERC20ByAddress(tokenAddress, to),
        "Token recovered"
      ),
    [getContract, executeTransaction]
  );

  const batchRecoverTokens = useCallback(
    (symbols, to) =>
      executeTransaction(
        () => getContract().batchRecoverTokens(symbols, to),
        `Batch recovery complete`
      ),
    [getContract, executeTransaction]
  );

  // ===== Challenge Management =====
  const sweepPenalty = useCallback(
    (challengeId) =>
      executeTransaction(
        () => getContract().sweepPenalty(challengeId),
        "Penalty swept"
      ),
    [getContract, executeTransaction]
  );

  // ===== Wallet Settings =====
  const setVerifier = useCallback(
    (address) =>
      executeTransaction(
        () => getContract().setVerifier(address),
        "Verifier updated"
      ),
    [getContract, executeTransaction]
  );

  const setCharityWallet = useCallback(
    (address) =>
      executeTransaction(
        () => getContract().setCharityWallet(address),
        "Charity wallet updated"
      ),
    [getContract, executeTransaction]
  );

  const setTreasuryWallet = useCallback(
    (address) =>
      executeTransaction(
        () => getContract().setTreasuryWallet(address),
        "Treasury wallet updated"
      ),
    [getContract, executeTransaction]
  );

  const whitelistMultiSig = useCallback(
    (address) =>
      executeTransaction(
        () => getContract().whitelistMultiSig(address),
        "Multi-sig whitelisted"
      ),
    [getContract, executeTransaction]
  );

  const removeMultiSig = useCallback(
    (address) =>
      executeTransaction(
        () => getContract().removeMultiSig(address),
        "Multi-sig removed"
      ),
    [getContract, executeTransaction]
  );

  const addTrustedRecipient = useCallback(
    (address) =>
      executeTransaction(
        () => getContract().addTrustedRecipient(address),
        "Trusted recipient added"
      ),
    [getContract, executeTransaction]
  );

  const removeTrustedRecipient = useCallback(
    (address) =>
      executeTransaction(
        () => getContract().removeTrustedRecipient(address),
        "Trusted recipient removed"
      ),
    [getContract, executeTransaction]
  );

  // ===== Ownership =====
  const pause = useCallback(
    () => executeTransaction(() => getContract().pause(), "Contract paused"),
    [getContract, executeTransaction]
  );

  const unpause = useCallback(
    () =>
      executeTransaction(() => getContract().unpause(), "Contract unpaused"),
    [getContract, executeTransaction]
  );

  const transferOwnership = useCallback(
    (newOwner) =>
      executeTransaction(
        () => getContract().transferOwnership(newOwner),
        "Ownership transfer initiated"
      ),
    [getContract, executeTransaction]
  );

  const acceptOwnership = useCallback(
    () =>
      executeTransaction(
        () => getContract().acceptOwnership(),
        "Ownership accepted"
      ),
    [getContract, executeTransaction]
  );

  const cancelOwnershipTransfer = useCallback(
    () =>
      executeTransaction(
        () => getContract().cancelOwnershipTransfer(),
        "Ownership transfer cancelled"
      ),
    [getContract, executeTransaction]
  );

  const scheduleOwnershipRenunciation = useCallback(
    () =>
      executeTransaction(
        () => getContract().scheduleOwnershipRenunciation(),
        "Renunciation scheduled"
      ),
    [getContract, executeTransaction]
  );

  const executeOwnershipRenunciation = useCallback(
    () =>
      executeTransaction(
        () => getContract().executeOwnershipRenunciation(),
        "Ownership renounced"
      ),
    [getContract, executeTransaction]
  );

  const cancelOwnershipRenunciation = useCallback(
    () =>
      executeTransaction(
        () => getContract().cancelOwnershipRenunciation(),
        "Renunciation cancelled"
      ),
    [getContract, executeTransaction]
  );

  return {
    // Transaction state
    txState,

    // Token Management
    addToken,
    removeToken,
    updatePriceFeed,
    enableFallbackPrice,
    disableFallbackPrice,

    // Fee Configuration
    scheduleUSDCFeeUpdate,
    cancelUSDCFeeUpdate,
    executeUSDCFeeUpdate,
    setUSDCMinStake,
    updateDurationBounds,
    setGracePeriod,
    setLockMultiplier,
    setMinPenaltyPercentage,

    // Fund Recovery
    recoverETH,
    recoverERC20BySymbol,
    recoverERC20ByAddress,
    batchRecoverTokens,

    // Challenge Management
    sweepPenalty,

    // Wallet Settings
    setVerifier,
    setCharityWallet,
    setTreasuryWallet,
    whitelistMultiSig,
    removeMultiSig,
    addTrustedRecipient,
    removeTrustedRecipient,

    // Ownership
    pause,
    unpause,
    transferOwnership,
    acceptOwnership,
    cancelOwnershipTransfer,
    scheduleOwnershipRenunciation,
    executeOwnershipRenunciation,
    cancelOwnershipRenunciation,
  };
}
