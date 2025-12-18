import { useState, useEffect, useCallback } from "react";

/**
 * Hook to check the health status of the verifier server.
 * Polls the health endpoint at a configurable interval.
 */
export function useVerifierHealth(pollIntervalMs = 30000) {
  const [status, setStatus] = useState({
    isHealthy: null, // null = unknown, true = healthy, false = unhealthy
    isLoading: true,
    lastChecked: null,
    responseTime: null,
    error: null,
    serverInfo: null, // { status, timestamp, contract }
  });

  const verifierUrl =
    import.meta.env.VITE_VERIFIER_URL || "http://localhost:3001";

  const checkHealth = useCallback(async () => {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${verifierUrl}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setStatus({
        isHealthy: data.status === "ok",
        isLoading: false,
        lastChecked: new Date(),
        responseTime,
        error: null,
        serverInfo: data,
      });
    } catch (error) {
      setStatus({
        isHealthy: false,
        isLoading: false,
        lastChecked: new Date(),
        responseTime: null,
        error:
          error.name === "AbortError"
            ? "Request timed out"
            : error.message || "Connection failed",
        serverInfo: null,
      });
    }
  }, [verifierUrl]);

  // Initial check and polling
  useEffect(() => {
    checkHealth();

    if (pollIntervalMs > 0) {
      const intervalId = setInterval(checkHealth, pollIntervalMs);
      return () => clearInterval(intervalId);
    }
  }, [checkHealth, pollIntervalMs]);

  return {
    ...status,
    refresh: checkHealth,
    verifierUrl,
  };
}

export default useVerifierHealth;
