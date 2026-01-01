import { useToast } from "../../contexts/ToastContext";
import Toast from "./Toast";

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          isExiting={toast.isExiting}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}
