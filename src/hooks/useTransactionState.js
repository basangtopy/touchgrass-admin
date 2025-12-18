import { useState, useCallback } from "react";

/**
 * Hook to manage transaction state across multiple operations
 */
export function useTransactionState() {
  const [state, setState] = useState({
    status: "idle", // idle | pending | confirming | success | error
    message: "",
    txHash: null,
    error: null,
  });

  const setIdle = useCallback(() => {
    setState({
      status: "idle",
      message: "",
      txHash: null,
      error: null,
    });
  }, []);

  const setPending = useCallback(
    (message = "Waiting for wallet confirmation...") => {
      setState({
        status: "pending",
        message,
        txHash: null,
        error: null,
      });
    },
    []
  );

  const setConfirming = useCallback(
    (
      txHash,
      message = "Transaction submitted, waiting for confirmation..."
    ) => {
      setState({
        status: "confirming",
        message,
        txHash,
        error: null,
      });
    },
    []
  );

  const setSuccess = useCallback(
    (message = "Transaction confirmed!", txHash = null) => {
      setState({
        status: "success",
        message,
        txHash,
        error: null,
      });
    },
    []
  );

  const setError = useCallback((error, message = null) => {
    const errorMessage =
      message || error?.reason || error?.message || "Transaction failed";
    setState({
      status: "error",
      message: errorMessage,
      txHash: null,
      error,
    });
  }, []);

  const reset = setIdle;

  return {
    ...state,
    setIdle,
    setPending,
    setConfirming,
    setSuccess,
    setError,
    reset,
  };
}
