import type { SileoPosition } from "./types";

/* --------------------------------- Layout --------------------------------- */

export const HEIGHT = 40;
export const WIDTH = 350;
export const DEFAULT_ROUNDNESS = 16;

/** Size of the state badge circle (px) */
export const BADGE_SIZE = 20;
/** Horizontal padding inside the pill — matches CSS `padding: 0 14px` on header */
export const HEADER_PADDING = 14;
/** Gap between badge and title — matches CSS `gap: 10px` on header */
export const HEADER_GAP = 10;

/* --------------------------------- Defaults ------------------------------- */

export const DEFAULT_POSITION: SileoPosition = "bottom-center";
export const DEFAULT_ID = "sileo-default";

/* --------------------------------- Timing --------------------------------- */

export const DURATION_MS = 600;
export const DURATION_S = DURATION_MS / 1000;

export const DEFAULT_TOAST_DURATION = 6000;
export const EXIT_DURATION = DEFAULT_TOAST_DURATION * 0.1; // 600ms exit animation
export const AUTO_EXPAND_DELAY = DEFAULT_TOAST_DURATION * 0.025; // 150ms
export const AUTO_COLLAPSE_DELAY = DEFAULT_TOAST_DURATION - 2000; // 4000ms

export const SPRING = {
  type: "spring" as const,
  bounce: 0.25,
  duration: DURATION_S,
};

/* --------------------------------- Render --------------------------------- */

export const BLUR_RATIO = 0.5;
export const PILL_PADDING = 10;
export const MIN_EXPAND_RATIO = 2.25;
export const SWAP_COLLAPSE_MS = 200;
export const HEADER_EXIT_MS = Math.round(DURATION_MS * 0.7); // 420ms

/* --------------------------------- Helpers -------------------------------- */

/** Derives pill horizontal alignment from a SileoPosition string. */
export function pillAlign(pos: SileoPosition): "left" | "center" | "right" {
  if (pos.includes("right")) return "right";
  if (pos.includes("center")) return "center";
  return "left";
}

/** Derives expand direction from a SileoPosition string. */
export function expandDir(pos: SileoPosition): "bottom" | "top" {
  return pos.startsWith("top") ? "bottom" : "top";
}

/* --------------------------------- Theme fills ----------------------------- */

export const THEME_FILLS: Record<"light" | "dark", string> = {
  light: "#1a1a1a",
  dark: "#f2f2f2",
};

/* --------------------------------- Positions ------------------------------ */

export const SILEO_POSITIONS: SileoPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];
