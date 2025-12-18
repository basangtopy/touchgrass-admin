import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import Button from "./Button";

/**
 * Confirmation modal component for dangerous actions
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // danger | warning | info
  loading = false,
}) {
  if (!isOpen) return null;

  const icons = {
    danger: AlertTriangle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    danger: "var(--danger)",
    warning: "var(--warning)",
    info: "var(--info)",
  };

  const glows = {
    danger: "var(--danger-glow)",
    warning: "var(--warning-glow)",
    info: "var(--info-glow)",
  };

  const Icon = icons[variant];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: "420px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-body"
          style={{ textAlign: "center", padding: "2rem 1.5rem" }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 1.25rem",
              background: glows[variant],
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={28} style={{ color: colors[variant] }} />
          </div>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9375rem",
              lineHeight: "1.6",
              marginBottom: "1.5rem",
            }}
          >
            {message}
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              style={{ minWidth: "100px" }}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "info" ? "primary" : "danger"}
              onClick={onConfirm}
              loading={loading}
              style={{ minWidth: "100px" }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
