# Proposal Voting dApp — Exercise 7: Full Dapp Flow

A production-quality React frontend for the [Proposal State Machine](../proposal-state-machine/) program on Solana devnet. Built for Week 4 of the Encode Club Solana Developer Bootcamp.

## Features

- Connect Phantom or Solflare wallet (devnet)
- Create proposals (Draft state)
- Activate proposals (Draft → Active, creator only)
- Vote on active proposals (Yes/No, one vote per voter)
- Close/cancel proposals (creator only)
- Real-time state refresh after each transaction
- Explorer links for every transaction

## Backend

| Detail | Value |
|---|---|
| Program | Proposal State Machine (Exercise 5) |
| Program ID | `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG` |
| Network | Solana devnet |
| IDL | `src/idl/proposal_state_machine.json` |

## Quick Start

```bash
# Install dependencies
npm install

# Create .env from template
cp .env.example .env

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Deploy to Cloudflare Pages
npm run deploy
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_RPC_ENDPOINT` | `https://api.devnet.solana.com` | Solana devnet RPC URL |
| `VITE_PROGRAM_ID` | `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG` | Proposal state machine program ID |
| `VITE_NETWORK` | `devnet` | Target network |

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI library |
| Vite | 5.2.11 | Build tool + dev server |
| TypeScript | 5.4.5 | Type safety |
| Tailwind CSS | 3.4.3 | Utility-first styling |
| shadcn/ui | — | Component library (button, dialog, badge, input) |
| @coral-xyz/anchor | 0.30.1 | Anchor TS client |
| @solana/web3.js | 1.91.8 | Solana JavaScript SDK |
| @solana/wallet-adapter-react | 0.15.35 | Wallet connection hooks |
| vitest | 1.6.0 | Unit test framework |
| wrangler | 3.57.0 | Cloudflare Pages CLI |

## Architecture

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── WalletButton.tsx       # Connect/disconnect wallet
│   ├── ProposalList.tsx       # Fetch + display all proposals
│   ├── ProposalCard.tsx       # Single proposal with action buttons
│   ├── CreateProposalForm.tsx # Title input + create_proposal tx
│   ├── VoteDialog.tsx         # Confirmation dialog before voting
│   ├── StateBadge.tsx         # Draft/Active/Closed indicator
│   └── ExplorerLink.tsx       # Solana Explorer links
├── providers/
│   └── SolanaProvider.tsx    # Connection + Wallet providers
├── hooks/
│   └── useProposal.ts         # Check if user can vote
├── lib/
│   ├── program.ts             # Anchor Program instance hook
│   ├── pdas.ts                # PDA derivation helpers
│   ├── accounts.ts            # Fetch proposals from chain
│   ├── transactions.ts         # Submit program instructions
│   └── utils.ts               # cn() helper
└── idl/
    └── proposal_state_machine.json  # Program IDL
```

## Design

- **Hallmark Terminal theme** — dark canvas, monospace display (JetBrains Mono), sans body (Inter)
- **OKLCH color** — single Solana green accent, no purple gradients
- **WCAG 2.1 AA** — keyboard navigation, ARIA labels, focus management, color contrast ≥ 4.5:1
- **Anti-AI-slop** — no purple gradients, no single-font, no centered-everything, no icon-tile cards

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Cloudflare Pages deployment instructions.

## Verification

1. Open the deployed URL
2. Connect a Solana wallet set to devnet
3. Create a proposal → verify on [Explorer](https://explorer.solana.com/?cluster=devnet)
4. Activate the proposal → verify on Explorer
5. Vote on the proposal → verify on Explorer
6. Close the proposal → verify on Explorer

## Testing

```bash
npm test  # 19 tests across 6 files
```

| Test File | Tests |
|---|---|
| pdas.test.ts | 3 — PDA derivation correctness |
| utils.test.ts | 5 — Utility functions |
| StateBadge.test.tsx | 3 — State rendering |
| WalletButton.test.tsx | 3 — Connect/disconnect states |
| ProposalCard.test.tsx | 3 — Conditional rendering by state + authority |
| ExplorerLink.test.tsx | 2 — Link generation |

Manual E2E checklist: [tests/MANUAL_E2E.md](./tests/MANUAL_E2E.md)
