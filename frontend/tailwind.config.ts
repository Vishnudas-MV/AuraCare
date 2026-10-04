import type { Config } from 'tailwindcss';

// Tailwind v4 uses CSS entry point @import "tailwindcss" & @theme directive.
// This configuration file is provided for IDE tooling compatibility.
const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
