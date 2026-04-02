<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import type { SileoItem, SileoPosition, ToasterProps } from "./types";
import { store } from "./store";
import { useToast, useResolvedTheme } from "./composables";
import {
  DEFAULT_POSITION,
  DEFAULT_TOAST_DURATION,
  EXIT_DURATION,
  SILEO_POSITIONS,
  THEME_FILLS,
  pillAlign,
  expandDir,
} from "./constants";
import SileoToast from "./Sileo.vue";

// Props

const props = withDefaults(defineProps<ToasterProps>(), {
  position: DEFAULT_POSITION,
  theme: undefined,
  offset: 16,
  options: undefined,
  debug: false,
});

// Theme

const themeRef = computed(() => props.theme);
const resolvedTheme = useResolvedTheme(themeRef);

/** Resolved fill colour for toasts that don't specify their own */
const defaultFill = computed(() => THEME_FILLS[resolvedTheme.value]);

// Toast state

const { toasts } = useToast();

watch(
  () => [props.position, props.options] as const,
  ([pos, opts]) => {
    store.position = (pos as SileoPosition) ?? DEFAULT_POSITION;
    store.options = opts;
  },
  { immediate: true }
);

// Exit animation tracking

/** IDs currently playing their exit animation */
const exitingIds = ref(new Set<string>());

function triggerExit(id: string) {
  if (exitingIds.value.has(id)) return;
  exitingIds.value = new Set([...exitingIds.value, id]);
  setTimeout(() => {
    store.update((prev) => prev.filter((t) => t.id !== id));
    exitingIds.value = new Set([...exitingIds.value].filter((x) => x !== id));
  }, EXIT_DURATION);
}

// Timer management (auto-dismiss)

interface TimerState {
  timeoutId: ReturnType<typeof setTimeout>;
  startedAt: number;
  remaining: number;
}

const timers = new Map<string, TimerState>();
const toastRefs = ref<Record<string, InstanceType<typeof SileoToast>>>({});

function scheduleToast(toast: SileoItem) {
  const duration = toast.duration ?? DEFAULT_TOAST_DURATION;
  if (duration == null) return; // persistent

  const existing = timers.get(toast.id);
  if (existing) return;

  const timeoutId = setTimeout(() => {
    timers.delete(toast.id);
    triggerExit(toast.id);
  }, duration);

  timers.set(toast.id, { timeoutId, startedAt: Date.now(), remaining: duration });
}

function pauseToast(id: string) {
  const timer = timers.get(id);
  if (!timer) return;
  clearTimeout(timer.timeoutId);
  const elapsed = Date.now() - timer.startedAt;
  timers.set(id, { ...timer, remaining: Math.max(0, timer.remaining - elapsed) });
}

function resumeToast(id: string) {
  const timer = timers.get(id);
  if (!timer || timer.remaining <= 0) return;
  const timeoutId = setTimeout(() => {
    timers.delete(id);
    triggerExit(id);
  }, timer.remaining);
  timers.set(id, { ...timer, timeoutId, startedAt: Date.now() });
}

function cancelToast(id: string) {
  const timer = timers.get(id);
  if (timer) { clearTimeout(timer.timeoutId); timers.delete(id); }
}

watch(
  toasts,
  (next, prev) => {
    // Cancel timers for toasts no longer in store
    const nextIds = new Set(next.map((t) => t.id));
    for (const [id] of timers) {
      if (!nextIds.has(id)) cancelToast(id);
    }

    // Schedule new / updated toasts
    for (const toast of next) {
      const prevToast = prev?.find((t) => t.id === toast.id);
      if (!prevToast || prevToast.instanceId !== toast.instanceId) {
        cancelToast(toast.id);
        scheduleToast(toast);
      } else if (!timers.has(toast.id)) {
        scheduleToast(toast);
      }
    }
  },
  { deep: false }
);

// Mouse / hover delegation

function handleMouseEnter(id: string) {
  pauseToast(id);
  toastRefs.value[id]?.onMouseEnter();
}

function handleMouseLeave(id: string) {
  resumeToast(id);
  toastRefs.value[id]?.onMouseLeave();
}

function handleDismiss(id: string) {
  cancelToast(id);
  triggerExit(id);
}

// Position grouping

const activePositions = computed(() => {
  const groups = new Map<SileoPosition, SileoItem[]>();
  for (const pos of SILEO_POSITIONS) groups.set(pos, []);

  for (const toast of toasts.value) {
    const pos = (toast.position ?? props.position ?? DEFAULT_POSITION) as SileoPosition;
    groups.get(pos)!.push(toast);
  }

  return Array.from(groups.entries()).filter(([, items]) => items.length > 0);
});

// Viewport style

function resolveOffset(side: "top" | "right" | "bottom" | "left"): string {
  const o = props.offset;
  if (o == null) return "16px";
  if (typeof o === "number") return `${o}px`;
  if (typeof o === "string") return o;
  const val = o[side];
  if (val == null) return "16px";
  return typeof val === "number" ? `${val}px` : val;
}

function getViewportStyle(pos: SileoPosition): Record<string, string> {
  const style: Record<string, string> = {};
  if (pos.includes("top")) style.top = resolveOffset("top");
  if (pos.includes("bottom")) style.bottom = resolveOffset("bottom");
  if (pos.includes("left")) style.left = resolveOffset("left");
  if (pos.includes("right")) style.right = resolveOffset("right");
  if (pos.includes("center")) {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }
  return style;
}

// Cleanup

onUnmounted(() => {
  for (const [, timer] of timers) clearTimeout(timer.timeoutId);
  timers.clear();
});
</script>

<template>
  <slot />

  <section
    v-for="[pos, items] in activePositions"
    :key="pos"
    data-sileo-viewport
    :data-position="pos"
    :data-theme="resolvedTheme"
    :data-debug="props.debug ? 'true' : undefined"
    aria-label="Notifications"
    role="region"
    :style="getViewportStyle(pos)"
  >
    <SileoToast
      v-for="toast in items"
      :key="toast.id"
      :ref="(el) => {
        if (el) toastRefs[toast.id] = el as InstanceType<typeof SileoToast>;
        else delete toastRefs[toast.id];
      }"
      :toast="toast"
      :position="pillAlign(pos)"
      :expand="expandDir(pos)"
      :fill="toast.fill ?? defaultFill"
      :exiting="exitingIds.has(toast.id)"
      :debug="props.debug"
      @mouseenter="handleMouseEnter(toast.id)"
      @mouseleave="handleMouseLeave(toast.id)"
      @dismiss="handleDismiss(toast.id)"
    />
  </section>
</template>
