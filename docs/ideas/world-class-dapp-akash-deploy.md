# World-Class Solana dApp Frontend + Akash Deployment (Exercise 7 Refined)

## Problem Statement

How might we build a production-quality React frontend for the proposal state machine program (Exercise 5) that matches the UX standard of top Solana dApps like Jupiter and Magic Eden, while deploying it on Akash Network (decentralized cloud) instead of traditional hosting?

## Recommended Direction

Build a Vite + React + TypeScript dApp frontend for the proposal state machine program (`8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`), using Tailwind CSS + shadcn/ui for design system quality, `@solana/wallet-adapter-react` for wallet connection, and `@coral-xyz/anchor` for on-chain program interaction. Deploy the built static assets via a Docker + nginx container on Akash Network using an SDL configuration.

The frontend will surface all four program instructions (create_proposal, activate, vote, close) with a proposal-list dashboard, proposal detail view, vote casting, and state transition controls. The design will meet WCAG 2.1 AA accessibility standards, be fully responsive (320px–1440px+), and follow a consistent design system with semantic color tokens, proper heading hierarchy, and keyboard navigation.

Akash deployment uses a Docker image (`nginx:1.25.3-alpine`) serving the Vite-built `dist/` folder, with an SDL specifying minimal compute resources (0.5 CPU, 512Mi RAM, 1Gi storage). The credit card trial path (24h limit, $100 free credits) is sufficient for bootcamp demonstration. Wallet-funded deployment is the fallback for longer uptime.

## Key Assumptions to Validate

- [ ] **Assumption 1:** Vite is the right choice over Next.js for this dApp — validate by confirming no SSR/SEO requirements exist (wallet-connected apps are client-side by nature). Test: confirm the dApp has no public landing page SEO needs.
- [ ] **Assumption 2:** `@solana/wallet-adapter-react` is preferred over framework-kit (`@solana/react-hooks`) for this bootcamp stage — validate by checking community documentation density and compatibility with `@coral-xyz/anchor` TS client. Test: verify wallet-adapter works with Anchor's `Program` class.
- [ ] **Assumption 3:** Tailwind + shadcn/ui provides sufficient design system quality without a custom design system — validate by building one component (proposal card) and checking it against the frontend-ui-engineering skill's anti-AI-aesthetic checklist. Test: does it avoid purple gradients, oversized rounding, and stock layouts?
- [ ] **Assumption 4:** Akash credit card trial (24h, $100 credits) is sufficient for bootcamp submission and demonstration — validate by estimating compute cost for a minimal nginx static serving deployment. Test: calculate cost per hour for 0.5 CPU / 512Mi on Akash.
- [ ] **Assumption 5:** The proposal state machine IDL and devnet program are stable and won't require redeployment during frontend development — validate by confirming no pending program changes. Test: check if Exercise 5 is marked complete in assignments.md.
- [ ] **Assumption 6:** The existing plan's 4-phase structure (scaffold → wallet/program → read/write → polish) can be extended rather than rewritten — validate by mapping new requirements (Akash, proposal backend, quality bar) to existing tasks. Test: does each new requirement fit into an existing phase or need a new one?

## MVP Scope

### In Scope

1. **Frontend scaffold**: Vite + React + TypeScript + Tailwind CSS + shadcn/ui in `exercises/full-dapp-flow/`
2. **Wallet connection**: `@solana/wallet-adapter-react` with Phantom + Solflare, devnet config, wallet modal UI
3. **Program integration**: Load proposal state machine IDL, instantiate Anchor `Program`, derive Proposal and VoteRecord PDAs
4. **Read state**: Fetch all proposals (via ProposalCounter + iteration or `getProgramAccounts` with filters), display proposal list with state, vote counts, creator
5. **Write transactions**: All 4 instructions — create_proposal (form: title input), activate (button, creator-only), vote (yes/no buttons), close (button, creator-only)
6. **UX quality**: Loading skeletons, error states, empty states, transaction pending indicators, Explorer links for every tx, toast notifications
7. **Accessibility**: WCAG 2.1 AA — keyboard navigation, ARIA labels, focus management, color contrast 4.5:1, semantic HTML
8. **Responsive design**: Mobile-first, tested at 320px, 768px, 1024px, 1440px
9. **Akash deployment**: Dockerfile (nginx serving dist/), SDL config, deployment to Akash via Console API (credit card) or CLI (wallet-funded)
10. **Documentation**: README with program ID, PDA seeds, local dev instructions, Akash deployment steps, Explorer verification guide

### Out of Scope (Not Doing)

- **Next.js / SSR** — wallet-connected dApps are client-side; SSR adds complexity without benefit. Reason: no SEO requirements for a bootcamp exercise.
- **framework-kit (`@solana/react-hooks`)** — newer SDK with less community documentation than wallet-adapter. Reason: bootcamp learning value is higher with the established wallet-adapter pattern; framework-kit can be explored later.
- **Custom design system from scratch** — shadcn/ui + Tailwind provides production-quality components with accessibility built in. Reason: building a design system from scratch is a separate project; shadcn/ui avoids the AI aesthetic while meeting quality bars.
- **Backend API server** — the dApp reads directly from Solana devnet via RPC. Reason: no need for a server between the frontend and the on-chain program.
- **Mainnet deployment** — bootcamp rules require devnet only. Reason: regulatory and financial risk; devnet is the correct environment for learning.
- **Persistent Akash deployment** — trial 24h is sufficient for submission; wallet-funded long-term hosting is optional. Reason: the goal is to demonstrate Akash deployment capability, not run a production service.
- **Custom domain / TLS** — Akash provides a URI on deployment; custom domain setup is out of scope. Reason: adds DNS complexity without bootcamp value.
- **Tip Jar CPI integration** — Exercise 6 program exists but is not part of Exercise 7. Reason: scope discipline; Exercise 7 is about the proposal state machine frontend.
- **Internationalization (i18n)** — English only. Reason: bootcamp exercise, not a production product.
- **Dark mode toggle** — use a single dark theme (Solana dApp convention) or light theme, not both. Reason: scope discipline; one well-designed theme beats two rushed ones.

## Feasibility Assessment

**Verdict: FEASIBLE with one challenging component**

The frontend build is standard React + Anchor work — the wallet-adapter + Anchor `Program` pattern is well-documented and the IDL is already generated. The proposal state machine has 4 instructions and 3 account types, which maps cleanly to a CRUD-like UI (create, read list, read detail, update state, vote).

The challenging component is **Akash deployment**. It requires:
1. A Dockerfile that builds the Vite app and serves it with nginx
2. An SDL configuration specifying compute resources and pricing
3. Akash account setup (credit card trial or wallet-funded with AKT)
4. Certificate creation and manifest submission via `provider-services` CLI or Console API

This is DevOps work the user hasn't done before, but the Akash skill provides complete SDL templates and CLI commands. The 24-hour trial limit is the main constraint — the deployment must be done close to submission time, not days in advance.

**Risk level: Medium** — frontend is low risk, Akash deployment is medium risk (new tooling, trial limits).

## Top 5 Risks and Mitigations

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|------------|------------|
| 1 | **Akash trial deployment expires (24h limit) before submission/review** | High — site goes offline | Medium | Deploy within 24h of submission. Have wallet-funded deployment path ready as fallback. Document redeployment steps in README. |
| 2 | **`getProgramAccounts` is slow or rate-limited on devnet for fetching all proposals** | Medium — proposal list doesn't load | Medium | Use filters (memcmp on discriminator) to reduce response size. Implement pagination. Cache results client-side. Fallback: manual PDA derivation from ProposalCounter + known creator addresses. |
| 3 | **wallet-adapter + Anchor peer dependency version conflicts** | Medium — build fails | Low | Pin exact versions in package.json. Verify with `npm ls` after install. Use the versions from the existing plan (already tested). |
| 4 | **PDA seed mismatch between frontend and program** | High — transactions fail | Low | Derive PDAs using exact seeds from IDL: Proposal = `["proposal", creator, proposal_id_le_bytes]`, VoteRecord = `["vote", proposal, voter]`. Verify derived addresses match Anchor test output before building UI. |
| 5 | **Akash provider bid acceptance takes too long or no bids received** | Medium — deployment stuck | Low | Use competitive pricing in SDL (slightly above minimum). Have Vercel/Netlify as emergency fallback for static hosting (not ideal but ensures submission). |

## Success Criteria (Measurable)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | All 4 program instructions work from the UI | Create a proposal, activate it, vote on it, close it — each produces a verified devnet transaction visible on Solana Explorer |
| 2 | Frontend meets WCAG 2.1 AA | Lighthouse accessibility audit score >= 90; manual keyboard navigation test passes (Tab through all interactive elements); axe-core browser extension shows 0 violations |
| 3 | Responsive design works at all breakpoints | Manual test at 320px, 768px, 1024px, 1440px — no horizontal scroll, no overlapping elements, all controls accessible |
| 4 | No console errors in production build | `npm run build` produces clean `dist/`; browser console shows 0 errors on page load and during all transaction flows |
| 5 | Akash deployment is live and accessible | The deployed URL returns the dApp; a proposal created from the deployed site appears on Solana Explorer |
| 6 | Lighthouse performance score >= 80 | Run Lighthouse on the deployed site; score >= 80 on Performance (static site should easily achieve this) |
| 7 | README is complete and reproducible | A new developer can clone the repo, install deps, run locally, and deploy to Akash by following the README without additional context |

## Plan Audit Findings

The existing Exercise 7 plan (`tasks/plan.md`, 362 lines) and task list (`tasks/todo.md`, 60 lines) have three significant gaps that must be addressed before proceeding to `/spec`:

### Gap 1: Backend Program (Critical)

**Current state:** Plan uses `counter-pda` (Exercise 2) as the backend with `initialize` and `increment` instructions. Plan explicitly states: "Because Exercise 5 (proposal state machine) is not yet implemented, this dApp uses the counter-pda program as the fallback backend."

**Required change:** Switch to the proposal state machine program (Exercise 5, deployed at `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`). This affects:
- **Task 4 (Load IDL):** Copy `proposal_state_machine.json` IDL instead of `counter_pda.json`. PDA derivation changes from `["counter", user]` to `["proposal", creator, proposal_id]` and `["vote", proposal, voter]`.
- **Task 5 (Read state):** Instead of fetching a single counter, fetch all proposals (via `getProgramAccounts` with memcmp filter on discriminator) and render a list. This is a significantly different data fetching pattern.
- **Task 6 (Initialize):** Replaced by `create_proposal` — needs a form with title input, not just a button. Calls `program.methods.createProposal(title).accounts({...}).rpc()`.
- **Task 7 (Increment):** Replaced by three instructions: `activate`, `vote`, and `close`. Each has different access control (creator-only for activate/close, anyone for vote). UI needs conditional rendering based on proposal state and connected wallet.
- **Decision table (line 11):** Update backend choice from counter-pda to proposal state machine.
- **Dependency graph (lines 20-48):** Update program ID, IDL path, and seed references.
- **Open Decision 3 (line 362):** Remove — migration is no longer future work; it's the plan.

### Gap 2: Akash Deployment (Critical)

**Current state:** No mention of Akash Network, Docker, or any deployment target beyond local dev server. The plan ends at Task 9 (build + document) with no deployment phase.

**Required change:** Add a new Phase 5 (Deployment) with tasks for:
- Dockerfile creation (multi-stage: node build → nginx serve)
- SDL configuration (nginx:1.25.3-alpine, 0.5 CPU, 512Mi RAM, 1Gi storage, port 80)
- Akash account setup (credit card trial via Console API or wallet-funded via CLI)
- Deployment execution (certificate creation, deployment creation, manifest send, lease verification)
- Post-deployment verification (URL accessible, tx from deployed site verified on Explorer)
- README section for Akash deployment steps

### Gap 3: Frontend Quality Bar (Moderate)

**Current state:** Plan mentions "loading indicators, error messages" in Task 8 but does not define a quality standard. Styling approach is an open decision (plain CSS vs Tailwind). No mention of accessibility, responsive design, or design system.

**Required change:**
- **Resolve Open Decision 2 (styling):** Choose Tailwind CSS + shadcn/ui. Document rationale in the plan.
- **Task 8 expansion:** Add explicit acceptance criteria for: WCAG 2.1 AA compliance (Lighthouse >= 90, keyboard nav, ARIA labels), responsive design (320px–1440px), empty/error/loading states for all data views, semantic color tokens (no raw hex), consistent spacing scale.
- **New Task (component architecture):** Define component structure — ProposalList, ProposalCard, ProposalDetail, VoteButtons, CreateProposalForm, WalletButton, ExplorerLink. Follow frontend-ui-engineering skill's composition patterns.

### Minor Updates Needed

- **Program ID references:** Change from `Box6VnMVRFpCsGJbfkVr6JGS1sHuLeJbVv3Yq3R9CtSZ` to `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG` throughout.
- **IDL path:** Change from `exercises/counter-pda/target/idl/counter_pda.json` to `exercises/proposal-state-machine/target/idl/proposal_state_machine.json`.
- **Risk table (lines 349-356):** Remove counter-pda-specific risks (seed mismatch with `b"counter"`). Add proposal-specific risks (getProgramAccounts performance, state transition UX complexity).
- **Gate criteria:** Add Akash deployment verification to the final checkpoint.

## Open Questions

1. **RPC endpoint:** Use public devnet RPC (`https://api.devnet.solana.com`) or a Helius/QuickNode endpoint for better rate limits? This matters more for `getProgramAccounts` calls which are heavier.
2. **Proposal list fetching strategy:** Use `getProgramAccounts` with memcmp filter on the Proposal discriminator, or derive PDAs from ProposalCounter (read counter, iterate 0..counter, derive each PDA, batch fetch)? The former is simpler but may be rate-limited; the latter is more predictable but requires N round trips.
3. **Vote UX:** Should votes require a confirmation dialog ("You are voting YES on this proposal. This cannot be undone.") or execute immediately on click? The program enforces one-vote-per-voter via VoteRecord PDA, so a second click would fail with an error anyway.
4. **Akash deployment method:** Credit card trial (Console API, 24h limit, no CLI setup) vs wallet-funded (CLI, needs AKT tokens, no time limit)? The user's devnet wallet has SOL but may not have AKT.
5. **Theme:** Single dark theme (common for Solana dApps — Jupiter, Drift use dark) or light theme? Dark theme is the convention but requires careful contrast management.

## Readiness for /spec

**Status: READY for /spec with user confirmation on open questions.**

The idea is well-defined. The plan audit identifies specific, actionable changes. The user should review this document and answer the open questions (especially #1 RPC endpoint, #2 fetching strategy, and #4 Akash method) before proceeding to specification. Once confirmed, the /spec phase can produce a detailed specification document that replaces the existing `tasks/plan.md` and `tasks/todo.md`.

---

*Document created: 2026-06-22*
*Skills used: idea-refine, solana-frontend, akash, frontend-ui-engineering, uiux-layout-advisor*
*Artifacts reviewed: tasks/plan.md (362 lines), tasks/todo.md (60 lines), proposal_state_machine.json IDL (503 lines)*