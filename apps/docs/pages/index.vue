<script setup lang="ts">
useHead({ title: "sileo-vue — Physics-based toast notifications for Vue 3" });
</script>

<template>
  <div class="page">
    <AppHeader />

    <main class="main">
      <div class="inner">

        <section class="hero">
          <p class="eyebrow">Vue 3 · MIT License</p>
          <h1 class="title">
            Physics-based<br />
            <em>toast notifications</em>
          </h1>
          <p class="subtitle">
            A faithful Vue port of <strong>sileo</strong> by aaryan.design —
            gooey SVG morphing, spring physics, zero config.
          </p>
          <div class="ctas">
            <NuxtLink to="/docs/getting-started" class="cta cta--primary">Get started →</NuxtLink>
            <NuxtLink to="/playground" class="cta cta--secondary">Playground</NuxtLink>
          </div>
        </section>

        <section class="snippet">
          <label class="label">Usage</label>
          <pre class="code"><code><span class="tok-kw">import</span> <span class="tok-brace">{ </span><span class="tok-id">Toaster</span><span class="tok-punct">,</span> <span class="tok-id">sileo</span> <span class="tok-brace">}</span> <span class="tok-kw">from</span> <span class="tok-str">"sileo-vue"</span>
<span class="tok-kw">import</span> <span class="tok-str">"sileo-vue/styles.css"</span>

<span class="tok-comment">// In your root component:</span>
<span class="tok-tag">&lt;Toaster</span> <span class="tok-attr">position</span><span class="tok-punct">=</span><span class="tok-str">"top-right"</span> <span class="tok-tag">/&gt;</span>

<span class="tok-comment">// From anywhere:</span>
<span class="tok-id">sileo</span><span class="tok-punct">.</span><span class="tok-fn">success</span><span class="tok-brace">({</span> <span class="tok-id">title</span><span class="tok-punct">:</span> <span class="tok-str">"Done!"</span><span class="tok-punct">,</span> <span class="tok-id">description</span><span class="tok-punct">:</span> <span class="tok-str">"All good."</span> <span class="tok-brace">})</span>
<span class="tok-id">sileo</span><span class="tok-punct">.</span><span class="tok-fn">promise</span><span class="tok-brace">(</span><span class="tok-id">fetchData</span><span class="tok-brace">()</span><span class="tok-punct">,</span> <span class="tok-brace">{ </span><span class="tok-id">loading</span><span class="tok-punct">,</span> <span class="tok-id">success</span><span class="tok-punct">,</span> <span class="tok-id">error</span> <span class="tok-brace">})</span></code></pre>
        </section>

      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  display: flex;
  align-items: center;
}

.inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 80px 48px;
  width: 100%;
}

.eyebrow {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
  margin: 0 0 16px;
  font-family: 'Geist Mono', monospace;
}

.title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(44px, 6vw, 80px);
  font-weight: 400;
  line-height: 1.04;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  color: var(--fg);
}
.title em {
  font-style: italic;
  color: var(--fg-2);
}

.subtitle {
  font-size: 16px;
  line-height: 1.65;
  color: var(--fg-2);
  margin: 0 0 36px;
  max-width: 520px;
}
.subtitle strong { color: var(--fg); font-weight: 600; }

.ctas {
  display: flex;
  gap: 12px;
  margin-bottom: 64px;
  flex-wrap: wrap;
}

.cta {
  display: inline-flex;
  align-items: center;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background 150ms, color 150ms, box-shadow 150ms;
}
.cta--primary {
  background: var(--fg);
  color: var(--bg);
}
.cta--primary:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
  color: var(--bg);
}
.cta--secondary {
  background: var(--bg-2);
  color: var(--fg-2);
  border: 1px solid var(--border);
}
.cta--secondary:hover {
  background: var(--bg-3);
  color: var(--fg);
}

.label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-3);
  margin-bottom: 10px;
  font-family: 'Geist Mono', monospace;
}

.snippet {
  max-width: 580px;
}

.code {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 20px;
  font-family: 'Geist Mono', 'Fira Code', monospace;
  font-size: 12.5px;
  line-height: 1.75;
  overflow-x: auto;
  margin: 0;
  color: var(--fg);
}

@media (max-width: 640px) {
  .inner { padding: 48px 20px; }
}
</style>
