# Exercise 7 — Full Dapp Flow: Implementation Plan

> **Backend**: Proposal state machine (Exercise 5), Program ID: `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`
> **Network**: Solana devnet
> **Spec**: See `/a0/usr/projects/solana_bootcamp/SPEC.md`
> **Design system**: Hallmark Terminal theme + Data Display macrostructure

---

## Overview

Build a production-quality React frontend for the proposal state machine program. The dApp allows users to connect a wallet, view proposals, create proposals, vote on active proposals, and transition proposals through their lifecycle (Draft → Active → Closed). Deploy to Cloudflare Pages.

## Decisions & Rationale

| Decision | Choice | Why |
|----------|--------|-----|
| Backend program | Proposal state machine (Exercise 5) | Exercise 5 is complete and deployed on devnet with 4 instructions and 3 account types. |
| Frontend framework | Vite + React + TypeScript | Client-side SPA, no SSR needed, fast dev server, standard for Solana dApps. |
| Styling | Tailwind CSS + shadcn/ui | Production-quality components with accessibility built in. Anti-AI-slop via hallmark-design. |
| Wallet adapter | `@solana/wallet-adapter-react` | Established pattern, Phantom + Solflare, works with Anchor `Program` class. |
| Anchor client | `@coral-xyz/anchor` | Standard Anchor TS client, typed IDL, `program.coder.accounts.decode()`. |
| RPC | Public devnet (switch to Helius if rate-limited) | Free, no API key needed. Env var makes switch trivial. |
| Proposal fetching | `getProgramAccounts` with memcmp filter | Single RPC call, avoids N round trips. Counter validates expected count. |
| Vote UX | Confirmation dialog before vote tx | Prevents accidental votes, matches locked decision #8. |
| Deployment | Cloudflare Pages (wrangler CLI) | Free, persistent, automatic HTTPS, SPA routing. Git-integrated CI optional. |
| Theme | Hallmark Terminal (dark, monospace-forward) | Solana dApp convention, anti-AI-slop, fits technical register. |

## Dependency Graph

```
Exercise 5 program (devnet, 8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG)
    │
    ├── IDL (exercises/proposal-state-machine/target/idl/proposal_state_machine.json)
    ├── Program ID (8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG)
    └── devnet RPC endpoint
            │
            ▼
    Phase 1: Project scaffold (Vite + React + TS, Tailwind, shadcn/ui)
            │
            ▼
    Phase 2: Wallet integration (wallet-adapter, connection context, WalletButton)
            │
            ▼
    Phase 3: Anchor client setup (IDL import, program instance, PDA helpers)
            │
            ▼
    Phase 4: Proposal list (fetch, derive PDAs, batch fetch, ProposalList + ProposalCard + StateBadge)
            │
            ├─────── Phase 5: Create proposal (CreateProposalForm, create_proposal tx)
            │
            ├─────── Phase 6: Voting flow (VoteDialog, vote tx, vote record check)
            │
            └─────── Phase 7: Lifecycle actions (activate, close buttons)
                        │
                        ▼
            Phase 8: Design polish (hallmark-design audit, anti-slop, accessibility)
                        │
                        ▼
            Phase 9: Testing (vitest unit tests, manual devnet E2E, Lighthouse)
                        │
                        ▼
            Phase 10: Cloudflare deployment (build, wrangler deploy, verify live URL)
                        │
                        ▼
            Phase 11: README + documentation
```

---

## Phase 1: Project Scaffold

**Description**: Create a new Vite + React + TypeScript project in `exercises/full-dapp-flow/`. Set up Tailwind CSS, shadcn/ui, and base configuration files. Remove nested `.git` if Vite scaffold adds one.

**Files to create/modify**:
- `exercises/full-dapp-flow/package.json`
- `exercises/full-dapp-flow/vite.config.ts`
- `exercises/full-dapp-flow/tsconfig.json`
- `exercises/full-dapp-flow/tsconfig.node.json`
- `exercises/full-dapp-flow/tailwind.config.ts`
- `exercises/full-dapp-flow/postcss.config.js`
- `exercises/full-dapp-flow/index.html`
- `exercises/full-dapp-flow/src/main.tsx`
- `exercises/full-dapp-flow/src/App.tsx`
- `exercises/full-dapp-flow/src/index.css`
- `exercises/full-dapp-flow/src/lib/utils.ts` (cn helper)
- `exercises/full-dapp-flow/.gitignore`
- `exercises/full-dapp-flow/.env.example`
- `exercises/full-dapp-flow/components.json` (shadcn/ui config)

**Acceptance criteria**:
- [ ] `npm create vite@latest` succeeds, project builds with `npm run build`
- [ ] Tailwind CSS configured — `@tailwind` directives in `index.css`, `tailwind.config.ts` with content paths
- [ ] `npx shadcn-ui@latest init` completes — `components.json` exists, `cn()` utility in `src/lib/utils.ts`
- [ ] shadcn/ui base components added: `button`, `dialog`, `badge`, `input`
- [ ] `.env.example` has `VITE_RPC_ENDPOINT`, `VITE_PROGRAM_ID`, `VITE_NETWORK`
- [ ] No nested `.git` directory inside the exercise folder
- [ ] `npm run dev` starts Vite dev server without errors

**Estimated complexity**: Medium

---

## Phase 2: Wallet Integration

**Description**: Install and configure `@solana/wallet-adapter-react` with Phantom and Solflare. Wrap the app in `ConnectionProvider`, `WalletProvider`, `WalletModalProvider`. Create `SolanaProvider.tsx` and `WalletButton.tsx`.

**Files to create/modify**:
- `exercises/full-dapp-flow/package.json` (add wallet-adapter deps)
- `exercises/full-dapp-flow/src/providers/SolanaProvider.tsx`
- `exercises/full-dapp-flow/src/components/WalletButton.tsx`
- `exercises/full-dapp-flow/src/lib/constants.ts` (RPC endpoint, program ID, network)
- `exercises/full-dapp-flow/src/App.tsx` (wrap with providers)
- `exercises/full-dapp-flow/src/index.css` (wallet-adapter button restyling)

**Acceptance criteria**:
- [ ] All wallet-adapter packages installed and pinned (see SPEC.md tech stack)
- [ ] `npm ls @solana/wallet-adapter-react @coral-xyz/anchor @solana/web3.js` shows no peer conflicts
- [ ] `SolanaProvider` wraps app with `ConnectionProvider` (devnet RPC from env var), `WalletProvider` (Phantom + Solflare), `WalletModalProvider`
- [ ] `WalletButton` renders: disconnected → "Connect Wallet", connected → truncated pubkey + dropdown
- [ ] Clicking "Connect Wallet" opens modal with Phantom and Solflare options
- [ ] Connected wallet pubkey displays correctly (matches Phantom account)
- [ ] WalletButton restyled to match Terminal theme (not default wallet-adapter styles)
- [ ] `npm run build` passes with no errors

**Estimated complexity**: Medium

---

## Phase 3: Anchor Client Setup

**Description**: Copy the proposal state machine IDL into the frontend, create an Anchor `Program` instance, and implement PDA derivation helpers for ProposalCounter, Proposal, and VoteRecord accounts.

**Files to create/modify**:
- `exercises/full-dapp-flow/src/idl/proposal_state_machine.json` (copy from Exercise 5)
- `exercises/full-dapp-flow/src/lib/program.ts` (Program instance from IDL + provider)
- `exercises/full-dapp-flow/src/lib/pda.ts` (derivation helpers)
- `exercises/full-dapp-flow/src/types/index.ts` (ProposalData, ProposalState, VoteRecordData types)
- `exercises/full-dapp-flow/src/hooks/useProgram.ts` (hook to get Program instance)

**Acceptance criteria**:
- [ ] IDL JSON copied from `exercises/proposal-state-machine/target/idl/`
- [ ] `Program` instance typed from IDL — `program.methods.createProposal(title)` is type-safe
- [ ] `deriveProposalCounterPDA()` returns correct address (seeds: `["proposal_counter"]`)
- [ ] `deriveProposalPDA(creator, proposalId)` returns correct address (seeds: `["proposal", creator, proposalId_le_bytes]`)
- [ ] `deriveVoteRecordPDA(proposal, voter)` returns correct address (seeds: `["vote", proposal, voter]`)
- [ ] PDA derivation verified against known Anchor test output or Solana CLI
- [ ] `npm run build` passes with IDL imported

**Estimated complexity**: Medium

---

## Phase 4: Proposal List

**Description**: Implement proposal fetching (read ProposalCounter, `getProgramAccounts` with memcmp filter, decode all Proposal accounts), vote record checking, and the `ProposalList`, `ProposalCard`, and `StateBadge` components.

**Files to create/modify**:
- `exercises/full-dapp-flow/src/hooks/useProposals.ts` (fetch all proposals + vote records)
- `exercises/full-dapp-flow/src/lib/decode.ts` (account decoding helpers)
- `exercises/full-dapp-flow/src/components/ProposalList.tsx`
- `exercises/full-dapp-flow/src/components/ProposalCard.tsx`
- `exercises/full-dapp-flow/src/components/StateBadge.tsx`
- `exercises/full-dapp-flow/src/components/ExplorerLink.tsx`
- `exercises/full-dapp-flow/src/App.tsx` (render ProposalList)

**Acceptance criteria**:
- [ ] `useProposals` hook fetches ProposalCounter, then `getProgramAccounts` with memcmp on Proposal discriminator
- [ ] Proposals decoded via `program.coder.accounts.decode("Proposal", buffer)` and sorted by `proposal_id` descending
- [ ] Vote records checked: derive VoteRecord PDA for each `(proposal, connectedWallet)`, batch `getMultipleAccountsInfo`
- [ ] `ProposalList` renders: loading skeletons, empty state ("No proposals yet"), error state with retry
- [ ] `ProposalCard` displays: title, StateBadge, proposal ID (#001 format), creator (truncated + ExplorerLink), vote counts with ratio bar
- [ ] `StateBadge` shows Draft/Active/Closed with icon + text (not color-only)
- [ ] `ExplorerLink` generates correct devnet URLs (`https://explorer.solana.com/{type}/{value}?cluster=devnet`)
- [ ] Proposal count header shows in monospace ("3 Proposals")
- [ ] Build passes, no console errors when proposals load

**Estimated complexity**: High

---

## Phase 5: Create Proposal

**Description**: Implement the `CreateProposalForm` component with title input, client-side validation (max 64 chars), and the `create_proposal` transaction flow.

**Files to create/modify**:
- `exercises/full-dapp-flow/src/components/CreateProposalForm.tsx`
- `exercises/full-dapp-flow/src/hooks/useTransaction.ts` (tx submit + confirm + toast helper)
- `exercises/full-dapp-flow/src/App.tsx` (render CreateProposalForm)
- `exercises/full-dapp-flow/src/components/ui/toast.tsx` (if not already added)
- `exercises/full-dapp-flow/src/components/ui/toaster.tsx`

**Acceptance criteria**:
- [ ] Title input with `<label>`, `aria-describedby` for char counter, `aria-invalid` on error
- [ ] Client-side validation: max 64 characters (matches on-chain `TitleTooLong` error)
- [ ] Character counter below input (`42 / 64`) in monospace
- [ ] Submit button disabled when: empty title, over 64 chars, no wallet, or tx pending
- [ ] On submit: derive ProposalCounter PDA + Proposal PDA (using current counter count as proposal_id), call `program.methods.createProposal(title).accounts({...}).rpc()`
- [ ] After confirmation: optimistic prepend to list, refetch single proposal, success toast with ExplorerLink
- [ ] Error handling: TitleTooLong (6004), wallet rejection, insufficient SOL — all mapped to human-readable messages
- [ ] Input clears after successful creation
- [ ] Build passes, create flow tested on devnet

**Estimated complexity**: Medium

---

## Phase 6: Voting Flow

**Description**: Implement the `VoteDialog` component with confirmation message, Yes/No choice, vote transaction submission, and vote record state management.

**Files to create/modify**:
- `exercises/full-dapp-flow/src/components/VoteDialog.tsx`
- `exercises/full-dapp-flow/src/hooks/useProposal.ts` (fetch single proposal + vote record)
- `exercises/full-dapp-flow/src/components/ProposalCard.tsx` (add vote buttons for Active proposals)

**Acceptance criteria**:
- [ ] VoteDialog opens when user clicks "Vote Yes" or "Vote No" on an Active proposal
- [ ] Dialog shows: proposal title, current vote counts, confirmation message ("You are voting YES/NO. This cannot be undone.")
- [ ] "Confirm Vote" button submits `program.methods.vote(voteYes).accounts({...}).rpc()` with correct PDAs
- [ ] Three states: idle → pending (spinner + "Confirming...") → result (toast or error)
- [ ] "Cancel" button closes dialog without submitting
- [ ] After confirmation: refetch proposal (updated vote counts), update votedMap, close dialog, success toast
- [ ] Error handling: NotActive (6002), already voted (account exists), wallet rejection, insufficient SOL
- [ ] Accessibility: focus trap, `aria-modal`, `role="dialog"`, Escape to close, focus returns to trigger
- [ ] Vote buttons hidden if user already voted — show "Voted Yes" or "Voted No" instead
- [ ] Build passes, vote flow tested on devnet

**Estimated complexity**: High

---

## Phase 7: Lifecycle Actions

**Description**: Implement Activate and Close buttons on ProposalCard based on proposal state and connected wallet authority (creator vs. voter).

**Files to create/modify**:
- `exercises/full-dapp-flow/src/components/ProposalCard.tsx` (add lifecycle action buttons)
- `exercises/full-dapp-flow/src/hooks/useTransaction.ts` (reuse for activate/close)

**Acceptance criteria**:
- [ ] Draft state + creator: shows "Activate" button + "Cancel" (close) button
- [ ] Draft state + non-creator: read-only (no action buttons)
- [ ] Active state + creator: shows "Close" button
- [ ] Active state + non-creator: shows vote buttons (from Phase 6)
- [ ] Closed state: read-only for everyone
- [ ] Activate: `program.methods.activate().accounts({proposal, creator}).rpc()` → refetch → toast with ExplorerLink
- [ ] Close: `program.methods.close().accounts({proposal, creator}).rpc()` → refetch → toast with ExplorerLink
- [ ] Error handling: Unauthorized (6000), NotDraft (6001), NotActive (6002), AlreadyClosed (6003)
- [ ] Buttons show pending state while tx is confirming
- [ ] Build passes, activate + close tested on devnet

**Estimated complexity**: Medium

---

## Phase 8: Design Polish

**Description**: Run a hallmark-design audit on the full dApp. Verify anti-slop rules, apply Terminal theme tokens consistently, and complete an accessibility pass (keyboard nav, ARIA, contrast).

**Files to create/modify**:
- `exercises/full-dapp-flow/src/index.css` (design tokens, OKLCH colors, font imports)
- `exercises/full-dapp-flow/tailwind.config.ts` (theme extension with Terminal tokens)
- `exercises/full-dapp-flow/src/components/*.tsx` (polish all components)
- `exercises/full-dapp-flow/index.html` (font loading, meta tags)
- `exercises/full-dapp-flow/public/favicon.svg`

**Acceptance criteria**:
- [ ] Hallmark Terminal theme applied: dark canvas (OKLCH), monospace display font + sans body font, Solana green accent
- [ ] Anti-slop check: no purple gradients, no centered-everything, no icon-tile cards, no AI nav, no single-font
- [ ] Asymmetric layout: proposal list 70% width, controls sidebar 30% on desktop; stacks vertically on mobile
- [ ] 4pt spacing scale enforced (all padding/margins multiples of 4px)
- [ ] Exponential ease-out motion with `prefers-reduced-motion` fallback
- [ ] WCAG 2.1 AA: keyboard navigation through all interactive elements, focus visible, ARIA labels on all controls
- [ ] Color contrast ≥ 4.5:1 for text, state indicators use icon + text (not color-only)
- [ ] Loading states use skeletons (not spinners), empty states have actionable CTAs
- [ ] Custom favicon (not default Vite)
- [ ] Browser console shows 0 errors

**Estimated complexity**: Medium

---

## Phase 9: Testing

**Description**: Write unit tests for PDA derivation and decode logic, run manual devnet E2E verification, and run a Lighthouse audit on the deployed site.

**Files to create/modify**:
- `exercises/full-dapp-flow/vitest.config.ts`
- `exercises/full-dapp-flow/tests/unit/pda.test.ts`
- `exercises/full-dapp-flow/tests/unit/decode.test.ts`
- `exercises/full-dapp-flow/tests/unit/StateBadge.test.tsx`
- `exercises/full-dapp-flow/tests/unit/ExplorerLink.test.tsx`
- `exercises/full-dapp-flow/package.json` (add test scripts)

**Acceptance criteria**:
- [ ] `vitest.config.ts` configured with jsdom environment
- [ ] `pda.test.ts`: PDA derivation matches expected addresses for all 3 account types
- [ ] `decode.test.ts`: account buffer decoding produces correct field values
- [ ] `StateBadge.test.tsx`: renders correct label + icon for Draft, Active, Closed
- [ ] `ExplorerLink.test.tsx`: URL generation includes `?cluster=devnet`
- [ ] `npm test` passes with 0 failures
- [ ] Manual devnet E2E: create → activate → vote → close, each verified on Solana Explorer
- [ ] Manual devnet E2E: double-vote rejection handled gracefully
- [ ] Manual devnet E2E: non-creator cannot activate/close
- [ ] Responsive test: 320px, 768px, 1024px, 1440px — no horizontal scroll
- [ ] Keyboard test: Tab through all elements, Enter/Space to activate, focus visible
- [ ] Lighthouse audit (after deploy): Performance ≥ 80, Accessibility ≥ 90

**Estimated complexity**: Medium

---

## Phase 10: Cloudflare Deployment

**Description**: Build the production bundle, deploy to Cloudflare Pages via `wrangler pages deploy`, set environment variables, and verify the live URL.

**Files to create/modify**:
- `exercises/full-dapp-flow/wrangler.toml` (optional config)
- `exercises/full-dapp-flow/package.json` (add deploy script)
- `exercises/full-dapp-flow/.env.production` (or set in Cloudflare dashboard)

**Acceptance criteria**:
- [ ] `npm run build` produces `dist/` with 0 errors
- [ ] `npx wrangler pages deploy dist/ --project-name proposal-dapp` succeeds
- [ ] Live `*.pages.dev` URL returns the dApp
- [ ] Environment variables set: `VITE_RPC_ENDPOINT`, `VITE_PROGRAM_ID`, `VITE_NETWORK`
- [ ] SPA routing works: direct navigation to deep links does not 404
- [ ] Wallet connects from the deployed site (Phantom/Solflare)
- [ ] A proposal created from the deployed site appears on Solana Explorer
- [ ] HTTPS is automatic (no cert config needed)
- [ ] Lighthouse audit on deployed URL: Performance ≥ 80, Accessibility ≥ 90

**Estimated complexity**: Low

---

## Phase 11: README + Documentation

**Description**: Write a comprehensive README with setup guide, environment variables, local dev instructions, deployment steps, and Explorer verification guide. Ensure reproducibility.

**Files to create/modify**:
- `exercises/full-dapp-flow/README.md`
- `progress/assignments.md` (mark Exercise 7 progress)
- `progress/weekly-log.md` (update with Exercise 7 completion)

**Acceptance criteria**:
- [ ] README documents: what the dApp does, program ID, network, PDA seeds
- [ ] README documents: local dev setup (`npm install`, `.env.local`, `npm run dev`)
- [ ] README documents: Cloudflare deployment steps (`npm run build`, `wrangler pages deploy`)
- [ ] README documents: environment variables table (name, value, purpose)
- [ ] README documents: Explorer verification guide (how to verify txs on devnet)
- [ ] README documents: tech stack with pinned versions
- [ ] A new developer can clone, install, run, and deploy by following the README alone
- [ ] `progress/assignments.md` updated with Exercise 7 status

**Estimated complexity**: Low

---

## Checkpoints

### Checkpoint A — Scaffold Ready (after Phase 1)
- [ ] Vite app builds cleanly with `npm run build`
- [ ] Tailwind + shadcn/ui configured
- [ ] No dependency conflicts

### Checkpoint B — Wallet Connected (after Phase 2)
- [ ] Wallet connects (Phantom/Solflare)
- [ ] Pubkey displays correctly
- [ ] Build passes

### Checkpoint C — Program Integrated (after Phase 3)
- [ ] IDL loaded, Program instance typed
- [ ] PDA derivation verified against known addresses
- [ ] Build passes

### Checkpoint D — Proposals Visible (after Phase 4)
- [ ] Proposal list loads from devnet
- [ ] Proposals display with correct state, vote counts, creator
- [ ] Explorer links work

### Checkpoint E — Full CRUD Working (after Phases 5-7)
- [ ] Create proposal → appears in list
- [ ] Activate proposal → state changes Draft → Active
- [ ] Vote on proposal → counts update
- [ ] Close proposal → state changes to Closed
- [ ] All transactions verified on Solana Explorer

### Checkpoint F — Production Ready (after Phases 8-9)
- [ ] Design polish complete (anti-slop, accessibility)
- [ ] Unit tests pass
- [ ] Manual E2E on devnet passes

### Checkpoint G — Deployed (after Phases 10-11)
- [ ] Cloudflare Pages live URL works
- [ ] README complete and reproducible
- [ ] Lighthouse scores meet targets

---

## /plan to /build Gate

Before moving from planning to implementation:
- [ ] Human reviews and approves this plan
- [ ] SPEC.md reviewed and approved
- [ ] RPC endpoint confirmed (public devnet or Helius)
- [ ] Cloudflare deployment method confirmed (CLI or git-integrated CI)
- [ ] Package versions approved and will be pinned

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `getProgramAccounts` rate-limited on devnet | Medium — proposal list doesn't load | Use memcmp filter on discriminator. Retry with backoff. Switch to Helius RPC via env var. |
| wallet-adapter + Anchor peer dependency conflicts | Medium — build fails | Pin exact versions. Verify with `npm ls`. Use versions from SPEC.md. |
| PDA seed mismatch (proposal_id as u64 le bytes) | High — transactions fail | Use `new BN(id).toArrayLike(Buffer, "le", 8)`. Verify against Anchor test output before UI work. |
| CORS issues from Cloudflare edge | Medium — RPC calls fail | Use Helius RPC if public devnet has CORS issues. Test minimal deploy first. |
| Cloudflare build fails in CI (if git-integrated) | Low — deployment delayed | Test `npm run build` locally first. Use Vite framework preset. Match Node.js version. |
| VoteRecord PDA already exists (double vote) | Low — tx fails | Check votedMap before showing vote buttons. Handle error gracefully if tx still fails. |

---

## Open Decisions

1. **RPC endpoint**: Public devnet (`https://api.devnet.solana.com`) or Helius? Start with public, switch if rate-limited.
2. **Cloudflare deployment method**: `wrangler pages deploy` CLI or git-integrated CI? Start with CLI for speed.
3. **Akash stretch goal**: Skip unless user explicitly requests. Dockerfile can be added later without affecting Cloudflare deploy.
4. **Font choice**: JetBrains Mono or IBM Plex Mono for display face? Either works with Terminal theme.

---

*Plan created: 2026-06-23*
*Replaces: previous counter-pda-based plan*
*Backend: Proposal state machine (Exercise 5), Program ID: 8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG*
*Design system: Hallmark Terminal theme + Data Display macrostructure*
