import type {
  SileoItem,
  SileoListener,
  SileoOptions,
  SileoPosition,
  SileoPromiseOptions,
  SileoState,
} from "./types";
import {
  DEFAULT_TOAST_DURATION,
  DEFAULT_ID,
  DEFAULT_POSITION,
  AUTO_EXPAND_DELAY,
  AUTO_COLLAPSE_DELAY,
} from "./constants";

// Internal counter for unique instance IDs

let instanceCounter = 0;

function genInstanceId(): string {
  return `${++instanceCounter}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Singleton store

export const store = {
  toasts: [] as SileoItem[],
  listeners: new Set<SileoListener>(),
  position: DEFAULT_POSITION as SileoPosition,
  options: undefined as Partial<SileoOptions> | undefined,

  emit() {
    for (const fn of this.listeners) fn(this.toasts);
  },

  update(fn: (prev: SileoItem[]) => SileoItem[]) {
    this.toasts = fn(this.toasts);
    this.emit();
  },
};

// Helpers

function mergeOptions(
  base: Partial<SileoOptions> | undefined,
  override: SileoOptions
): SileoOptions {
  return { ...base, ...override };
}

function resolveAutopilot(autopilot: SileoOptions["autopilot"]) {
  if (autopilot === false) return false;
  // true | undefined → use default timings
  if (autopilot === true || autopilot === undefined) {
    return { expand: AUTO_EXPAND_DELAY, collapse: AUTO_COLLAPSE_DELAY };
  }
  return autopilot;
}

function buildSileoItem(
  state: SileoState,
  opts: SileoOptions,
  globalOpts?: Partial<SileoOptions>
): SileoItem {
  const merged = mergeOptions(globalOpts, opts);
  const id = merged.id ?? DEFAULT_ID;
  const duration = merged.duration !== undefined ? merged.duration : DEFAULT_TOAST_DURATION;
  const autopilot =
    merged.description && duration != null
      ? resolveAutopilot(merged.autopilot)
      : false;

  return {
    ...merged,
    id,
    state,
    instanceId: genInstanceId(),
    duration: duration ?? undefined,
    autopilot,
  };
}

// Core toast operations

function createToast(state: SileoState, opts: SileoOptions): string {
  const item = buildSileoItem(state, opts, store.options);

  store.update((prev) => {
    const existing = prev.findIndex((t) => t.id === item.id);
    if (existing !== -1) {
      const updated = [...prev];
      updated[existing] = item;
      return updated;
    }
    return [...prev, item];
  });

  return item.id;
}

function updateToast(id: string, patch: Partial<SileoItem>) {
  store.update((prev) =>
    prev.map((t) =>
      t.id === id ? { ...t, ...patch, instanceId: genInstanceId() } : t
    )
  );
}

function dismissToast(id?: string) {
  if (id === undefined) {
    store.update(() => []);
  } else {
    store.update((prev) => prev.filter((t) => t.id !== id));
  }
}

// Public API

function show(opts: SileoOptions): string {
  return createToast("show", opts);
}

function success(opts: SileoOptions): string {
  return createToast("success", opts);
}

function error(opts: SileoOptions): string {
  return createToast("error", opts);
}

function warning(opts: SileoOptions): string {
  return createToast("warning", opts);
}

function info(opts: SileoOptions): string {
  return createToast("info", opts);
}

function action(opts: SileoOptions): string {
  return createToast("action", opts);
}

function loading(opts: SileoOptions): string {
  return createToast("loading", opts);
}

function promise<T>(
  p: Promise<T>,
  opts: SileoPromiseOptions<T>
): Promise<T> {
  const id = createToast("loading", {
    ...opts.loading,
    id: opts.loading.title ? undefined : DEFAULT_ID,
    duration: null,
  });

  p.then((data) => {
    const resolved =
      typeof opts.success === "function" ? opts.success(data) : opts.success;

    if (opts.action) {
      const actionResolved =
        typeof opts.action === "function" ? opts.action(data) : opts.action;
      updateToast(id, {
        ...actionResolved,
        state: "action",
        duration: actionResolved.duration ?? DEFAULT_TOAST_DURATION,
      });
    } else {
      updateToast(id, {
        ...resolved,
        state: "success",
        duration: resolved.duration ?? DEFAULT_TOAST_DURATION,
      });
    }
  }).catch((err) => {
    const rejected =
      typeof opts.error === "function" ? opts.error(err) : opts.error;
    updateToast(id, {
      ...rejected,
      state: "error",
      duration: rejected.duration ?? DEFAULT_TOAST_DURATION,
    });
  });

  return p;
}

function dismiss(id?: string) {
  dismissToast(id);
}

function clear() {
  dismissToast(undefined);
}

export const sileo = {
  show,
  success,
  error,
  warning,
  info,
  action,
  loading,
  promise,
  dismiss,
  clear,
};
