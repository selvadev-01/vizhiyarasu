/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Dark mode is keyed off `[data-theme="dark"]` on the html element so the
  // same attribute drives both the CSS-variable tokens (in globals.css) and
  // any optional `dark:` Tailwind variants.
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        debug: 'violet',
        // brand tokens — wired to CSS variables so they respect the active
        // theme. `bg-brgray` and `bg-brblue` keep working everywhere they
        // were already used (LetsTalk, AboutUs button hover, etc.) but now
        // automatically swap palettes when the theme changes.
        brgray: 'var(--color-btn-light-bg)',
        brblue: 'var(--color-accent)',
        // generic theme tokens for new code
        bg: 'var(--color-bg)',
        'bg-alt': 'var(--color-bg-alt)',
        fg: 'var(--color-text)',
        'fg-muted': 'var(--color-text-muted)',
        'fg-subtle': 'var(--color-text-subtle)',
        accent: 'var(--color-accent)',
        'accent-soft': 'var(--color-accent-soft)',
        'theme-border': 'var(--color-border)',
        // Orbit gradient shades. Declared with the `<alpha-value>` placeholder
        // so `from-orbit-glow/30` composes correctly — the underlying vars are
        // bare "R G B" channel triplets, not hex.
        'orbit-glow': 'rgb(var(--orbit-glow) / <alpha-value>)',
        'orbit-spin': 'rgb(var(--orbit-spin) / <alpha-value>)',
        'orbit-spin-alt': 'rgb(var(--orbit-spin-alt) / <alpha-value>)',

        // shadcn primitive color keys. These back the classes used by the
        // copied shadcn components in components/ui and resolve through the
        // alias vars declared in globals.css, so they follow the theme.
        // NOTE: `accent` is deliberately NOT redefined here — the existing
        // `accent` key above is in active use by the rest of the site.
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
      },
    },
    fontFamily: {
      // Every named family resolves to Inter so any existing
      // `font-Aeonik`/`font-AeonikMedium`/`font-AeonikBold` class — and the
      // default `font-sans` — silently picks up the site-wide typeface
      // without touching every component.
      sans: ["var(--font-inter)", "Inter", "sans-serif"],
      Inter: ["var(--font-inter)", "Inter", "sans-serif"],
      Aeonik: ["var(--font-inter)", "Inter", "sans-serif"],
      AeonikBold: ["var(--font-inter)", "Inter", "sans-serif"],
      AeonikMedium: ["var(--font-inter)", "Inter", "sans-serif"],
      // Drives the inline navbar links, wordmark subtitle and CTA.
      mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
    },
  },
  plugins: [
    require('tailwindcss-3d')
  ],
};
