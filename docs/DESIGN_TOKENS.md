# PAL Design Tokens

Complete design system specification for PAL UI components.

---

## Color Palette

### Core Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--ivory` | `#FAF7F2` | Primary background |
| `--charcoal` | `#16151A` | Primary surfaces, text |
| `--violet` | `#6C3DF4` | PAL reasoning, intelligence, active states |
| `--teal` | `#2E8B8B` | Understood, validated, success |
| `--amber` | `#D97706` | Uncertainty, clarification, warnings |
| `--red` | `#DC2626` | Blocked, rejected, errors |

### Semantic Mappings

```css
/* Status colors */
--color-understood: var(--teal);
--color-thinking: var(--violet);
--color-uncertain: var(--amber);
--color-blocked: var(--red);

/* Functional colors */
--color-success: var(--teal);
--color-warning: var(--amber);
--color-error: var(--red);
--color-info: var(--violet);
```

### Dark Mode

```css
.dark {
  --ivory: #16151A;
  --charcoal: #FAF7F2;
  --line: rgba(250, 247, 242, 0.12);
}
```

---

## Typography

### Font Families

```css
--font-ui: 'DM Sans', system-ui, -apple-system, sans-serif;
--font-editorial: 'Cormorant Garamond', Georgia, serif; /* Landing only */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Sizes

| Token | Value | Line Height | Usage |
|-------|-------|-------------|-------|
| `--text-xs` | `0.75rem` (12px) | 1.5 | Captions, timestamps |
| `--text-sm` | `0.875rem` (14px) | 1.5 | Secondary text, labels |
| `--text-base` | `1rem` (16px) | 1.5 | Body text |
| `--text-lg` | `1.125rem` (18px) | 1.5 | Lead paragraphs |
| `--text-xl` | `1.25rem` (20px) | 1.4 | H3, section titles |
| `--text-2xl` | `1.5rem` (24px) | 1.3 | H2, page titles |
| `--text-3xl` | `1.875rem` (30px) | 1.2 | Hero headlines |
| `--text-4xl` | `2.25rem` (36px) | 1.1 | Landing hero |

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing

### Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Micro spacing |
| `--space-2` | `8px` | Tight spacing |
| `--space-3` | `12px` | Icon gaps |
| `--space-4` | `16px` | Standard gap |
| `--space-5` | `20px` | Comfortable gap |
| `--space-6` | `24px` | Section padding |
| `--space-8` | `32px` | Component margins |
| `--space-10` | `40px` | Large margins |
| `--space-12` | `48px` | Section spacing |
| `--space-16` | `64px` | Page sections |

---

## Border Radius

```css
--radius-sm: 8px;    /* Buttons, small inputs */
--radius-md: 12px;   /* Cards, modals */
--radius-lg: 16px;   /* Large cards */
--radius-xl: 20px;   /* Hero elements */
--radius-full: 9999px; /* Pills, orbs */
```

**Design Principle:** 16-24px cards with thin borders and large whitespace.

---

## Borders

### Stroke

```css
--line: rgba(22, 21, 26, 0.12); /* Light mode */
--line-dark: rgba(250, 247, 242, 0.12); /* Dark mode */
```

### Usage

```css
/* Card borders */
border: 1px solid var(--line);

/* Divider lines */
border-top: 1px solid var(--line);

/* Focus rings */
outline: 2px solid var(--violet);
outline-offset: 2px;
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.15);
```

### Elevation Levels

| Level | Shadow | Usage |
|-------|--------|-------|
| Flat | none | Static content |
| Raised | `--shadow-sm` | Hover states |
| Floating | `--shadow-md` | Cards, dropdowns |
| Elevated | `--shadow-lg` | Modals, popovers |
| High | `--shadow-xl` | Toast notifications |

---

## Animations

### Timing Functions

```css
--transition-fast: 150ms ease;
--transition-base: 250ms ease;
--transition-slow: 400ms ease;
```

### Keyframe Animations

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes orb-idle {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(108, 61, 244, 0.25); 
  }
  50% { 
    box-shadow: 0 0 0 24px rgba(108, 61, 244, 0); 
  }
}

@keyframes orb-rec {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(108, 61, 244, 0.5); 
  }
  50% { 
    box-shadow: 0 0 0 30px rgba(108, 61, 244, 0); 
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Animation Classes

```css
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-orb-idle {
  animation: orb-idle 3s infinite;
}

.animate-orb-rec {
  animation: orb-rec 1.1s infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-fade-in {
  animation: fade-in 200ms ease-out;
}

.animate-slide-up {
  animation: slide-up 300ms ease-out;
}
```

---

## Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-overlay: 300;
--z-modal: 400;
--z-popover: 500;
--z-tooltip: 600;
--z-toast: 700;
```

---

## Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: 'var(--ivory)',
        charcoal: 'var(--charcoal)',
        violet: 'var(--violet)',
        teal: 'var(--teal)',
        amber: 'var(--amber)',
        red: 'var(--red)',
      },
      fontFamily: {
        ui: ['var(--font-ui)'],
        editorial: ['var(--font-editorial)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orb-idle': 'orb-idle 3s infinite',
        'orb-rec': 'orb-rec 1.1s infinite',
      },
      keyframes: {
        'orb-idle': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108, 61, 244, 0.25)' },
          '50%': { boxShadow: '0 0 0 24px rgba(108, 61, 244, 0)' },
        },
        'orb-rec': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108, 61, 244, 0.5)' },
          '50%': { boxShadow: '0 0 0 30px rgba(108, 61, 244, 0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## CSS Variables File

```css
/* src/styles/tokens.css */
:root {
  /* Core palette */
  --ivory: #FAF7F2;
  --charcoal: #16151A;
  --violet: #6C3DF4;
  --teal: #2E8B8B;
  --amber: #D97706;
  --red: #DC2626;

  /* Semantic colors */
  --color-understood: var(--teal);
  --color-thinking: var(--violet);
  --color-uncertain: var(--amber);
  --color-blocked: var(--red);

  /* Typography */
  --font-ui: 'DM Sans', system-ui, sans-serif;
  --font-editorial: 'Cormorant Garamond', serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Borders */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  --line: rgba(22, 21, 26, 0.12);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

  /* Animations */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;

  /* Z-index */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-tooltip: 600;
  --z-toast: 700;
}

/* Dark mode */
.dark {
  --ivory: #16151A;
  --charcoal: #FAF7F2;
  --line: rgba(250, 247, 242, 0.12);
}
```

---

## Forbidden Patterns

❌ **DO NOT USE:**
- Gradients everywhere (use sparingly for special effects only)
- AI-robot imagery (no robot icons, brain illustrations)
- Dominant chat bubbles (this is not a chatbot)
- Rounded corners < 8px
- Shadows heavier than `--shadow-xl`
- Pure black (`#000000`) or pure white (`#FFFFFF`)
- More than 3 font families in any view
- Animated backgrounds that distract from voice interaction

✅ **ALWAYS USE:**
- Ivory background as primary canvas
- Charcoal for primary surfaces
- Violet for PAL reasoning states
- Teal for understood/validated content
- Amber for uncertainty (never red unless blocked)
- DM Sans for all UI text
- 16-24px border radius on cards
- Large whitespace between sections
- Thin borders (1px with low opacity)
