export function useTheme() {
  const theme = useState<"light" | "dark" | "system">("theme", () => "light");

  function applyTheme(t: "light" | "dark" | "system") {
    if (import.meta.client) {
      const isDark = t === "dark";
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      // Nuxt Content / Shiki use .dark class for dual-theme syntax highlighting
      document.documentElement.classList.toggle("dark", isDark);
    }
  }

  function toggle() {
    theme.value = theme.value === "dark" ? "light" : "dark";
    applyTheme(theme.value);
  }

  function set(t: "light" | "dark" | "system") {
    theme.value = t;
    applyTheme(t);
  }

  if (import.meta.client) {
    watch(theme, applyTheme, { immediate: true });
  }

  return { theme, toggle, set };
}
