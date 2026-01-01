import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    // Clean up timeout reference
    delete timeoutsRef.current[id];
  }, []);

  const dismissToast = useCallback(
    (id) => {
      // Set isExiting to true to trigger exit animation
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
      );

      // Actually remove after animation completes (300ms matches CSS animation)
      setTimeout(() => {
        removeToast(id);
      }, 300);
    },
    [removeToast]
  );

  const showToast = useCallback(
    ({ type = "info", title, message, duration = 5000 }) => {
      const id = ++toastId;

      setToasts((prev) => {
        // Limit to 5 toasts max - dismiss oldest if needed
        if (prev.length >= 5) {
          const oldestId = prev[0].id;
          // Schedule dismissal of oldest toast
          setTimeout(() => dismissToast(oldestId), 0);
        }
        return [...prev, { id, type, title, message, isExiting: false }];
      });

      // Auto-dismiss after duration
      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          dismissToast(id);
        }, duration);
        timeoutsRef.current[id] = timeoutId;
      }

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
