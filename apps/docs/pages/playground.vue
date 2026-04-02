<script setup lang="ts">
useHead({ title: "Playground — sileo-vue" });
</script>

<template>
  <div class="page">
    <AppHeader />

    <main class="main">
      <div class="body">

        <!-- Left: hero only, compact -->
        <div class="left">
          <p class="eyebrow">Vue 3 · MIT License</p>
          <h1 class="title">
            Physics-based<br />
            <em>toast notifications</em>
          </h1>
          <p class="subtitle">
            Gooey SVG morphing, spring physics, zero config.
            A Vue 3 port of <strong>sileo</strong>.
          </p>
          <div class="links">
            <NuxtLink to="/docs/getting-started" class="link">Docs →</NuxtLink>
            <a href="https://github.com/hiaaryan/sileo" target="_blank" rel="noopener" class="link">GitHub ↗</a>
          </div>
        </div>

        <!-- Right: controls -->
        <aside class="right">
          <PlaygroundControls />
        </aside>

      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
}

.body {
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 48px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 64px;
  align-items: center;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.eyebrow {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--fg-3);
  margin: 0 0 14px;
  font-family: 'Geist Mono', monospace;
}

.title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(32px, 3.8vw, 56px);
  font-weight: 400;
  line-height: 1.06;
  letter-spacing: -0.02em;
  margin: 0 0 18px;
  color: var(--fg);
}
.title em { font-style: italic; color: var(--fg-2); }

.subtitle {
  font-size: 14px;
  line-height: 1.6;
  color: var(--fg-2);
  margin: 0 0 24px;
  max-width: 380px;
}
.subtitle strong { color: var(--fg); font-weight: 600; }

.links {
  display: flex;
  gap: 20px;
}

.link {
  font-size: 12.5px;
  font-family: 'Geist Mono', monospace;
  color: var(--fg-3);
  transition: color 150ms;
  text-decoration: none;
}
.link:hover { color: var(--fg-2); }

.right {
  height: calc(100dvh - 56px);
  overflow-y: auto;
  padding: 32px 0;
  /* hide scrollbar but keep scroll */
  scrollbar-width: none;
}
.right::-webkit-scrollbar { display: none; }

@media (max-width: 860px) {
  .page { height: auto; overflow: auto; }
  .main { align-items: flex-start; }
  .body {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 32px 20px 60px;
  }
  .right {
    height: auto;
    overflow: visible;
    padding: 0;
  }
  .title { font-size: clamp(32px, 8vw, 48px); }
}
</style>
