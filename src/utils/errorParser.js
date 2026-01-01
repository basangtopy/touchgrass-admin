/**
 * Comprehensive error parser for TouchGrass smart contract errors
 * Maps technical errors to user-friendly messages
 */

// Contract custom errors with user-friendly messages
const CONTRACT_ERRORS = {
  // Ownership & Security Errors
  TransferToZeroAddress: {
    title: "Invalid Transfer",
    message: "Cannot transfer ownership to the zero address.",
  },
  TransferToCurrentOwner: {
    title: "Invalid Transfer",
    message: "Cannot transfer ownership to the current owner.",
  },
  TransferToContract: {
    title: "Invalid Transfer",
    message:
      "Cannot transfer ownership to a contract address. Use a multi-sig wallet or whitelist the address first.",
  },
  TransferDelayNotMet: {
    title: "Delay Required",
    message:
      "The 48-hour transfer delay has not been met. Please wait for the delay period to complete.",
  },
  NoTransferPending: {
    title: "No Pending Transfer",
    message: "There is no ownership transfer currently pending.",
  },
  OnlyPendingOwner: {
    title: "Access Denied",
    message: "Only the pending owner can accept the ownership transfer.",
  },
  OwnershipRenunciationNotInitiated: {
    title: "Not Initiated",
    message: "Ownership renunciation has not been scheduled yet.",
  },
  RenunciationDelayNotMet: {
    title: "Delay Required",
    message:
      "The 7-day renunciation delay has not been met. Please wait for the delay period to complete.",
  },
  OwnershipRenunciationInProgress: {
    title: "Renunciation Pending",
    message:
      "Ownership renunciation is already in progress. Cancel it first to transfer ownership.",
  },

  // Access Control Errors
  Unauthorized: {
    title: "Access Denied",
    message: "You don't have permission to perform this action.",
  },
  VerifierCannotBeOwner: {
    title: "Invalid Configuration",
    message: "The verifier address cannot be the same as the owner address.",
  },
  OwnableUnauthorizedAccount: {
    title: "Access Denied",
    message: "Only the contract owner can perform this action.",
  },

  // Address & Config Errors
  InvalidAddress: {
    title: "Invalid Address",
    message: "The provided address is invalid. Please check the format.",
  },
  DuplicateAddresses: {
    title: "Duplicate Addresses",
    message:
      "All addresses must be unique. Verifier, charity, and treasury cannot share addresses.",
  },

  // Token Errors
  TokenNotSupported: {
    title: "Token Not Supported",
    message: "This token is not currently supported by the contract.",
  },
  TokenAlreadySupported: {
    title: "Token Exists",
    message: "This token has already been added to the contract.",
  },
  TokenNotFound: {
    title: "Token Not Found",
    message: "The specified token could not be found.",
  },
  InvalidTokenConfig: {
    title: "Invalid Configuration",
    message:
      "The token configuration is invalid. Check decimals and price feed.",
  },
  FundsLocked: {
    title: "Funds Locked",
    message:
      "This token has locked funds in active challenges and cannot be removed.",
  },

  // Fee Errors
  NoPendingUpdate: {
    title: "No Pending Update",
    message: "There is no fee update currently pending.",
  },
  UpdateNotReady: {
    title: "Update Not Ready",
    message: "The 24-hour fee update delay period has not completed yet.",
  },
  USDCFeeZero: {
    title: "Invalid Fee",
    message: "Fee cannot be zero.",
  },
  USDCFeeTooLow: {
    title: "Fee Too Low",
    message: "Fee must be at least 0.1 USDC.",
  },
  USDCFeeOverflow: {
    title: "Invalid Fee",
    message: "The fee value is too large.",
  },
  FeeChangeTooLarge: {
    title: "Change Too Large",
    message: "Fee cannot be changed by more than 5x in a single update.",
  },
  InsufficientFee: {
    title: "Insufficient Fee",
    message: "The fee amount provided is insufficient.",
  },

  // Duration & Time Errors
  InvalidDuration: {
    title: "Invalid Duration",
    message: "Challenge duration must be within the allowed range.",
  },
  DurationTooLarge: {
    title: "Duration Too Large",
    message: "The specified duration exceeds the maximum allowed (2 years).",
  },
  MinDurationAboveMax: {
    title: "Invalid Configuration",
    message: "Minimum duration cannot exceed maximum duration.",
  },
  MaxDurationAboveAbsolute: {
    title: "Duration Too Large",
    message: "Maximum duration cannot exceed 2 years.",
  },
  MinDurationBelowAbsolute: {
    title: "Duration Too Short",
    message: "Minimum duration cannot be less than 1 minute.",
  },

  // Grace Period Errors
  GracePeriodCannotBeLessThanADay: {
    title: "Period Too Short",
    message: "Grace period must be at least 1 day.",
  },
  GracePeriodTooLarge: {
    title: "Period Too Long",
    message: "Grace period cannot exceed 30 days.",
  },
  GracePeriodActive: {
    title: "Grace Period Active",
    message:
      "The grace period has not expired yet. Wait until it ends to sweep.",
  },
  GracePeriodTooLong: {
    title: "Period Too Long",
    message: "The specified grace period is too long.",
  },

  // Lock Multiplier Errors
  LockMultiplierTooLow: {
    title: "Multiplier Too Low",
    message: "Lock multiplier must be at least 3x.",
  },
  LockMultiplierTooHigh: {
    title: "Multiplier Too High",
    message: "Lock multiplier cannot exceed 15x.",
  },
  LockMultiplierCausesOverflow: {
    title: "Invalid Configuration",
    message: "The lock multiplier would cause arithmetic overflow.",
  },

  // Penalty Errors
  MinPenaltyPercentageMustBeGreaterThan5: {
    title: "Invalid Percentage",
    message: "Minimum penalty percentage must be greater than 5%.",
  },
  MinPenaltyPercentageHigherThan50: {
    title: "Invalid Percentage",
    message: "Minimum penalty percentage cannot exceed 50%.",
  },
  InvalidPenaltyPercent: {
    title: "Invalid Percentage",
    message: "Penalty percentage must be between 0 and 100.",
  },
  PenaltyPercentLessThanMinimum: {
    title: "Penalty Too Low",
    message: "Penalty percentage is below the minimum required.",
  },

  // Recovery Errors
  NoTokensToRecover: {
    title: "Nothing to Recover",
    message: "There are no recoverable funds available.",
  },
  CannotRecoverLockedFunds: {
    title: "Funds Locked",
    message: "Cannot recover funds that are locked in active challenges.",
  },
  CannotRecoverStakedTokens: {
    title: "Funds Locked",
    message: "Cannot recover tokens that are currently staked.",
  },
  RecoveryFailed: {
    title: "Recovery Failed",
    message: "The fund recovery operation failed.",
  },

  // Challenge Errors
  ChallengeNotExpired: {
    title: "Challenge Active",
    message: "This challenge has not expired yet.",
  },
  ChallengeActive: {
    title: "Challenge Active",
    message: "This challenge is still active and cannot be withdrawn.",
  },
  ChallengeSuccessful: {
    title: "Challenge Successful",
    message: "This challenge was marked successful and cannot be swept.",
  },
  ChallengeAlreadySuccess: {
    title: "Already Verified",
    message: "This challenge has already been marked as successful.",
  },
  ChallengeAlreadyWithdrawn: {
    title: "Already Withdrawn",
    message: "Funds have already been withdrawn from this challenge.",
  },
  CannotSweepLock: {
    title: "Cannot Sweep",
    message: "LOCK penalty challenges cannot be swept by admin.",
  },
  CannotSweepPartialPenalty: {
    title: "Cannot Sweep",
    message: "Cannot sweep challenges with partial penalties.",
  },

  // Price & Oracle Errors
  StalePrice: {
    title: "Stale Price",
    message: "The price oracle data is stale. Try again later.",
  },
  InvalidPriceData: {
    title: "Invalid Price",
    message: "The price data from the oracle is invalid.",
  },
  PriceOracleNotSet: {
    title: "Oracle Not Set",
    message: "No price oracle has been configured for this token.",
  },

  // Transfer Errors
  EthTransferFailed: {
    title: "Transfer Failed",
    message: "ETH transfer failed. The recipient may not accept ETH.",
  },
  FeeTransferFailed: {
    title: "Fee Failed",
    message: "Fee transfer to treasury failed.",
  },
  TokenTransferFailed: {
    title: "Transfer Failed",
    message: "Token transfer failed.",
  },
  NoPendingWithdrawal: {
    title: "No Withdrawal",
    message: "You have no pending withdrawal to claim.",
  },
  WithdrawalClaimFailed: {
    title: "Claim Failed",
    message: "Failed to claim the pending withdrawal.",
  },

  // Contract State Errors
  EnforcedPause: {
    title: "Contract Paused",
    message:
      "The contract is currently paused. Operations are temporarily disabled.",
  },
  ExpectedPause: {
    title: "Not Paused",
    message: "The contract is not currently paused.",
  },

  // Input Validation Errors
  InvalidInput: {
    title: "Invalid Input",
    message: "The provided input is invalid.",
  },
  InvalidCount: {
    title: "Invalid Count",
    message: "The specified count is invalid.",
  },
  CountTooLarge: {
    title: "Count Too Large",
    message: "The specified count exceeds the maximum allowed.",
  },
};

// Wallet/network errors
const WALLET_ERRORS = {
  ACTION_REJECTED: {
    title: "Transaction Cancelled",
    message: "You rejected the transaction in your wallet.",
  },
  4001: {
    title: "Transaction Cancelled",
    message: "You rejected the transaction in your wallet.",
  },
  INSUFFICIENT_FUNDS: {
    title: "Insufficient Funds",
    message: "Your wallet doesn't have enough ETH to pay for gas fees.",
  },
  NETWORK_ERROR: {
    title: "Network Error",
    message: "Unable to connect to the network. Please check your connection.",
  },
  TIMEOUT: {
    title: "Request Timeout",
    message: "The request timed out. Please try again.",
  },
  CALL_EXCEPTION: {
    title: "Contract Error",
    message: "The contract call failed.",
  },
};

/**
 * Parse an error and return a user-friendly title and message
 * @param {Error} error - The error object from ethers.js or wallet
 * @returns {{ title: string, message: string }}
 */
export function parseContractError(error) {
  // Check for user rejection (most common)
  if (error?.code === "ACTION_REJECTED" || error?.code === 4001) {
    return WALLET_ERRORS.ACTION_REJECTED;
  }

  // Check for network errors
  if (error?.code === "NETWORK_ERROR") {
    return WALLET_ERRORS.NETWORK_ERROR;
  }

  // Check for insufficient funds
  if (
    error?.code === "INSUFFICIENT_FUNDS" ||
    error?.message?.toLowerCase().includes("insufficient funds")
  ) {
    return WALLET_ERRORS.INSUFFICIENT_FUNDS;
  }

  // Collect all possible error sources for parsing
  const errorSources = [];

  // ethers v6: shortMessage often contains the cleanest error info
  if (error?.shortMessage) {
    errorSources.push(error.shortMessage);
  }

  // ethers v6: revert info
  if (error?.revert?.name) {
    errorSources.push(error.revert.name);
  }

  // ethers v6: info.error for nested errors
  if (error?.info?.error?.message) {
    errorSources.push(error.info.error.message);
  }
  if (error?.info?.error?.data?.message) {
    errorSources.push(error.info.error.data.message);
  }

  // Standard error properties
  if (error?.reason) {
    errorSources.push(error.reason);
  }
  if (error?.message) {
    errorSources.push(error.message);
  }

  // error.data for raw revert data
  if (error?.data && typeof error.data === "string") {
    errorSources.push(error.data);
  }

  // Nested error object
  if (error?.error?.message) {
    errorSources.push(error.error.message);
  }
  if (error?.error?.reason) {
    errorSources.push(error.error.reason);
  }

  // Combine all sources into one search string
  const combinedError = errorSources.join(" ");

  // First, check for exact error name matches (with word boundaries)
  for (const [errorName, errorInfo] of Object.entries(CONTRACT_ERRORS)) {
    // Check if the error name appears as a standalone identifier
    // Patterns: ErrorName(), ErrorName(args), "ErrorName", ErrorName
    const patterns = [
      new RegExp(`\\b${errorName}\\s*\\(`), // ErrorName(
      new RegExp(`"${errorName}"`), // "ErrorName"
      new RegExp(`reverted with custom error '${errorName}'`), // common ethers v6 format
      new RegExp(`error ${errorName}`), // error ErrorName
    ];

    for (const pattern of patterns) {
      if (pattern.test(combinedError)) {
        return errorInfo;
      }
    }
  }

  // Second pass: simple includes check (less strict)
  for (const [errorName, errorInfo] of Object.entries(CONTRACT_ERRORS)) {
    if (combinedError.includes(errorName)) {
      return errorInfo;
    }
  }

  // Check for OpenZeppelin standard errors with different formats
  if (
    combinedError.includes("Ownable") &&
    combinedError.includes("caller is not the owner")
  ) {
    return CONTRACT_ERRORS.OwnableUnauthorizedAccount;
  }
  if (combinedError.includes("Pausable") && combinedError.includes("paused")) {
    return CONTRACT_ERRORS.EnforcedPause;
  }

  // Fallback: Clean up the error reason if available
  const firstCleanSource = errorSources[0] || "";
  if (firstCleanSource) {
    // Remove common prefixes
    let cleanReason = firstCleanSource
      .replace(/^execution reverted: ?/i, "")
      .replace(/^reverted with reason string ?/i, "")
      .replace(/^reverted with custom error ?/i, "")
      .replace(/^call revert exception.*?data="[^"]*"/i, "")
      .replace(/^Error: ?/i, "")
      .replace(/^ContractFunctionExecutionError:?/i, "")
      .trim();

    // Remove anything in parentheses at the end (error arguments)
    cleanReason = cleanReason.replace(/\([^)]*\)$/, "").trim();

    // Remove quotes
    cleanReason = cleanReason.replace(/^['"]|['"]$/g, "");

    // If it's a short, clean message, use it
    if (cleanReason && cleanReason.length > 3 && cleanReason.length < 200) {
      return {
        title: "Error",
        message: cleanReason,
      };
    }
  }

  // Ultimate fallback
  return {
    title: "Error",
    message: "An unexpected error occurred. Please try again.",
  };
}

export default parseContractError;
