/**
 * Tabs loading state — shows while any tab page is loading.
 * Uses the branded spinner consistent with the rest of the app.
 */

export default function TabsLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div
        className="w-7 h-7 border-2 rounded-full animate-spin"
        style={{
          borderColor: "color-mix(in srgb, var(--brass) 25%, transparent)",
          borderTopColor: "var(--brass)",
        }}
        role="status"
        aria-label="Loading"
      />
      <p className="text-xs text-muted animate-pulse">Loading...</p>
    </div>
  );
}
