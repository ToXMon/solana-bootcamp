# Spec: Exercise 7 — Full Dapp Flow (Proposal Voting dApp)

> **Spec phase of spec-driven-development workflow.** This document specifies what to build, not how to implement it. No implementation code here — the code style section is illustrative only.

---

## Objective

Build a production-quality React frontend for the proposal state machine program (Exercise 5, deployed on devnet at `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`). The dApp allows users to connect a browser wallet, view all proposals, create new proposals, vote on active proposals, and transition proposals through their lifecycle (Draft → Active → Closed).

**Who uses it:**
- Bootcamp evaluators reviewing Exercise 7 submission
- Solana developers exploring the proposal state machine program
- The bootcamp student (user) demonstrating full-stack dApp competency

**What success looks like:**
- All 4 program instructions (create_proposal, activate, vote, close) are executable from the UI with verified devnet transactions
- The design is anti-AI-slop — looks hand-crafted, not generated
- The site is live on Cloudflare Pages and accessible at a `*.pages.dev` URL
- A new developer can clone, install, run locally, and deploy by following the README

---

## Tech Stack

All versions pinned. Verify with `npm ls` after install.

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | `^18.3.1` | UI library |
| `react-dom` | `^18.3.1` | DOM rendering |
| `typescript` | `^5.4.5` | Type safety |
| `vite` | `^5.2.11` | Build tool + dev server |
| `@vitejs/plugin-react` | `^4.3.0` | React fast refresh for Vite |

### Styling & Design System

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | `^3.4.3` | Utility-first CSS framework |
| `postcss` | `^8.4.38` | CSS processing |
| `autoprefixer` | `^10.4.19` | Vendor prefix automation |
| `class-variance-authority` | `^0.7.0` | Variant management for shadcn/ui |
| `clsx` | `^2.1.1` | Conditional class names |
| `tailwind-merge` | `^2.3.0` | Tailwind class deduplication |
| `lucide-react` | `^0.395.0` | Icon library (shadcn/ui default) |

> **shadcn/ui** is not an npm package — components are copied into the project via `npx shadcn-ui@latest init` then `npx shadcn-ui@latest add button dialog badge ...`. Components live in `src/components/ui/`.

### Solana & Anchor

| Package | Version | Purpose |
|---------|---------|---------|
| `@coral-xyz/anchor` | `^0.30.1` | Anchor TS client, Program class, IDL types |
| `@solana/web3.js` | `^1.91.8` | Connection, PublicKey, transactions |
| `@solana/wallet-adapter-base` | `^0.9.23` | Wallet adapter interface |
| `@solana/wallet-adapter-react` | `^0.15.35` | React hooks for wallet state |
| `@solana/wallet-adapter-react-ui` | `^0.9.35` | Wallet modal button UI |
| `@solana/wallet-adapter-wallets` | `^0.19.32` | Phantom + Solflare wallet adapters |

### Testing & Quality

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | `^1.6.0` | Unit test framework |
| `@testing-library/react` | `^15.0.7` | Component testing |
| `@testing-library/jest-dom` | `^6.4.5` | DOM assertion matchers |
| `jsdom` | `^24.0.0` | DOM environment for tests |
| `eslint` | `^8.57.0` | Linting |
| `@typescript-eslint/parser` | `^7.11.0` | TS lint parser |
| `@typescript-eslint/eslint-plugin` | `^7.11.0` | TS lint rules |

### Deployment

| Tool | Version | Purpose |
|------|---------|---------|
| `wrangler` | `^3.57.0` | Cloudflare Pages CLI deployment |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/react` | `^18.3.3` | React type definitions |
| `@types/react-dom` | `^18.3.0` | ReactDOM type definitions |
| `@types/node` | `^20.12.12` | Node.js type definitions |

---

## Commands

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)

# Build
npm run build            # TypeScript check + Vite production build → dist/

# Preview production build
npm run preview          # Serve dist/ locally for pre-deploy verification

# Lint
npm run lint             # ESLint with TypeScript parser

# Type check (standalone, without build)
npx tsc --noEmit         # TypeScript compiler in check-only mode

# Unit tests
npm test                 # Run vitest once
npm run test:watch       # Run vitest in watch mode
npm run test:coverage    # Run vitest with coverage report

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist/ --project-name proposal-dapp

# shadcn/ui component management
npx shadcn-ui@latest add <component>   # Add a new UI component
```

---

## Project Structure

```
exercises/full-dapp-flow/
├── public/
│   └── favicon.svg                    # Custom favicon (not default Vite)
├── src/
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives (generated)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   ├── WalletButton.tsx            # Connect/disconnect wallet
│   │   ├── ProposalList.tsx            # Read + display all proposals
│   │   ├── ProposalCard.tsx            # Single proposal display + actions
│   │   ├── CreateProposalForm.tsx      # Title input + submit
│   │   ├── VoteDialog.tsx              # Vote confirmation modal
│   │   ├── ExplorerLink.tsx            # Solana Explorer link generator
│   │   └── StateBadge.tsx              # Draft/Active/Closed indicator
│   ├── hooks/
│   │   ├── useProposals.ts             # Fetch + cache proposals
│   │   ├── useProposal.ts              # Fetch single proposal + vote record
│   │   └── useTransaction.ts           # Tx submit + confirm + toast
│   ├── lib/
│   │   ├── program.ts                  # Anchor Program instance from IDL
│   │   ├── pda.ts                      # PDA derivation helpers
│   │   ├── decode.ts                   # Account decoding helpers
│   │   ├── constants.ts                # Program ID, RPC endpoint, network
│   │   └── utils.ts                    # cn() helper for Tailwind merge
│   ├── idl/
│   │   └── proposal_state_machine.json # Copied from Exercise 5 target/idl/
│   ├── types/
│   │   └── index.ts                    # Shared TypeScript types
│   ├── providers/
│   │   └── SolanaProvider.tsx          # Connection + Wallet + Anchor providers
│   ├── App.tsx                         # Root component, layout shell
│   ├── main.tsx                        # Vite entry point
│   └── index.css                       # Tailwind directives + design tokens
├── tests/
│   ├── unit/
│   │   ├── pda.test.ts                 # PDA derivation correctness
│   │   ├── decode.test.ts              # Account decoding
│   │   └── StateBadge.test.tsx         # Component render tests
│   └── integration/
│       └── proposal-flow.test.ts       # Anchor localnet integration
├── .env.example                        # Template for environment variables
├── .env.local                          # Local dev (gitignored)
├── index.html                          # Vite HTML entry
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
├── vitest.config.ts
├── wrangler.toml                       # Cloudflare Pages config (optional)
├── .gitignore
└── README.md
```

---

## Code Style

### Naming Conventions

- **Components**: PascalCase files matching component name (`ProposalCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useProposals.ts`)
- **Libraries**: camelCase (`pda.ts`, `decode.ts`)
- **Types**: PascalCase interfaces and types (`ProposalData`, `ProposalState`)
- **Constants**: UPPER_SNAKE_CASE (`PROGRAM_ID`, `RPC_ENDPOINT`)
- **CSS classes**: Tailwind utilities only — no custom CSS classes except design tokens

### Design System: Hallmark "Terminal" Theme

The dApp uses the Hallmark Design System's **Terminal** theme with the **Data Display** macrostructure:

- **Paper**: Dark canvas (`oklch(0.15 0.01 260)` — warm-neutral dark, not pure black)
- **Display face**: Monospace (e.g., `JetBrains Mono` or `IBM Plex Mono`) for headings, proposal IDs, addresses
- **Body face**: System UI sans-serif stack for readable body text
- **Accent**: Single anchor hue — Solana green (`oklch(0.72 0.17 150)`) for interactive elements
- **Layout**: Asymmetric — proposal list takes 70% width on desktop, controls sidebar 30%. Not centered-everything.
- **Spacing**: 4pt scale (4, 8, 12, 16, 24, 32, 48, 64px)
- **Motion**: Exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) with `prefers-reduced-motion` fallback

### Anti-Slop Rules (Hard Refusals)

1. No purple-to-blue gradient heroes
2. No single-font design (monospace display + sans body, always paired)
3. No centered-everything layouts (bias the page asymmetrically)
4. No icon-tile feature cards (vary card alignment, pull icons inline)
5. No AI nav (wordmark left, links center, CTA right) — use edge-aligned minimal nav

### Illustrative Component Example

This is a spec illustration showing the design system approach — not implementation code for the build phase.

```tsx
// src/components/StateBadge.tsx
// Illustrative spec example — demonstrates design system conventions

import { cn } from "@/lib/utils";
import { Circle, Radio, Lock } from "lucide-react";

// State type matches on-chain enum
type ProposalState = "Draft" | "Active" | "Closed";

interface StateBadgeProps {
  state: ProposalState;
  className?: string;
}

// Color-coded BUT not color-only — icon + text always present (WCAG compliance)
const stateConfig: Record<ProposalState, {
  label: string;
  icon: typeof Circle;
  // OKLCH tokens, not raw hex
  className: string;
}> = {
  Draft: {
    label: "Draft",
    icon: Circle,
    className: "bg-muted text-muted-foreground border-border",
  },
  Active: {
    label: "Active",
    icon: Radio,
    // Accent hue for active state — single anchor color
    className: "bg-accent/10 text-accent border-accent/30",
  },
  Closed: {
    label: "Closed",
    icon: Lock,
    className: "bg-muted/50 text-muted-foreground/70 border-border",
  },
};

export function StateBadge({ state, className }: StateBadgeProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5",
        "font-mono text-xs font-medium uppercase tracking-wide",
        config.className,
        className
      )}
      aria-label={`Proposal status: ${state}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
```

**What this example demonstrates:**
1. **Type safety**: State type mirrors on-chain enum
2. **Accessibility**: `aria-label` + icon + text (never color-only)
3. **Design tokens**: `bg-muted`, `text-accent` — semantic tokens, not raw hex
4. **Monospace for data**: `font-mono` on status label (Terminal theme)
5. **4pt spacing**: `gap-1.5` (6px), `px-2` (8px), `py-0.5` (2px) — wait, 2px isn't 4pt. Use `py-1` (4px). Correction: all spacing must be multiples of 4px.
6. **Composition**: `cn()` for class merging, variant via lookup table not conditional chains
7. **No AI slop**: No purple gradient, no oversized rounding, no icon-tile pattern

### File Structure Rules

- One component per file (named export, no default export for components)
- Co-locate component tests: `StateBadge.test.tsx` next to `StateBadge.tsx`
- Hooks in `src/hooks/`, libraries in `src/lib/`, types in `src/types/`
- IDL JSON in `src/idl/` — imported as a typed module
- No barrel files (`index.ts` re-exporting everything) — explicit imports only

---

## Component Architecture

Seven components make up the dApp UI. Each has a single responsibility and clear interface.

### 1. WalletButton

**Purpose**: Wallet connection control — connect, disconnect, display connected pubkey, wallet selector dropdown.

**Props**: None (reads from wallet-adapter context).

**Behavior**:
- Disconnected: shows "Connect Wallet" button → opens wallet modal (Phantom, Solflare)
- Connected: shows truncated pubkey (`HnzA...LYnx`) + dropdown menu with disconnect option
- Copy address to clipboard via dropdown action
- Uses `@solana/wallet-adapter-react-ui` `WalletMultiButton` as base, restyled to match Terminal theme

**Accessibility**: Button has `aria-label`, dropdown is keyboard navigable, focus trapped in modal.

### 2. ProposalList

**Purpose**: Read all proposals from chain and display them in a list.

**Props**: None (self-fetching via `useProposals` hook).

**Behavior**:
- On mount/wallet connect: fetch ProposalCounter → get count → `getProgramAccounts` with memcmp filter on Proposal discriminator → decode all Proposal accounts → sort by `proposal_id` descending
- Renders loading skeletons while fetching (not spinners)
- Renders empty state when no proposals exist ("No proposals yet. Create the first one.")
- Renders error state on RPC failure with retry button
- Passes each proposal to `ProposalCard`
- Shows proposal count header: "3 Proposals" in monospace

**Data fetching strategy** (refined from locked decision #7):
1. Read `ProposalCounter` PDA (`seeds: ["proposal_counter"]`) → get `count`
2. Call `connection.getProgramAccounts(PROGRAM_ID)` with `memcmp` filter on first 8 bytes (Proposal discriminator: `[26, 94, 189, 187, 116, 136, 53, 33]`)
3. Decode each account buffer using Anchor's `program.coder.accounts.decode()`
4. Sort decoded proposals by `proposal_id` descending (newest first)
5. For vote checking: derive `VoteRecord` PDA for each `(proposal, connectedWallet)` pair, batch `getMultipleAccountsInfo` to determine if user has already voted

> **Note on PDA derivation**: The locked decision mentions "PDA derivation from ProposalCounter." Pure PDA derivation requires knowing each proposal's creator (seeds = `[