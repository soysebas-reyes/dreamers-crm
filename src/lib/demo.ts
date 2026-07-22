// Single source of truth for the demo-mode flag. Server-side only —
// never import from a "use client" component (value would be undefined).
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}
