import { useState, useEffect, useCallback } from "react";
import { Contract } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../data/contractConfig";

/**
 * Hook for read-only contract queries with caching and refresh
 */
export function useContractRead(functionName, args = [], options = {}) {
  const signer = useEthersSigner();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    enabled = true,
    refreshInterval = null,
    transform = (data) => data,
  } = options;

  const fetchData = useCallback(async () => {
    if (!signer || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const result = await contract[functionName](...args);
      setData(transform(result));
    } catch (err) {
      console.error(`Error calling ${functionName}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [signer, functionName, JSON.stringify(args), enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for reading multiple contract values at once
 */
export function useContractReads(calls, options = {}) {
  const signer = useEthersSigner();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { enabled = true } = options;

  const fetchData = useCallback(async () => {
    if (!signer || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const results = {};

      await Promise.all(
        calls.map(async ({ key, functionName, args = [] }) => {
          try {
            results[key] = await contract[functionName](...args);
          } catch (err) {
            console.warn(`Error calling ${functionName}:`, err);
            results[key] = null;
          }
        })
      );

      setData(results);
    } catch (err) {
      console.error("Error in batch read:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [signer, JSON.stringify(calls), enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
