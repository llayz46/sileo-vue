import type { VNode, Component } from "vue";

// Renderable content (equivalent to React's ReactNode for our use case)
export type Renderable = string | VNode | Component | null | undefined;

export type SileoState =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "action"
  | "show";

export type SileoPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface SileoButton {
  title: string;
  onClick: () => void;
}

export interface SileoStyles {
  title?: string;
  description?: string;
  badge?: string;
  button?: string;
}

export interface SileoAutopilot {
  expand: number;
  collapse: number;
}

export interface SileoOptions {
  id?: string;
  title?: string;
  description?: Renderable;
  position?: SileoPosition;
  duration?: number | null;
  fill?: string;
  roundness?: number;
  icon?: Renderable;
  autopilot?: boolean | SileoAutopilot;
  button?: SileoButton;
  styles?: SileoStyles;
}

export interface SileoItem extends SileoOptions {
  id: string;
  state: SileoState;
  instanceId: string;
}

export type SileoListener = (toasts: SileoItem[]) => void;

export interface SileoPromiseOptions<T = unknown> {
  loading: Pick<SileoOptions, "title" | "icon">;
  success: SileoOptions | ((data: T) => SileoOptions);
  error: SileoOptions | ((err: unknown) => SileoOptions);
  action?: SileoOptions | ((data: T) => SileoOptions);
}

export interface ToasterProps {
  position?: SileoPosition;
  offset?: number | string | Partial<Record<"top" | "right" | "bottom" | "left", number | string>>;
  options?: Partial<SileoOptions>;
  theme?: "light" | "dark" | "system";
  debug?: boolean;
}
