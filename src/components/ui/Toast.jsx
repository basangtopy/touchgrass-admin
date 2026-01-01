import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function Toast({
  id,
  type = "info",
  title,
  message,
  isExiting = false,
  onDismiss,
}) {
  const Icon = iconMap[type] || Info;

  return (
    <div
      className={`toast toast-${type} ${isExiting ? "toast-exiting" : ""}`}
      role="alert"
    >
      <div className="toast-icon">
        <Icon size={20} />
      </div>
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        {message && <div className="toast-message">{message}</div>}
      </div>
      <button
        className="toast-dismiss"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
