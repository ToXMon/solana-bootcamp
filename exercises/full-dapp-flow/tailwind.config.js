/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-paper)', foreground: 'var(--color-ink)', surface: 'var(--color-surface)', muted: 'var(--color-muted)', border: 'var(--color-rule)', input: 'var(--color-rule)', ring: 'var(--color-accent)',
        primary: 'var(--color-accent)', 'primary-foreground': 'var(--color-accent-ink)', secondary: 'var(--color-surface-2)', 'secondary-foreground': 'var(--color-ink)', accent: 'var(--color-accent)', 'accent-foreground': 'var(--color-accent-ink)', destructive: 'var(--color-danger)', 'destructive-foreground': 'var(--color-danger-ink)', success: 'var(--color-success)', warning: 'var(--color-warning)'
      },
      fontFamily: {
        display: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      boxShadow: { terminal: '0 0 0 1px var(--color-rule), 0 24px 80px rgb(0 0 0 / 0.38)', glow: '0 0 28px color-mix(in oklch, var(--color-accent) 24%, transparent)' },
      transitionTimingFunction: { expo: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    }
  },
  plugins: [],
}
