const THEME_KEY = 'pennypilot.theme';
type Theme = 'light' | 'dark';

class UiStore {
  theme = $state<Theme>('light');

  constructor() {
    if (typeof document !== 'undefined') {
      this.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
  }

  toggleTheme(): void {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }
}

export const ui = new UiStore();
