export default function StatusBadge({ status, label }) {
  const variants = {
    success: "success",
    active: "success",
    warning: "warning",
    pending: "warning",
    error: "danger",
    failed: "danger",
    paused: "danger",
    info: "info",
  };

  const variant = variants[status] || "info";

  return (
    <span className={`status-badge ${variant}`}>
      <span className="status-badge-dot" />
      {label || status}
    </span>
  );
}
