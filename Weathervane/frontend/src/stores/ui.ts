import { defineStore } from "pinia";
import { ref } from "vue";

export type Theme = "light" | "dark";

export const useUiStore = defineStore(
  "weathervane.ui",
  () => {
    const theme = ref<Theme>("light");

    function applyTheme() {
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", theme.value === "dark");
      }
    }
    function setTheme(value: Theme) {
      theme.value = value;
      applyTheme();
    }
    function toggleTheme() {
      setTheme(theme.value === "light" ? "dark" : "light");
    }

    return { theme, setTheme, toggleTheme, applyTheme };
  },
  { persist: { pick: ["theme"] } },
);
