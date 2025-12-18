import { X } from "lucide-react";

/**
 * Reusable Modal component
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
}) {
  if (!isOpen) return null;

  const sizes = {
    small: "400px",
    medium: "500px",
    large: "700px",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: sizes[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
