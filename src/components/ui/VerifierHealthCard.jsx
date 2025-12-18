import { useVerifierHealth } from "../../hooks/useVerifierHealth";
import { Server, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

/**
 * Displays the health status of the verifier server.
 * Shows connection status, response time, and last checked time.
 */
export default function VerifierHealthCard() {
  const {
    isHealthy,
    isLoading,
    lastChecked,
    responseTime,
    error,
    serverInfo,
    refresh,
    verifierUrl,
  } = useVerifierHealth(30000); // Check every 30 seconds

  const getStatusColor = () => {
    if (isLoading || isHealthy === null) return "var(--text-muted)";
    return isHealthy ? "var(--accent-primary)" : "var(--danger)";
  };

  const getStatusText = () => {
    if (isLoading) return "Checking...";
    if (isHealthy === null) return "Unknown";
    return isHealthy ? "Healthy" : "Unhealthy";
  };

  const getStatusIcon = () => {
    if (isLoading || isHealthy === null) {
      return <RefreshCw size={16} className="loading-spin" />;
    }
    return isHealthy ? (
      <CheckCircle size={16} style={{ color: "var(--accent-primary)" }} />
    ) : (
      <XCircle size={16} style={{ color: "var(--danger)" }} />
    );
  };

  return (
    <div
      className="card"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${
          isHealthy === false ? "var(--danger)" : "var(--border-light)"
        }`,
      }}
    >
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Server size={18} style={{ color: getStatusColor() }} />
          <span className="card-title">Verifier Server</span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={refresh}
          disabled={isLoading}
          title="Refresh status"
        >
          <RefreshCw size={14} className={isLoading ? "loading-spin" : ""} />
        </button>
      </div>
      <div className="card-body">
        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted" style={{ fontSize: "0.875rem" }}>
            Status
          </span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span
              style={{
                color: getStatusColor(),
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Response Time */}
        {responseTime !== null && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              Response Time
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: "0.875rem",
                color:
                  responseTime < 500
                    ? "var(--accent-primary)"
                    : responseTime < 2000
                    ? "var(--warning)"
                    : "var(--danger)",
              }}
            >
              {responseTime}ms
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="mb-3"
            style={{
              padding: "0.5rem 0.75rem",
              background: "var(--danger-glow)",
              borderRadius: "6px",
              fontSize: "0.8125rem",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}

        {/* Server Info (when healthy) */}
        {serverInfo?.contract && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              Contract
            </span>
            <code
              className="font-mono"
              style={{
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}
            >
              {serverInfo.contract.slice(0, 6)}...
              {serverInfo.contract.slice(-4)}
            </code>
          </div>
        )}

        {/* Last Checked */}
        {lastChecked && (
          <div
            className="flex items-center gap-1 text-muted"
            style={{ fontSize: "0.75rem" }}
          >
            <Clock size={12} />
            <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Server URL */}
        <div
          className="text-muted font-mono"
          style={{
            fontSize: "0.6875rem",
            marginTop: "0.75rem",
            opacity: 0.7,
          }}
        >
          {verifierUrl}
        </div>
      </div>
    </div>
  );
}
