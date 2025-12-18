import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

/**
 * Transaction status indicator component
 */
export default function TransactionStatus({
  status,
  message,
  txHash,
  explorerUrl,
}) {
  const statusConfig = {
    idle: null,
    pending: {
      icon: Loader2,
      color: "var(--warning)",
      label: "Pending",
      animate: true,
    },
    confirming: {
      icon: Clock,
      color: "var(--info)",
      label: "Confirming",
      animate: true,
    },
    success: {
      icon: CheckCircle,
      color: "var(--accent-primary)",
      label: "Success",
      animate: false,
    },
    error: {
      icon: XCircle,
      color: "var(--danger)",
      label: "Failed",
      animate: false,
    },
  };

  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className="transaction-status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        background: `${config.color}15`,
        border: `1px solid ${config.color}30`,
        borderRadius: "8px",
        marginBottom: "1rem",
      }}
    >
      <Icon
        size={20}
        style={{
          color: config.color,
          animation: config.animate ? "spin 1s linear infinite" : "none",
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{ fontWeight: 600, fontSize: "0.875rem", color: config.color }}
        >
          {config.label}
        </div>
        {message && (
          <div
            style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}
          >
            {message}
          </div>
        )}
      </div>
      {txHash && explorerUrl && (
        <a
          href={`${explorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.75rem",
            color: "var(--accent-primary)",
            textDecoration: "none",
          }}
        >
          View TX →
        </a>
      )}
    </div>
  );
}
