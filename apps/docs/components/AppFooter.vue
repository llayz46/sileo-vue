<template>
  <footer class="footer">
    <div class="footer-inner">
      <span>sileo-vue · Vue 3 port · MIT</span>
      <span class="sep">·</span>
      <a href="https://sileo.aaryan.design" target="_blank" rel="noopener">sileo.aaryan.design ↗</a>
      <span class="sep">·</span>
      <a href="https://github.com/hiaaryan/sileo" target="_blank" rel="noopener">Original React ↗</a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.footer-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 20px 48px;
  font-size: 11.5px;
  color: var(--fg-3);
  font-family: 'Geist Mono', monospace;
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.sep { color: var(--border); }

a { color: var(--fg-3); transition: color 150ms; }
a:hover { color: var(--fg-2); }

@media (max-width: 640px) {
  .footer-inner { padding: 20px; }
}
</style>
