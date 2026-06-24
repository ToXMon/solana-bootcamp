# Exercise 7 — Full Dapp Flow: Task Checklist

> **Backend**: Proposal state machine (Exercise 5), Program ID: `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`
> **Network**: Solana devnet
> **Spec**: `/a0/usr/projects/solana_bootcamp/SPEC.md`
> **Design system**: Hallmark Terminal theme + Data Display macrostructure

---

## Phase 1: Project Scaffold

- [ ] Run `npm create vite@latest full-dapp-flow -- --template react-ts` in `exercises/`
- [ ] Remove nested `.git` if Vite creates one: `rm -rf exercises/full-dapp-flow/.git`
- [ ] Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Create `tailwind.config.ts` with content paths
- [ ] Create `postcss.config.js` with tailwind + autoprefixer plugins
- [ ] Add `@tailwind base; @tailwind components; @tailwind utilities;` to `src/index.css`
- [ ] Install shadcn/ui deps: `npm install class-variance-authority clsx tailwind-merge lucide-react`
- [ ] Create `src/lib/utils.ts` with `cn()` helper
- [ ] Run `npx shadcn-ui@latest init` — create `components.json`
- [ ] Add shadcn/ui components: `npx shadcn-ui@latest add button dialog badge input toast`
- [ ] Create `.env.example` with `VITE_RPC_ENDPOINT`, `VITE_PROGRAM_ID`, `VITE_NETWORK`
- [ ] Create `.gitignore` (node_modules, dist, .env.local)
- [ ] Verify: `npm run build` succeeds with no errors
- [ ] Verify: `npm run dev` starts Vite dev server

**Checkpoint A — Scaffold Ready**
- [ ] Vite app builds cleanly with `npm run build`
- [ ] Tailwind + shadcn/ui configured
- [ ] No dependency conflicts

---

## Phase 2: Wallet Integration

- [ ] Install wallet-adapter + Anchor packages (pinned versions from SPEC.md):
  - `@solana/wallet-adapter-base@^0.9.23`
  - `@solana/wallet-adapter-react@^0.15.35`
  - `@solana/wallet-adapter-react-ui@^0.9.35`
  - `@solana/wallet-adapter-wallets@^0.19.32`
  - `@coral-xyz/anchor@^0.30.1`
  - `@solana/web3.js@^1.91.8`
- [ ] Verify no peer dependency conflicts: `npm ls @solana/wallet-adapter-react @coral-xyz/anchor @solana/web3.js`
- [ ] Create `src/lib/constants.ts` with PROGRAM_ID, RPC_ENDPOINT, NETWORK from env vars
- [ ] Create `src/providers/SolanaProvider.tsx`:
  - [ ] `ConnectionProvider` with devnet RPC endpoint
  - [ ] `WalletProvider` with Phantom + Solflare adapters
  - [ ] `WalletModalProvider`
- [ ] Create `src/components/WalletButton.tsx`:
  - [ ] Disconnected: "Connect Wallet" button → opens modal
  - [ ] Connected: truncated pubkey + dropdown (disconnect, copy address)
  - [ ] Restyled to match Terminal theme (not default wallet-adapter UI)
- [ ] Wrap `App.tsx` with `SolanaProvider`
- [ ] Verify: `npm run build` passes
- [ ] Verify: Manual browser test — connect Phantom, pubkey displays

**Checkpoint B — Wallet Connected**
- [ ] Wallet connects (Phantom/Solflare)
- [ ] Pubkey displays correctly
- [ ] Build passes

---

## Phase 3: Anchor Client Setup

- [ ] Copy IDL: `exercises/proposal-state-machine/target/idl/proposal_state_machine.json` → `src/idl/`
- [ ] Create `src/lib/program.ts`:
  - [ ] Import IDL JSON
  - [ ] Create typed `Program` instance from IDL + program ID + provider
  - [ ] Export `useProgram()` hook or program getter
- [ ] Create `src/lib/pda.ts`:
  - [ ] `deriveProposalCounterPDA()` — seeds: `["proposal_counter"]`
  - [ ] `deriveProposalPDA(creator, proposalId)` — seeds: `["proposal", creator, proposalId_le_bytes]`
  - [ ] `deriveVoteRecordPDA(proposal, voter)` — seeds: `["vote", proposal, voter]`
- [ ] Create `src/types/index.ts`:
  - [ ] `ProposalData` type (creator, proposal_id, title, state, yes_votes, no_votes, bump)
  - [ ] `ProposalState` type ("Draft" | "Active" | "Closed")
  - [ ] `VoteRecordData` type (proposal, voter, vote_yes, bump)
- [ ] Verify PDA derivation matches Anchor test output or Solana CLI
- [ ] Verify: `npm run build` passes with IDL imported

**Checkpoint C — Program Integrated**
- [ ] IDL loaded, Program instance typed
- [ ] PDA derivation verified against known addresses
- [ ] Build passes

---

## Phase 4: Proposal List

- [ ] Create `src/lib/decode.ts`:
  - [ ] Helper to decode Proposal account buffer via `program.coder.accounts.decode()`
  - [ ] Helper to decode VoteRecord account buffer
- [ ] Create `src/hooks/useProposals.ts`:
  - [ ] Fetch ProposalCounter PDA → get count
  - [ ] `connection.getProgramAccounts()` with memcmp filter on Proposal discriminator
  - [ ] Decode all Proposal accounts, sort by `proposal_id` descending
  - [ ] Derive VoteRecord PDAs for each `(proposal, connectedWallet)`
  - [ ] Batch `getMultipleAccountsInfo` to check vote status
  - [ ] Return `{ proposals, votedMap, isLoading, error, refetch }`
- [ ] Create `src/components/StateBadge.tsx`:
  - [ ] Draft: Circle icon, "Draft" label, muted background
  - [ ] Active: Radio icon, "Active" label, accent background
  - [ ] Closed: Lock icon, "Closed" label, faded background
  - [ ] Icon + text always present (WCAG — not color-only)
  - [ ] Monospace, uppercase, tracking-wide
- [ ] Create `src/components/ExplorerLink.tsx`:
  - [ ] Generates `https://explorer.solana.com/{type}/{value}?cluster=devnet`
  - [ ] Truncated label (first 4 + last 4 chars)
  - [ ] External link icon, `target="_blank"`, `rel="noopener noreferrer"`
- [ ] Create `src/components/ProposalCard.tsx`:
  - [ ] Title, StateBadge, proposal ID (#001 format, monospace)
  - [ ] Creator address (truncated + ExplorerLink)
  - [ ] Vote counts: Yes (accent), No (muted), with ratio bar
  - [ ] Props: `proposal`, `hasVoted`, `voteChoice`, `isCreator`, `onRefetch`
- [ ] Create `src/components/ProposalList.tsx`:
  - [ ] Uses `useProposals` hook
  - [ ] Loading state: skeleton cards (not spinners)
  - [ ] Empty state: "No proposals yet. Create the first one."
  - [ ] Error state: error message + retry button
  - [ ] Proposal count header in monospace ("3 Proposals")
  - [ ] Renders `ProposalCard` for each proposal
- [ ] Add `ProposalList` to `App.tsx`
- [ ] Verify: proposals load from devnet, display correctly
- [ ] Verify: no console errors

**Checkpoint D — Proposals Visible**
- [ ] Proposal list loads from devnet
- [ ] Proposals display with correct state, vote counts, creator
- [ ] Explorer links work

---

## Phase 5: Create Proposal

- [ ] Add shadcn/ui `toast` and `toaster` components if not already added
- [ ] Create `src/hooks/useTransaction.ts`:
  - [ ] Generic tx submit + confirm + toast helper
  - [ ] Returns `{ mutate, isPending, error }`
  - [ ] Success toast with ExplorerLink, error toast with human-readable message
- [ ] Create `src/components/CreateProposalForm.tsx`:
  - [ ] `<label>` with `htmlFor`, `<input>` with `id`
  - [ ] `aria-describedby` for char counter, `aria-invalid` on error
  - [ ] Client-side validation: max 64 characters
  - [ ] Character counter in monospace (`42 / 64`)
  - [ ] Submit button disabled when: empty, over 64 chars, no wallet, or pending
  - [ ] On submit: derive counter PDA + proposal PDA (current count as proposal_id)
  - [ ] Call `program.methods.createProposal(title).accounts({...}).rpc()`
  - [ ] After confirm: optimistic prepend, refetch single proposal, success toast
  - [ ] Error handling: TitleTooLong (6004), wallet rejection, insufficient SOL
  - [ ] Input clears after success
- [ ] Add `CreateProposalForm` to `App.tsx`
- [ ] Verify: create a proposal on devnet, appears in list, tx visible on Explorer

---

## Phase 6: Voting Flow

- [ ] Create `src/hooks/useProposal.ts`:
  - [ ] Fetch single proposal by PDA
  - [ ] Check VoteRecord for connected wallet
  - [ ] Return `{ proposal, hasVoted, voteChoice, refetch }`
- [ ] Create `src/components/VoteDialog.tsx`:
  - [ ] Built on shadcn/ui `Dialog` (Radix UI primitives)
  - [ ] Shows proposal title + current vote counts
  - [ ] Confirmation message: "You are voting YES/NO. This cannot be undone."
  - [ ] "Confirm Vote" button → submits `program.methods.vote(voteYes).accounts({...}).rpc()`
  - [ ] States: idle → pending (spinner + "Confirming...") → result
  - [ ] "Cancel" button closes without submitting
  - [ ] After confirm: refetch proposal, update votedMap, close dialog, toast
  - [ ] Error handling: NotActive (6002), already voted, wallet rejection, insufficient SOL
  - [ ] Accessibility: focus trap, `aria-modal`, `role="dialog"`, Escape to close, focus return
- [ ] Update `ProposalCard.tsx`:
  - [ ] Active + non-creator: show "Vote Yes" + "Vote No" buttons
  - [ ] If already voted: show "Voted Yes" or "Voted No" (disabled)
  - [ ] Vote buttons open `VoteDialog`
- [ ] Verify: vote on devnet, counts update, tx visible on Explorer
- [ ] Verify: double-vote rejection handled gracefully

---

## Phase 7: Lifecycle Actions

- [ ] Update `ProposalCard.tsx` with lifecycle buttons:
  - [ ] Draft + creator: "Activate" button + "Cancel" (close) button
  - [ ] Draft + non-creator: read-only
  - [ ] Active + creator: "Close" button
  - [ ] Active + non-creator: vote buttons (from Phase 6)
  - [ ] Closed: read-only for everyone
- [ ] Activate flow:
  - [ ] Derive Proposal PDA (seeds: `["proposal", creator, proposalId_le]`)
  - [ ] Call `program.methods.activate().accounts({proposal, creator}).rpc()`
  - [ ] After confirm: refetch proposal, toast with ExplorerLink
  - [ ] Error handling: Unauthorized (6000), NotDraft (6001)
- [ ] Close flow:
  - [ ] Derive Proposal PDA
  - [ ] Call `program.methods.close().accounts({proposal, creator}).rpc()`
  - [ ] After confirm: refetch proposal, toast with ExplorerLink
  - [ ] Error handling: Unauthorized (6000), AlreadyClosed (6003)
- [ ] Buttons show pending state while tx confirming
- [ ] Verify: activate + close on devnet, state changes on Explorer
- [ ] Verify: non-creator cannot activate/close

**Checkpoint E — Full CRUD Working**
- [ ] Create proposal → appears in list
- [ ] Activate proposal → state changes Draft → Active
- [ ] Vote on proposal → counts update
- [ ] Close proposal → state changes to Closed
- [ ] All transactions verified on Solana Explorer

---

## Phase 8: Design Polish

- [ ] Apply Hallmark Terminal theme tokens:
  - [ ] Dark canvas: OKLCH warm-neutral dark (not pure black)
  - [ ] Display font: monospace (JetBrains Mono or IBM Plex Mono)
  - [ ] Body font: system UI sans-serif stack
  - [ ] Accent: Solana green (OKLCH), single anchor hue
  - [ ] Load fonts in `index.html`
- [ ] Update `tailwind.config.ts` with Terminal theme tokens (OKLCH colors)
- [ ] Anti-slop verification:
  - [ ] No purple-to-blue gradients
  - [ ] No single-font design (monospace + sans paired)
  - [ ] No centered-everything (asymmetric layout)
  - [ ] No icon-tile feature cards
  - [ ] No AI nav pattern
- [ ] Asymmetric layout: proposal list 70% / controls sidebar 30% on desktop
- [ ] Mobile: stacks vertically, full width
- [ ] 4pt spacing scale enforced (all padding/margins multiples of 4px)
- [ ] Motion: exponential ease-out `cubic-bezier(0.16, 1, 0.3, 1)` with `prefers-reduced-motion` fallback
- [ ] Accessibility pass:
  - [ ] Keyboard navigation through all interactive elements
  - [ ] Focus visible on all controls
  - [ ] ARIA labels on all buttons/inputs
  - [ ] Color contrast ≥ 4.5:1 for text
  - [ ] State indicators use icon + text (not color-only)
- [ ] Loading states: skeletons (not spinners)
- [ ] Empty states: actionable CTAs
- [ ] Custom favicon (not default Vite)
- [ ] Verify: browser console shows 0 errors

**Checkpoint F — Production Ready**
- [ ] Design polish complete (anti-slop, accessibility)
- [ ] Unit tests pass (Phase 9)
- [ ] Manual E2E on devnet passes (Phase 9)

---

## Phase 9: Testing

- [ ] Install test deps: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Create `vitest.config.ts` with jsdom environment
- [ ] Add test scripts to `package.json`: `test`, `test:watch`, `test:coverage`
- [ ] Write `tests/unit/pda.test.ts`:
  - [ ] `deriveProposalCounterPDA()` returns expected address
  - [ ] `deriveProposalPDA(creator, id)` returns expected address
  - [ ] `deriveVoteRecordPDA(proposal, voter)` returns expected address
- [ ] Write `tests/unit/decode.test.ts`:
  - [ ] Proposal buffer decodes to correct fields
  - [ ] VoteRecord buffer decodes to correct fields
- [ ] Write `tests/unit/StateBadge.test.tsx`:
  - [ ] Renders "Draft" with Circle icon
  - [ ] Renders "Active" with Radio icon
  - [ ] Renders "Closed" with Lock icon
- [ ] Write `tests/unit/ExplorerLink.test.tsx`:
  - [ ] URL includes `?cluster=devnet`
  - [ ] Renders truncated label
- [ ] Run `npm test` — 0 failures
- [ ] Manual devnet E2E:
  - [ ] Create proposal → verify on Explorer
  - [ ] Activate proposal → verify on Explorer
  - [ ] Vote Yes/No → verify on Explorer
  - [ ] Close proposal → verify on Explorer
  - [ ] Try double-vote → error handled
  - [ ] Try activate as non-creator → error handled
- [ ] Responsive test: 320px, 768px, 1024px, 1440px — no horizontal scroll
- [ ] Keyboard test: Tab through all elements, Enter/Space to activate, focus visible

---

## Phase 10: Cloudflare Deployment

- [ ] Verify `npm run build` produces `dist/` with 0 errors
- [ ] Install wrangler: `npm install -D wrangler`
- [ ] (Optional) Create `wrangler.toml`:
  ```toml
  name = "proposal-dapp"
  compatibility_date = "2024-09-01"
  pages_build_output_dir = "dist"
  ```
- [ ] Deploy: `npx wrangler pages deploy dist/ --project-name proposal-dapp`
- [ ] Set environment variables in Cloudflare dashboard:
  - [ ] `VITE_RPC_ENDPOINT` = `https://api.devnet.solana.com`
  - [ ] `VITE_PROGRAM_ID` = `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`
  - [ ] `VITE_NETWORK` = `devnet`
- [ ] Verify: `*.pages.dev` URL returns the dApp
- [ ] Verify: SPA routing — direct navigation to deep links doesn't 404
- [ ] Verify: wallet connects from deployed site
- [ ] Verify: create a proposal from deployed site, appears on Explorer
- [ ] Run Lighthouse on deployed URL: Performance ≥ 80, Accessibility ≥ 90

**Checkpoint G — Deployed**
- [ ] Cloudflare Pages live URL works
- [ ] Lighthouse scores meet targets

---

## Phase 11: README + Documentation

- [ ] Write `exercises/full-dapp-flow/README.md`:
  - [ ] What the dApp does (proposal voting frontend)
  - [ ] Program ID: `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`
  - [ ] Network: devnet
  - [ ] PDA seeds: ProposalCounter, Proposal, VoteRecord
  - [ ] Local dev setup: `npm install`, `.env.local`, `npm run dev`
  - [ ] Environment variables table (name, value, purpose)
  - [ ] Cloudflare deployment: `npm run build`, `wrangler pages deploy`
  - [ ] Explorer verification guide (how to verify txs on devnet)
  - [ ] Tech stack with pinned versions
- [ ] Update `progress/assignments.md` with Exercise 7 status
- [ ] Update `progress/weekly-log.md` with Exercise 7 completion
- [ ] Verify: README is reproducible — a new dev can clone, install, run, deploy

---

## /plan to /build Gate

Do not move to implementation until:
- [ ] Human reviews and approves this plan
- [ ] SPEC.md reviewed and approved
- [ ] RPC endpoint confirmed (public devnet or Helius)
- [ ] Cloudflare deployment method confirmed (CLI or git-integrated CI)
- [ ] Package versions approved and will be pinned

---

## Open Decisions

1. **RPC endpoint**: Public devnet (`https://api.devnet.solana.com`) or Helius? Start with public, switch if rate-limited.
2. **Cloudflare deployment method**: `wrangler pages deploy` CLI or git-integrated CI? Start with CLI for speed.
3. **Akash stretch goal**: Skip unless user explicitly requests. Dockerfile can be added later.
4. **Font choice**: JetBrains Mono or IBM Plex Mono for display face? Either works with Terminal theme.

---

*Checklist created: 2026-06-23*
*Replaces: previous counter-pda-based checklist*
*Backend: Proposal state machine (Exercise 5), Program ID: 8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG*
