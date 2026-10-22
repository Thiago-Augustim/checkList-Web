import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ph: {
          primary: "var(--ph-primary)",
          "primary-bg": "var(--ph-primary-bg)",
          "grid-hover": "var(--ph-grid-hover-bg)",
          border: "var(--ph-border)",
          surface: "var(--ph-surface)",
          "sidebar-bg": "var(--ph-sidebar-bg)",
          "sidebar-muted": "var(--ph-sidebar-text-muted)",
          "primary-pressed": "var(--ph-primary-pressed)",
          "text-primary": "var(--ph-text-primary)",
          "text-secondary": "var(--ph-text-secondary)",
          "card-bg": "var(--ph-card-bg)",
          "body-bg": "var(--ph-body-bg)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
