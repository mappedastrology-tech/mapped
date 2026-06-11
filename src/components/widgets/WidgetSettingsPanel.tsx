"use client";

import { useEffect, useRef, useState } from "react";
import {
  WIDGET_REGISTRY,
  type WidgetPreference,
  loadWidgetOrder,
  saveWidgetOrder,
  getDefaultWidgetOrder,
  reorderWidgets,
} from "@/lib/widgets";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: WidgetPreference[]) => void;
}

export default function WidgetSettingsPanel({ isOpen, onClose, onSave }: Props) {
  const [preferences, setPreferences] = useState<WidgetPreference[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPreferences(loadWidgetOrder());
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close on background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleToggle = (id: string) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== index) {
      setPreferences((prev) => reorderWidgets(prev, draggedItem, index));
      setDraggedItem(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleReset = () => {
    setPreferences(getDefaultWidgetOrder());
  };

  const handleSave = () => {
    saveWidgetOrder(preferences);
    onSave(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/40 z-40 transition-opacity"
        onClick={handleBackgroundClick}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-foreground/18 shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/18">
          <h2 className="text-foreground font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Widget Settings
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {preferences.map((pref, idx) => {
            const widget = WIDGET_REGISTRY.find((w) => w.id === pref.id);
            if (!widget) return null;

            return (
              <div
                key={pref.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`p-3 rounded-lg border transition-all cursor-move ${
                  draggedItem === idx
                    ? "bg-foreground/10 border-foreground/20 opacity-50"
                    : "bg-card/50 border-foreground/18 hover:border-foreground/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs text-muted mt-1">⋮⋮</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">{widget.icon} {widget.name}</p>
                        <p className="text-muted text-xs">{widget.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pref.enabled}
                          onChange={() => handleToggle(pref.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-foreground/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-terracotta/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-cream after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream after:border-foreground/20 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta/50" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-foreground/18 px-6 py-4 space-y-3">
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 text-sm text-secondary hover:text-foreground border border-foreground/20 rounded-lg transition-colors"
          >
            Reset to defaults
          </button>
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 text-sm font-medium text-cream bg-terracotta hover:bg-terracotta/90 rounded-lg transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </>
  );
}
