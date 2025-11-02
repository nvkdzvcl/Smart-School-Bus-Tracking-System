/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./lib/**/*.{ts,tsx,js,jsx}",
  ],
  darkMode: "class", // quan trọng!
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "oklch(var(--background) / 1)",
          50: "oklch(var(--background) / 0.5)",
        },
        foreground: "oklch(var(--foreground) / 1)",
        card: "oklch(var(--card) / 1)",
        "card-foreground": "oklch(var(--card-foreground) / 1)",
        popover: "oklch(var(--popover) / 1)",
        "popover-foreground": "oklch(var(--popover-foreground) / 1)",

        primary: "oklch(var(--primary) / <alpha-value>)",
        "primary-foreground": "oklch(var(--primary-foreground) / <alpha-value>)",
        secondary: "oklch(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "oklch(var(--secondary-foreground) / <alpha-value>)",

        muted: "oklch(var(--muted) / <alpha-value>)",
        "muted-foreground": "oklch(var(--muted-foreground) / <alpha-value>)",
        accent: "oklch(var(--accent) / <alpha-value>)",
        "accent-foreground": "oklch(var(--accent-foreground) / <alpha-value>)",

        destructive: "oklch(var(--destructive) / <alpha-value>)",
        "destructive-foreground": "oklch(var(--destructive-foreground) / <alpha-value>)",
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
      },
      borderColor: {
        DEFAULT: "oklch(var(--border) / 1)",
        border: "oklch(var(--border) / 1)",
      },
    },
  },
  plugins: [],
}
