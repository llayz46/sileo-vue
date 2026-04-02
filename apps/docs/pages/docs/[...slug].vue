<script setup lang="ts">
const route = useRoute();
const slug = computed(() => {
  const s = route.params.slug;
  return Array.isArray(s) ? s.join("/") : s;
});

const { data: page } = await useAsyncData(`docs-${slug.value}`, () =>
  queryCollection("docs").path(`/docs/${slug.value}`).first()
);

const { data: nav } = await useAsyncData("docs-nav", () =>
  queryCollectionNavigation("docs")
);

if (!page.value) {
  throw createError({ statusCode: 404, message: "Page not found" });
}

useHead({ title: `${page.value?.title ?? "Docs"} — sileo-vue` });
</script>

<template>
  <div class="page">
    <AppHeader />

    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <nav>
          <p class="sidebar-title">Documentation</p>
          <template v-if="nav">
            <NuxtLink
              v-for="item in nav[0]?.children ?? []"
              :key="item.path"
              :to="item.path"
              class="sidebar-link"
            >
              {{ item.title }}
            </NuxtLink>
          </template>
        </nav>
      </aside>

      <!-- Content -->
      <main class="content">
        <ContentRenderer v-if="page" :value="page" class="prose" />
      </main>
    </div>

    <AppFooter />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout {
  flex: 1;
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 48px 80px;
  width: 100%;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 64px;
  align-items: start;
}

/* Sidebar */
.sidebar {
  position: sticky;
  top: calc(56px + 32px);
  padding-top: 48px;
}

.sidebar-title {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-3);
  font-family: 'Geist Mono', monospace;
  margin: 0 0 10px;
}

.sidebar-link {
  display: block;
  font-size: 13.5px;
  color: var(--fg-2);
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 2px;
  transition: background 120ms, color 120ms;
  text-decoration: none;
}
.sidebar-link:hover {
  background: var(--bg-2);
  color: var(--fg);
}
.sidebar-link.router-link-active {
  background: var(--bg-2);
  color: var(--fg);
  font-weight: 500;
}

/* Content */
.content {
  padding-top: 48px;
  min-width: 0;
}

/* Responsive */
@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
    padding: 0 20px 60px;
    gap: 0;
  }
  .sidebar {
    position: static;
    padding-top: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 32px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    align-items: center;
  }
  .sidebar-title { display: none; }
  .sidebar-link { margin-bottom: 0; }
  .content { padding-top: 0; }
}
</style>
