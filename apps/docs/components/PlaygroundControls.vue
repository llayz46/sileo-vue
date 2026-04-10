<script setup lang="ts">
import { sileo } from "@llayz46/sileo-vue";
import type { SileoPosition } from "@llayz46/sileo-vue";

const position = ref<SileoPosition>("top-right");
const activeVariant = ref<string | null>(null);

const positions: SileoPosition[] = [
  "top-left", "top-center", "top-right",
  "bottom-left", "bottom-center", "bottom-right",
];

function doSuccess() {
  activeVariant.value = "success";
  sileo.success({ title: "Changes saved", position: position.value });
}
function doError() {
  activeVariant.value = "error";
  sileo.error({
    title: "Upload failed",
    description: "The file exceeds the 10 MB limit. Try compressing it first.",
    position: position.value,
  });
}
function doWarning() {
  activeVariant.value = "warning";
  sileo.warning({
    title: "Storage at 90%",
    description: "You're running low on disk space. Archive old projects.",
    position: position.value,
  });
}
function doInfo() {
  activeVariant.value = "info";
  sileo.info({
    title: "Version 2.4 available",
    description: "New features include dark mode and custom positions.",
    position: position.value,
  });
}
function doLoading() {
  activeVariant.value = "loading";
  sileo.loading({ title: "Syncing your workspace…", position: position.value });
}
function doAction() {
  activeVariant.value = "action";
  sileo.action({
    title: "File deleted",
    description: "report-2024.pdf was moved to trash.",
    button: { title: "Undo", onClick: () => sileo.success({ title: "Restored", position: position.value }) },
    position: position.value,
  });
}
function doShow() {
  activeVariant.value = "show";
  sileo.show({ title: "Shortcut ⌘K activated", position: position.value });
}
function doPromise() {
  activeVariant.value = "promise";
  const p = new Promise<{ name: string; plan: string }>((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.35
        ? resolve({ name: "Léa Dupont", plan: "Pro" })
        : reject(new Error("Session expired"));
    }, 2200);
  });
  sileo.promise(p, {
    loading: { title: "Authenticating…", position: position.value },
    success: (d: { name: string; plan: string }) => ({
      title: `Welcome back, ${d.name}`,
      description: `${d.plan} plan · Connected`,
      position: position.value,
    }),
    error: (e: unknown) => ({
      title: "Authentication failed",
      description: e instanceof Error ? e.message : "Please try again.",
      position: position.value,
    }),
  });
}
function doDark() {
  activeVariant.value = "dark";
  sileo.success({
    title: "Dark fill toast",
    description: "Custom fill with style overrides for dark surfaces.",
    fill: "#18181b",
    styles: { title: "sileo-dark-title", description: "sileo-dark-desc" },
    position: position.value,
  });
}
function doPersistent() {
  activeVariant.value = "persistent";
  sileo.warning({
    title: "Unsaved changes",
    description: "Leave the page? Your edits won't be saved.",
    duration: null,
    id: "persistent-warning",
    button: { title: "Stay", onClick: () => sileo.dismiss("persistent-warning") },
    position: position.value,
  });
}
function doStateTransition() {
  activeVariant.value = "transition";
  const id = "state-demo";
  sileo.loading({ title: "Processing payment…", id, duration: null, position: position.value });
  setTimeout(() => {
    sileo.success({
      title: "Payment accepted",
      description: "€49.00 charged to Visa ···· 4242",
      id,
      position: position.value,
    });
  }, 2500);
}
function dismissAll() {
  sileo.clear();
  activeVariant.value = null;
}

const variants = [
  { key: "success",    label: "Success",    hint: "Changes saved",          color: "var(--c-success)",  fn: doSuccess },
  { key: "error",      label: "Error",      hint: "Upload failed",          color: "var(--c-error)",    fn: doError },
  { key: "warning",    label: "Warning",    hint: "Storage at 90%",         color: "var(--c-warning)",  fn: doWarning },
  { key: "info",       label: "Info",       hint: "Version 2.4 available",  color: "var(--c-info)",     fn: doInfo },
  { key: "loading",    label: "Loading",    hint: "Syncing workspace…",     color: "var(--c-neutral)",  fn: doLoading },
  { key: "action",     label: "Action",     hint: "File deleted + Undo",    color: "var(--c-neutral)",  fn: doAction },
  { key: "show",       label: "Show",       hint: "Shortcut ⌘K activated",  color: "var(--c-neutral)",  fn: doShow },
  { key: "promise",    label: "Promise",    hint: "Async · success or fail", color: "var(--c-info)",    fn: doPromise },
  { key: "dark",       label: "Dark fill",  hint: "Custom #18181b fill",    color: "#71717a",           fn: doDark },
  { key: "persistent", label: "Persistent", hint: "Stays until dismissed",  color: "var(--c-warning)",  fn: doPersistent },
  { key: "transition", label: "State →",    hint: "Loading → Success",      color: "var(--c-success)",  fn: doStateTransition },
];
</script>

<template>
  <div class="controls">

    <!-- Position -->
    <section>
      <p class="section-label">Position</p>
      <div class="position-grid">
        <button
          v-for="pos in positions"
          :key="pos"
          class="pos-btn"
          :class="{ active: position === pos }"
          @click="position = pos"
        >{{ pos }}</button>
      </div>
    </section>

    <!-- Variants -->
    <section>
      <p class="section-label">Variants</p>
      <div class="variant-list">
        <button
          v-for="v in variants"
          :key="v.key"
          class="variant-row"
          :class="{ active: activeVariant === v.key }"
          :style="{ '--accent': v.color }"
          @click="v.fn()"
        >
          <span class="vr-pip" />
          <span class="vr-body">
            <span class="vr-label">{{ v.label }}</span>
            <span class="vr-hint">{{ v.hint }}</span>
          </span>
          <span class="vr-arrow">→</span>
        </button>

        <button class="variant-row variant-row--dismiss" @click="dismissAll">
          <span class="vr-pip vr-pip--dismiss" />
          <span class="vr-body">
            <span class="vr-label vr-label--dismiss">Dismiss all</span>
          </span>
          <span class="vr-arrow">✕</span>
        </button>
      </div>
    </section>

  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-label {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
  margin: 0 0 12px;
  font-family: 'Geist Mono', monospace;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.pos-btn {
  padding: 6px 8px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg-3);
  font-size: 10.5px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Geist Mono', monospace;
  transition: background 100ms, color 100ms, border-color 100ms;
  text-align: center;
}
.pos-btn:hover { background: var(--bg-2); color: var(--fg-2); }
.pos-btn.active {
  background: var(--fg);
  color: var(--bg);
  border-color: var(--fg);
}

.variant-list {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.variant-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  position: relative;
  text-align: left;
  transition: background 100ms;
}
.variant-row:last-child { border-bottom: none; }

.variant-row:hover { background: var(--bg-2); }
.variant-row.active {
  background: color-mix(in oklch, var(--accent, var(--fg)) 6%, var(--bg));
}

/* Colored pip */
.vr-pip {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent, var(--fg-3));
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 100ms, transform 100ms;
}
.variant-row:hover .vr-pip,
.variant-row.active .vr-pip {
  opacity: 1;
  transform: scale(1.15);
}
.vr-pip--dismiss {
  background: var(--fg-3);
  opacity: 0.3;
}

/* Text body */
.vr-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.vr-label {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-size: 15px;
  color: var(--fg);
  line-height: 1.2;
  letter-spacing: -0.01em;
}
.vr-label--dismiss {
  font-family: 'Geist Mono', monospace;
  font-style: normal;
  font-size: 11px;
  color: var(--fg-3);
  letter-spacing: 0.02em;
}

.vr-hint {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  color: var(--fg-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.01em;
  line-height: 1.3;
}

.vr-arrow {
  font-size: 11px;
  color: var(--fg-3);
  flex-shrink: 0;
  font-family: 'Geist Mono', monospace;
  transition: color 100ms, transform 120ms;
}
.variant-row:hover .vr-arrow { color: var(--fg-2); transform: translateX(2px); }
.variant-row--dismiss:hover .vr-arrow { transform: none; }
</style>
