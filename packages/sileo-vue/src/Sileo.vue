<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  h,
  type VNode,
} from "vue";
import { animate } from "motion";
import type { SileoItem } from "./types";
import {
  SPRING,
  BLUR_RATIO,
  HEIGHT,
  WIDTH,
  PILL_PADDING,
  MIN_EXPAND_RATIO,
  DEFAULT_ROUNDNESS,
  SWAP_COLLAPSE_MS,
  HEADER_EXIT_MS,
  DURATION_MS,
} from "./constants";
import { Check, X, AlertTriangle, Info, LoaderCircle, Zap } from "./icons";

// Props & Emits

const props = defineProps<{
  toast: SileoItem;
  /** Horizontal alignment within the 350px SVG canvas */
  position: "left" | "center" | "right";
  /** Direction the body expands: bottom (top-* viewports) or top (bottom-* viewports) */
  expand: "top" | "bottom";
  /** Pill fill colour, resolved from theme + toast.fill */
  fill: string;
  /** True when dismiss has been requested and exit animation should play */
  exiting: boolean;
  /** Enables debug overlays and outlines */
  debug?: boolean;
}>();

const emit = defineEmits<{
  dismiss: [];
}>();

// Header layer (replaces Vue <Transition> — mirrors React headerLayer)

interface HeaderView {
  key: string;
  state: SileoItem["state"];
  title: string | undefined;
  icon: SileoItem["icon"];
  styles: SileoItem["styles"];
}

function makeHeaderView(item: SileoItem): HeaderView {
  return {
    key: `${item.state}-${item.title}`,
    state: item.state,
    title: item.title,
    icon: item.icon,
    styles: item.styles,
  };
}

interface HeaderLayer {
  current: HeaderView;
  prev: HeaderView | null;
}

const headerLayer = ref<HeaderLayer>({
  current: makeHeaderView(props.toast),
  prev: null,
});

let headerExitTimer: ReturnType<typeof setTimeout> | null = null;

function updateHeaderLayer(item: SileoItem) {
  const key = `${item.state}-${item.title}`;
  if (headerLayer.value.current.key === key) {
    // Same key — just update the view data (no crossfade needed)
    const updated = makeHeaderView(item);
    headerLayer.value = { ...headerLayer.value, current: updated };
    return;
  }
  if (headerExitTimer) {
    clearTimeout(headerExitTimer);
    headerExitTimer = null;
  }
  headerLayer.value = {
    prev: headerLayer.value.current,
    current: makeHeaderView(item),
  };
  headerExitTimer = setTimeout(() => {
    headerExitTimer = null;
    headerLayer.value = { ...headerLayer.value, prev: null };
  }, HEADER_EXIT_MS);
}

// Reactive state

/** Currently displayed toast data (may lag props.toast during collapse/swap) */
const view = ref<SileoItem>({ ...props.toast });
const isExpanded = ref(false);
const ready = ref(false);
const contentVisible = ref(false);

/** Pill width measured from headerInnerRef.scrollWidth */
const pillWidth = ref(0);
/** Content (description + button) height measured from descriptionRef.scrollHeight */
const contentHeight = ref(0);

// Pending swap during collapse animation
let pendingUpdate: SileoItem | null = null;
let swapTimer: ReturnType<typeof setTimeout> | null = null;
let contentVisibilityTimer: ReturnType<typeof setTimeout> | null = null;

// DOM refs

const headerRef = ref<HTMLElement | null>(null);
/** The [data-sileo-header-inner][data-layer="current"] div — used for pill width measurement */
const headerInnerRef = ref<HTMLElement | null>(null);
const headerMeasureRef = ref<HTMLElement | null>(null);
/** The [data-sileo-description] div — used for content height measurement */
const descriptionRef = ref<HTMLElement | null>(null);
const pillRectRef = ref<SVGRectElement | null>(null);
const bodyRectRef = ref<SVGRectElement | null>(null);

/** Cached header padding (left + right), computed once from CSS */
let cachedHeaderPad: number | null = null;

// Derived / Computed

const roundness = computed(() => Math.max(0, view.value.roundness ?? DEFAULT_ROUNDNESS));
const blur = computed(() => roundness.value * BLUR_RATIO);
const filterId = computed(() => `sileo-gooey-${props.toast.id}`);

/** React: `Boolean(view.description) || Boolean(view.button)` */
const hasDesc = computed(() => !!view.value.description || !!view.value.button);

const isLoading = computed(() => view.value.state === "loading");

/** React: `open = hasDesc && isExpanded && !isLoading` */
const open = computed(() => hasDesc.value && isExpanded.value && !isLoading.value);

/** React: `resolvedPillWidth = Math.max(pillWidth || HEIGHT, HEIGHT)` */
const resolvedPillWidth = computed(() => Math.max(pillWidth.value || HEIGHT, HEIGHT));

// Expanded height constants/values
const minExpanded = HEIGHT * MIN_EXPAND_RATIO; // 40 * 2.25 = 90
const rawExpanded = computed(() =>
  hasDesc.value ? Math.max(minExpanded, HEIGHT + contentHeight.value) : minExpanded
);

/**
 * frozenExpanded: only updates when open=true.
 * Prevents the SVG canvas from shrinking while the collapse animation plays.
 */
const frozenExpanded = ref(rawExpanded.value);
watch(open, (isOpen) => {
  if (isOpen) frozenExpanded.value = rawExpanded.value;
});
watch(rawExpanded, (val) => {
  if (open.value) frozenExpanded.value = val;
});

watch(
  open,
  (isOpen) => {
    if (contentVisibilityTimer) {
      clearTimeout(contentVisibilityTimer);
      contentVisibilityTimer = null;
    }
    if (isOpen) {
      contentVisible.value = true;
      return;
    }
    contentVisibilityTimer = setTimeout(() => {
      contentVisibilityTimer = null;
      contentVisible.value = false;
    }, Math.round(DURATION_MS * 0.22));
  },
  { immediate: true }
);

const expanded = computed(() => (open.value ? rawExpanded.value : frozenExpanded.value));
const svgHeight = computed(() => (hasDesc.value ? Math.max(expanded.value, minExpanded) : HEIGHT));
const expandedContent = computed(() => Math.max(0, expanded.value - HEIGHT));

/** React: left=0, center=(W-w)/2, right=W-w — NO PILL_PADDING offset */
const pillX = computed(() => {
  if (props.position === "right") return WIDTH - resolvedPillWidth.value;
  if (props.position === "center") return (WIDTH - resolvedPillWidth.value) / 2;
  return 0;
});

/** Pill grows taller when open, creating gooey overlap with body rect */
const pillHeight = computed(() => HEIGHT + blur.value * 3);

/** CSS custom properties on the toast root element */
const rootStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = {
    "--_h": `${open.value ? expanded.value : HEIGHT}px`,
    "--_pw": `${resolvedPillWidth.value}px`,
    "--_px": `${pillX.value}px`,
    "--_ht": `translateY(${open.value ? (props.expand === "bottom" ? 3 : -3) : 0}px) scale(${open.value ? 0.9 : 1})`,
    "--_co": `${open.value ? 1 : 0}`,
  };
  if (isSwiping.value) {
    const SWIPE_MAX = 20;
    const sign = swipeY.value > 0 ? 1 : -1;
    const clamped = Math.min(Math.abs(swipeY.value), SWIPE_MAX) * sign;
    style.transform = `translateY(${clamped}px)`;
  }
  return style;
});

/** Filter applied to the canvas div (NOT the SVG element) */
const canvasStyle = computed(() => ({
  filter: `url(#${filterId.value})`,
}));
const debugMeta = computed(() =>
  [
    `pos=${props.position}`,
    `x=${Math.round(pillX.value)}`,
    `pw=${Math.round(resolvedPillWidth.value)}`,
    `isw=${Math.round(headerInnerRef.value?.scrollWidth ?? 0)}`,
    `msw=${Math.round(headerMeasureRef.value?.scrollWidth ?? 0)}`,
    `pad=${Math.round(cachedHeaderPad ?? 0)}`,
    `ch=${Math.round(contentHeight.value)}`,
    `eh=${Math.round(expandedContent.value)}`,
    `open=${open.value ? 1 : 0}`,
  ].join(" ")
);

// SVG spring animations

let pillRaf = 0;
let bodyRaf = 0;

function applyPillImmediate() {
  const el = pillRectRef.value;
  if (!el) return;
  el.setAttribute("x", String(pillX.value));
  el.setAttribute("y", "0");
  el.setAttribute("width", String(resolvedPillWidth.value));
  el.setAttribute("height", String(open.value ? pillHeight.value : HEIGHT));
  el.setAttribute("rx", String(roundness.value));
  el.setAttribute("ry", String(roundness.value));
}

function applyBodyImmediate() {
  const el = bodyRectRef.value;
  if (!el) return;
  el.setAttribute("height", String(open.value ? expandedContent.value : 0));
  el.setAttribute("opacity", open.value ? "1" : "0");
}

function animatePill() {
  cancelAnimationFrame(pillRaf);
  pillRaf = requestAnimationFrame(() => {
    const el = pillRectRef.value;
    if (!el) return;
    el.setAttribute("x", String(pillX.value));
    el.setAttribute("width", String(resolvedPillWidth.value));
    el.setAttribute("rx", String(roundness.value));
    el.setAttribute("ry", String(roundness.value));
    animate(el, { height: open.value ? pillHeight.value : HEIGHT }, SPRING);
  });
}

function animateBody() {
  cancelAnimationFrame(bodyRaf);
  bodyRaf = requestAnimationFrame(() => {
    const el = bodyRectRef.value;
    if (!el) return;
    const spring = open.value ? SPRING : { ...SPRING, bounce: 0 };
    animate(
      el,
      { height: open.value ? expandedContent.value : 0, opacity: open.value ? 1 : 0 },
      spring
    );
  });
}

// Measurements (ResizeObserver)

let pillRo: ResizeObserver | null = null;
let pillRoRaf = 0;
let contentRo: ResizeObserver | null = null;
let contentRoRaf = 0;

function measurePill() {
  const inner = headerMeasureRef.value ?? headerInnerRef.value;
  const header = headerRef.value;
  if (!inner || !header) return;
  if (cachedHeaderPad === null) {
    const cs = getComputedStyle(header);
    cachedHeaderPad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  }
  const w = inner.scrollWidth + cachedHeaderPad + PILL_PADDING;
  if (w > PILL_PADDING) pillWidth.value = w;
}

function measureContent() {
  const el = descriptionRef.value;
  if (!el) return;
  contentHeight.value = el.scrollHeight;
}

function setupPillObserver() {
  pillRo?.disconnect();
  const inner = headerMeasureRef.value ?? headerInnerRef.value;
  if (!inner) return;
  pillRo = new ResizeObserver(() => {
    cancelAnimationFrame(pillRoRaf);
    pillRoRaf = requestAnimationFrame(measurePill);
  });
  pillRo.observe(inner);
  measurePill();
}

function setupContentObserver() {
  contentRo?.disconnect();
  const el = descriptionRef.value;
  if (!el) return;
  contentRo = new ResizeObserver(() => {
    cancelAnimationFrame(contentRoRaf);
    contentRoRaf = requestAnimationFrame(measureContent);
  });
  contentRo.observe(el);
  measureContent();
}

// Autopilot (auto expand → collapse)

let apExpandTimer: ReturnType<typeof setTimeout> | null = null;
let apCollapseTimer: ReturnType<typeof setTimeout> | null = null;

function clearAutopilot() {
  if (apExpandTimer) { clearTimeout(apExpandTimer); apExpandTimer = null; }
  if (apCollapseTimer) { clearTimeout(apCollapseTimer); apCollapseTimer = null; }
}

function startAutopilot() {
  clearAutopilot();
  if (!hasDesc.value || props.exiting) return;
  const ap = view.value.autopilot;
  if (!ap || typeof ap !== "object") return;

  const expandDelay = ap.expand ?? 0;
  const collapseDelay = ap.collapse ?? 0;

  const doExpand = () => {
    isExpanded.value = true;
    if (collapseDelay > 0) {
      apCollapseTimer = setTimeout(() => {
        apCollapseTimer = null;
        isExpanded.value = false;
      }, collapseDelay);
    }
  };

  if (expandDelay > 0) {
    apExpandTimer = setTimeout(() => {
      apExpandTimer = null;
      doExpand();
    }, expandDelay);
  } else {
    doExpand();
  }
}

// Hover

function onMouseEnter() {
  if (hasDesc.value) isExpanded.value = true;
}

function onMouseLeave() {
  isExpanded.value = false;
}

defineExpose({ onMouseEnter, onMouseLeave });

// Swipe to dismiss

let pointerStart: number | null = null;
const isSwiping = ref(false);
const swipeY = ref(0);
const SWIPE_DISMISS = 30;

function onPointerDown(e: PointerEvent) {
  if (props.exiting) return;
  const target = e.target as HTMLElement;
  if (target.closest("[data-sileo-button]")) return;
  pointerStart = e.clientY;
  isSwiping.value = true;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (pointerStart === null) return;
  swipeY.value = e.clientY - pointerStart;
}

function onPointerUp(e: PointerEvent) {
  if (pointerStart === null) return;
  const dy = e.clientY - pointerStart;
  pointerStart = null;
  isSwiping.value = false;
  swipeY.value = 0;
  if (Math.abs(dy) > SWIPE_DISMISS) emit("dismiss");
}

// View update — prop watcher

watch(
  () => props.toast,
  (next) => {
    // Always sync fill immediately
    if (next.fill !== view.value.fill) {
      view.value = { ...view.value, fill: next.fill };
    }

    // Sync header layer for any key change
    const nextKey = `${next.state}-${next.title}`;
    const currKey = `${view.value.state}-${view.value.title}`;
    if (nextKey !== currKey) updateHeaderLayer(next);

    // Content refresh on instanceId change
    if (next.instanceId === view.value.instanceId) return;

    if (open.value) {
      if (swapTimer) { clearTimeout(swapTimer); swapTimer = null; }
      pendingUpdate = { ...next };
      isExpanded.value = false;
      swapTimer = setTimeout(() => {
        swapTimer = null;
        const pending = pendingUpdate;
        if (!pending) return;
        pendingUpdate = null;
        view.value = { ...pending };
        updateHeaderLayer(pending);
        startAutopilot();
      }, SWAP_COLLAPSE_MS);
    } else {
      pendingUpdate = null;
      view.value = { ...next };
      updateHeaderLayer(next);
      startAutopilot();
    }
  },
  { deep: true }
);

// Watchers → SVG animations

// Animate when geometry-affecting values change
watch(
  [open, () => pillX.value, () => resolvedPillWidth.value, () => expandedContent.value],
  () => {
    if (!ready.value) {
      applyPillImmediate();
      applyBodyImmediate();
      return;
    }
    animatePill();
    animateBody();
  }
);

// Re-setup pill measurement when header key changes (new element rendered)
watch(
  () => headerLayer.value.current.key,
  () => {
    cachedHeaderPad = null;
    nextTick(() => setupPillObserver());
  }
);

// Setup / teardown content observer when hasDesc changes
watch(hasDesc, (has) => {
  if (has) nextTick(() => setupContentObserver());
  else {
    contentRo?.disconnect();
    contentHeight.value = 0;
  }
});

// Lifecycle

onMounted(() => {
  nextTick(() => {
    setupPillObserver();
    if (hasDesc.value) setupContentObserver();
    applyPillImmediate();
    applyBodyImmediate();
    // Double-rAF: ensures opacity:0 is painted before the CSS transition fires
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ready.value = true;
        startAutopilot();
      });
    });
  });
});

onUnmounted(() => {
  clearAutopilot();
  if (headerExitTimer) { clearTimeout(headerExitTimer); headerExitTimer = null; }
  if (swapTimer) { clearTimeout(swapTimer); swapTimer = null; }
  if (contentVisibilityTimer) { clearTimeout(contentVisibilityTimer); contentVisibilityTimer = null; }
  pillRo?.disconnect();
  contentRo?.disconnect();
  cancelAnimationFrame(pillRoRaf);
  cancelAnimationFrame(contentRoRaf);
  cancelAnimationFrame(pillRaf);
  cancelAnimationFrame(bodyRaf);
});

// Icon resolver

const STATE_ICONS: Partial<Record<SileoItem["state"], () => VNode>> = {
  success: () => h(Check),
  error: () => h(X),
  warning: () => h(AlertTriangle),
  info: () => h(Info),
  loading: () => h(LoaderCircle, { spin: true }),
  action: () => h(Zap),
};

function resolveIcon(v: HeaderView): VNode | null {
  if (v.icon === null) return null;
  if (v.icon !== undefined) {
    if (typeof v.icon === "string") return h("span", v.icon);
    return v.icon as VNode;
  }
  const fn = STATE_ICONS[v.state];
  return fn ? fn() : null;
}
</script>

<template>
  <div
    data-sileo-toast
    :data-state="view.state"
    :data-edge="expand"
    :data-position="position"
    :data-expanded="open"
    :data-ready="ready ? 'true' : 'false'"
    :data-exiting="exiting ? 'true' : undefined"
    :data-debug="debug ? 'true' : undefined"
    :data-debug-meta="debug ? debugMeta : undefined"
    :style="rootStyle"
    role="alert"
    aria-live="polite"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <!--
      SVG Canvas: filter applied on the DIV (not the SVG element).
      data-edge="bottom" → top:0 (canvas starts at top, body expands downward).
      data-edge="top"    → bottom:0 + scaleY(-1) (canvas anchored to bottom, expands upward visually).
    -->
    <div data-sileo-canvas :data-edge="expand" :style="canvasStyle">
      <svg
        data-sileo-svg
        :width="WIDTH"
        :height="svgHeight"
        :viewBox="`0 0 ${WIDTH} ${svgHeight}`"
      >
        <title>Sileo Notification</title>
        <defs>
          <!--
            Percentage-based filter region ensures the blur bleed fits regardless of SVG size.
            stdDeviation = roundness * BLUR_RATIO (e.g. 16 * 0.5 = 8).
            feColorMatrix alpha threshold creates the hard gooey edge.
          -->
          <filter
            :id="filterId"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            color-interpolation-filters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" :stdDeviation="blur" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>

        <!--
          Pill rect: x, width, height are animated via motion.animate().
          Initial attrs (0,0,0,0) are overwritten by applyPillImmediate() on mount.
          Pill height = HEIGHT when collapsed, HEIGHT + blur*3 when open (gooey overlap).
        -->
        <rect
          ref="pillRectRef"
          data-sileo-pill
          :fill="fill"
          :stroke="debug ? '#2563eb' : undefined"
          :stroke-width="debug ? 2 : undefined"
          x="0" y="0" width="0" height="0"
        />

        <!--
          Body rect: y and width are FIXED (y=HEIGHT, width=WIDTH — full canvas width).
          Only height and opacity are animated via motion.animate().
          rx/ry stay constant (Vue binding).
        -->
        <!--
          Body rect: y, width, rx, ry are STATIC (Vue bindings, never animated).
          Only height is spring-animated via motion. opacity is toggled via setAttribute.
          This mirrors React's motion.rect where static props ≠ animated props.
        -->
        <rect
          ref="bodyRectRef"
          data-sileo-body
          :fill="fill"
          :stroke="debug ? '#f97316' : undefined"
          :stroke-width="debug ? 2 : undefined"
          x="0"
          :y="HEIGHT"
          :width="WIDTH"
          :rx="roundness"
          :ry="roundness"
          height="0"
          opacity="0"
        />
      </svg>
    </div>

    <!--
      Header: data-edge positions it at top:0 (bottom viewport) or bottom:0 (top viewport).
      left = var(--_px), max-width = var(--_pw), transform = var(--_ht) via CSS.
    -->
    <div ref="headerRef" data-sileo-header :data-edge="expand">
      <div data-sileo-header-stack>
        <!--
          Current layer: CSS animation sileo-header-enter fires on mount/key change.
          ref="headerInnerRef" — pill width is measured from this element's scrollWidth.
        -->
        <div
          ref="headerInnerRef"
          data-sileo-header-inner
          data-layer="current"
          :key="headerLayer.current.key"
        >
          <div
            data-sileo-badge
            :data-state="headerLayer.current.state"
            :class="headerLayer.current.styles?.badge"
          >
            <component :is="() => resolveIcon(headerLayer.current)" />
          </div>
          <span
            data-sileo-title
            :data-state="headerLayer.current.state"
            :class="headerLayer.current.styles?.title"
          >
            {{ headerLayer.current.title }}
          </span>
        </div>

        <!-- Previous layer: fades out via CSS animation sileo-header-exit -->
        <div
          v-if="headerLayer.prev"
          :key="headerLayer.prev.key"
          data-sileo-header-inner
          data-layer="prev"
          data-exiting="true"
        >
          <div
            data-sileo-badge
            :data-state="headerLayer.prev.state"
            :class="headerLayer.prev.styles?.badge"
          >
            <component :is="() => resolveIcon(headerLayer.prev!)" />
          </div>
          <span
            data-sileo-title
            :data-state="headerLayer.prev.state"
            :class="headerLayer.prev.styles?.title"
          >
            {{ headerLayer.prev.title }}
          </span>
        </div>
      </div>
    </div>

    <div ref="headerMeasureRef" data-sileo-header-measure aria-hidden="true">
      <div data-sileo-header-inner data-layer="current">
        <div
          data-sileo-badge
          :data-state="headerLayer.current.state"
          :class="headerLayer.current.styles?.badge"
        >
          <component :is="() => resolveIcon(headerLayer.current)" />
        </div>
        <span
          data-sileo-title
          :data-state="headerLayer.current.state"
          :class="headerLayer.current.styles?.title"
        >
          {{ headerLayer.current.title }}
        </span>
      </div>
    </div>

    <!--
      Content: shown when hasDesc.
      opacity controlled by CSS var --_co (0 or 1) on the root.
      data-visible="true" enables pointer-events + uses slower fade-in transition.
      contentRef on [data-sileo-description] — scrollHeight used for body expand height.
    -->
    <div
      v-if="hasDesc"
      data-sileo-content
      :data-edge="expand"
      :data-visible="contentVisible ? 'true' : 'false'"
    >
      <div
        ref="descriptionRef"
        data-sileo-description
        :class="view.styles?.description"
      >
        <template v-if="view.description">
          <component
            v-if="typeof view.description !== 'string'"
            :is="view.description"
          />
          <template v-else>{{ view.description }}</template>
        </template>

        <div
          v-if="view.button"
          data-sileo-button
          :data-state="view.state"
          :class="view.styles?.button"
          role="button"
          tabindex="0"
          @click.stop.prevent="view.button!.onClick()"
          @keydown.enter.stop.prevent="view.button!.onClick()"
          @keydown.space.stop.prevent="view.button!.onClick()"
        >
          {{ view.button.title }}
        </div>
      </div>
    </div>
  </div>
</template>
