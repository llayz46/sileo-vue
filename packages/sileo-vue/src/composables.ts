import { ref, watchEffect, type Ref } from "vue";
import type { SileoItem } from "./types";
import { store } from "./store";

// useToast — reactive access to the active toast list

export function useToast(): { toasts: Ref<SileoItem[]> } {
  const toasts = ref<SileoItem[]>([...store.toasts]);

  watchEffect((onCleanup) => {
    const listener = (next: SileoItem[]) => {
      toasts.value = [...next];
    };
    store.listeners.add(listener);
    onCleanup(() => {
      store.listeners.delete(listener);
    });
  });

  return { toasts };
}

// useResolvedTheme — resolves 'system' to 'light' | 'dark'

export function useResolvedTheme(
  theme: Ref<"light" | "dark" | "system" | undefined>
) {
  const resolved = ref<"light" | "dark">("light");

  watchEffect((onCleanup) => {
    const t = theme.value;

    if (t === "light" || t === "dark") {
      resolved.value = t;
      return;
    }

    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    resolved.value = mq.matches ? "dark" : "light";

    const handler = (e: MediaQueryListEvent) => {
      resolved.value = e.matches ? "dark" : "light";
    };

    mq.addEventListener("change", handler);
    onCleanup(() => mq.removeEventListener("change", handler));
  });

  return resolved;
}
