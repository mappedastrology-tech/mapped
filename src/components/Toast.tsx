"use client";

/**
 * Toast notification system — app-wide feedback for saves, errors, and info.
 *
 * Usage:
 *   import { useToast } from "@/components/Toast";
 *   const { toast } = useToast();
 *   toast.success("Saved!");
 *   toast.error("Something went wrong");
 *   toast.info("Syncing...");
 *
 * Wrap your app with <ToastProvider> in the root layout.
 * Toasts auto-dismiss after 3s (errors after 5s). Max 3 visible.
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastAPI {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

interface ToastContextValue {
  toast: ToastAPI;
}

const ToastContext = createContext<ToastContextValue>({
  toast: {
    success: () => {},
    error: () => {},
    info: () => {},
  },
});

export function useToast() {
  return useContext(ToastContext);
}

const MAX_TOASTS = 3;

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "◦",
};

const COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: {
    bg: "var(--background-card)",
    border: "var(--border-accent, var(--terracotta))",
    text: "var(--foreground)",
  },
  error: {
    bg: "var(--background-card)",
    border: "#c44",
    text: "var(--foreground)",
  },
  info: {
    bg: "var(--background-card)",
    border: "var(--foreground-faint, var(--foreground))",
    text: "var(--foreground)",
  },
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => {
        const next = [...prev, { id, type, message }];
        // Trim to max
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });
      // Auto-dismiss
      const delay = type === "error" ? 5000 : 3000;
      setTimeout(() => dismiss(id), delay);
    },
    [dismiss]
  );

  const api: ToastAPI = {
    success: useCallback((msg: string) => addToast("success", msg), [addToast]),
    error: useCallback((msg: string) => addToast("error", msg), [addToast]),
    info: useCallback((msg: string) => addToast("info", msg), [addToast]),
  };

  return (
    <ToastContext.Provider value={{ toast: api }}>
      {children}
      {/* Toast container — fixed bottom center */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-5 pointer-events-none"
          aria-live="polite"
          aria-atomic="false"
        >
          {toasts.map((t) => (
            <ToastBubble key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

function ToastBubble({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const colors = COLORS[item.type];
  const icon = ICONS[item.type];

  return (
    <button
      onClick={onDismiss}
      className="pointer-events-auto max-w-sm w-full flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg transition-all duration-300"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        opacity: item.exiting ? 0 : 1,
        transform: item.exiting ? "translateY(10px) scale(0.95)" : "translateY(0) scale(1)",
        animation: item.exiting ? undefined : "toast-in 0.3s ease-out",
      }}
      aria-label={`${item.type}: ${item.message}. Tap to dismiss.`}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
        style={{
          backgroundColor: `${colors.border}22`,
          color: colors.border,
        }}
      >
        {icon}
      </span>
      <span className="text-[13px] leading-snug">{item.message}</span>
    </button>
  );
}
