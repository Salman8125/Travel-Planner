import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#2f6fed',
          600: '#1f57c9',
          700: '#1b489f',
        },
        within: '#0a7d28',
        over: '#b00020',
      },
    },
  },
  plugins: [],
} satisfies Config;
