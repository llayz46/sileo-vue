<script setup lang="ts">
const { theme, toggle } = useTheme();
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink to="/" class="logo">
        <span class="logo-dot" />
        sileo-vue
      </NuxtLink>

      <nav class="nav">
        <NuxtLink to="/docs/getting-started" class="nav-link">Docs</NuxtLink>
        <NuxtLink to="/playground" class="nav-link">Playground</NuxtLink>
        <a
          href="https://github.com/hiaaryan/sileo"
          target="_blank"
          rel="noopener"
          class="nav-link"
        >GitHub ↗</a>
        <button class="theme-btn" @click="toggle">
          <span v-if="theme === 'dark'">☀ Light</span>
          <span v-else>◑ Dark</span>
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  transition: background 200ms ease;
}

.header-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 48px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Geist Mono', monospace;
  letter-spacing: -0.02em;
  color: var(--fg);
  text-decoration: none;
}

.logo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--fg);
  flex-shrink: 0;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-2);
  padding: 5px 10px;
  border-radius: 6px;
  transition: color 150ms, background 150ms;
  text-decoration: none;
}
.nav-link:hover {
  color: var(--fg);
  background: var(--bg-2);
}
.nav-link.router-link-active {
  color: var(--fg);
}

.theme-btn {
  margin-left: 8px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 150ms, border-color 150ms, color 150ms;
}
.theme-btn:hover {
  background: var(--bg-2);
  color: var(--fg);
}

@media (max-width: 640px) {
  .header-inner {
    padding: 0 20px;
  }
  .nav-link:not(.theme-btn) {
    display: none;
  }
}
</style>
