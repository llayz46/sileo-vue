export default defineNuxtConfig({
  modules: ["@nuxt/content", "@nuxtjs/google-fonts"],

  build: {
    transpile: ["@llayz46/sileo-vue"],
  },

  googleFonts: {
    families: {
      "Instrument Serif": { ital: [400] },
      "Geist": [400, 500, 600],
      "Geist Mono": [400, 500],
    },
    display: "swap",
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: "github-light",
            dark: "github-dark",
          },
        },
      },
    },
  },

  css: ["~/assets/styles/global.css"],

  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },

  future: { compatibilityVersion: 4 },

  compatibilityDate: "2025-01-01",
});
