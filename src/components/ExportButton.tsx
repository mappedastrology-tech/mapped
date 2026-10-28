"use client";

/**
 * ExportButton — downloads chart data as CSV.
 * Sits alongside ShareCard for each chart view.
 */

import { useCallback } from "react";
import { useToast } from "@/components/Toast";
import { downloadCSV } from "@/lib/exportChart";

interface ExportButtonProps {
  type: string;
  name: string;
  name2?: string;
  bigThree?: { sun?: string; moon?: string; rising?: string };
  planets?: any[];
  houses?: any[];
  aspects?: any[];
  specialPoints?: any[];
  meta?: Record<string, string>;
}

export default function ExportButton(props: ExportButtonProps) {
  const { toast } = useToast();
  // downloadCSV can now fail loudly where a file cannot be saved — in the
  // native shell a blob download silently does nothing, and this button used
  // to return to its resting state as though it had worked.
  const handleExport = useCallback(async () => {
    try {
      await downloadCSV({
        type: props.type,
        name: props.name,
        name2: props.name2,
        bigThree: props.bigThree,
        planets: props.planets,
        houses: props.houses,
        aspects: props.aspects,
        specialPoints: props.specialPoints,
        meta: props.meta,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the file.");
    }
  }, [props, toast]);

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-lavender/30 text-lavender text-xs font-medium tracking-wide hover:bg-lavender/10 hover:text-lavender-light transition-all active:scale-[0.97]"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      CSV
    </button>
  );
}
