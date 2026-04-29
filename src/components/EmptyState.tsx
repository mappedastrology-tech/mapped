"use client";

/**
 * EmptyState — a gentle, branded placeholder for screens with no data yet.
 * Used across journal, tarot history, maps connections, and anywhere
 * content hasn't been created.
 */

import Link from "next/link";

interface Props {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "✦",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: Props) {
  return (
    <div className="flex-1 flex items-center justify-center py-12">
      <div className="text-center px-8 max-w-xs">
        <div className="text-3xl mb-4 opacity-50">{icon}</div>
        <p
          className="text-[14px] font-medium leading-relaxed mb-2"
          style={{ color: "var(--foreground-secondary)" }}
        >
          {title}
        </p>
        <p
          className="text-[12px] leading-relaxed mb-6"
          style={{ color: "var(--foreground-faint)" }}
        >
          {description}
        </p>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-block px-5 py-3 rounded-xl text-[13px] font-medium transition-colors"
            style={{
              backgroundColor: "var(--terracotta-bg, rgba(183,107,72,0.1))",
              color: "var(--terracotta)",
            }}
          >
            {actionLabel}
          </Link>
        )}
        {actionLabel && onAction && !actionHref && (
          <button
            onClick={onAction}
            className="inline-block px-5 py-3 rounded-xl text-[13px] font-medium transition-colors"
            style={{
              backgroundColor: "var(--terracotta-bg, rgba(183,107,72,0.1))",
              color: "var(--terracotta)",
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
