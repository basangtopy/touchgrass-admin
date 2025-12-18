/**
 * Dev-only logging utility.
 * In development: logs to console
 * In production: silently ignores (or could send to logging service)
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log debug info (dev only)
   */
  debug: (...args) => {
    if (isDev) {
      console.log("[DEBUG]", ...args);
    }
  },

  /**
   * Log info (dev only)
   */
  info: (...args) => {
    if (isDev) {
      console.info("[INFO]", ...args);
    }
  },

  /**
   * Log warnings (dev only, production shows in console for admins)
   */
  warn: (...args) => {
    if (isDev) {
      console.warn("[WARN]", ...args);
    }
  },

  /**
   * Log errors (dev only - in production, could integrate with error tracking)
   */
  error: (...args) => {
    if (isDev) {
      console.error("[ERROR]", ...args);
    }
    // In production, you could send to Sentry, LogRocket, etc.
    // if (!isDev) {
    //   sendToErrorTracking(args);
    // }
  },
};

export default logger;
