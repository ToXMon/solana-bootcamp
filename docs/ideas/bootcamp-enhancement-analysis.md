# Bootcamp Enhancement Analysis: solana-foundation/solana-bootcamp-2026

## Problem Statement

How might we selectively integrate materials from the Solana Foundation's official 2026 bootcamp repository to fill gaps in the Encode Club bootcamp curriculum — specifically in ZK privacy, DeFi AMM mechanics, production frontend tooling, and payment protocol integration — without disrupting the current learning trajectory or causing toolchain conflicts?

## Recommended Direction

The recommended direction is **selective supplementation**: treat the SF repo as an advanced reference library, not a replacement curriculum. The user should cherry-pick 3-4 modules that cover concepts entirely absent from the Encode Club bootcamp, and use them as post-bootcamp deep-dive projects or Week 5-6 stretch goals.

The SF repo and the Encode Club bootcamp overlap significantly in foundational territory (PDAs, CPIs, Token-2022 basics). Where they diverge is in advanced, production-oriented topics: zero-knowledge proofs (module 05), AMM math with oracle integration (module 07), HTTP 402 payment protocols (module 08), and full-stack dApp architecture with Codama codegen (module 11). These are not beginner topics — they assume the foundational skills the user has already built through Weeks 1-4.

The critical caveat is toolchain divergence. The SF repo uses Anchor v1.0.0-rc.2, LiteSVM for testing, Codama for client codegen, and framework-kit for frontends. The user's environment is pinned to Anchor v0.31.0 with local validator testing and web3.js v2. Attempting to run SF modules as-is would require either a separate environment or a migration effort that could derail bootcamp progress. The pragmatic path is to study the SF modules for conceptual understanding and architecture patterns, then implement simplified versions using the user's existing toolchain.

## Key Assumptions to Validate

- [ ] The SF repo modules can be studied conceptually without running them locally — test by reading module 07's StableSwap math and verifying you understand the invariant without building the project
- [ ] The Encode Club bootcamp Weeks 5-6 will not already cover ZK proofs, AMMs, or payment protocols — test by checking the bootcamp syllabus or asking instructors about remaining topics
- [ ] The Anchor v0.31.0 to v1.0.0-rc.2 migration is non-trivial enough to avoid mid-bootcamp — test by attempting to build module 03-voting (simplest module) with v0.31.0 and documenting breakages
- [ ] The user's Week 4 frontend work would benefit from seeing the SF repo's Codama + framework-kit pattern — test by reviewing the 11-prediction-market LECTURE_PLAN.md and assessing whether the codegen concept is immediately applicable
- [ ] LiteSVM testing provides meaningful advantages over local validator testing for the user's workflow — test by reading the 06-stablecoin test setup and comparing test execution speed claims

## MVP Scope

**In:**
- Read and study 3 SF modules as reference material: 05-private-transfers (ZK concepts), 07-stableswap (AMM math + oracles), 11-prediction-market (full-stack architecture)
- Extract architecture diagrams and conceptual explanations into personal notes
- Identify 1 module to implement as a Week 5-6 capstone project using the user's existing v0.31.0 toolchain
- Document toolchain migration notes for future reference (v0.31.0 → v1.0.0 patterns)

**Out:**
- Running any SF module locally during active bootcamp weeks
- Migrating the user's existing exercises to Anchor v1.0.0-rc.2
- Replacing any Encode Club curriculum content with SF content
- Installing Noir, Sunspot, or Go runtime for module 05 during the bootcamp
- Setting up Pyth oracle accounts for module 07 during the bootcamp

## Not Doing (and Why)

- **Not installing Anchor v1.0.0-rc.2 alongside v0.31.0** — version conflicts with the `anchor` binary on PATH would break the user's active bootcamp builds. The release candidate status means API surface is still shifting. Defer until after bootcamp completion.

- **Not running module 05-private-transfers locally during the bootcamp** — requires Noir/Nargo (1.0.0-beta.13), Sunspot verifier (Go 1.24+), and Bun runtime. This is 3 new toolchains on top of an active learning environment. The conceptual value (ZK proofs, Merkle trees, nullifier sets) can be extracted from reading the instruction files and diagrams without running the code.

- **Not adopting LiteSVM as the primary test framework mid-bootcamp** — the user has established `anchor test` workflows with local validators across 6 exercises. Switching test frameworks introduces cognitive load and potential breakage. LiteSVM's speed advantage is real but not worth the disruption during active learning. File this as a post-bootcamp optimization.

- **Not adopting Codama codegen for existing exercises** — Codama generates TypeScript clients from IDLs, replacing manual `@coral-xyz/anchor` usage. This is a workflow change that affects how every frontend interaction is written. Introduce it for new projects only, not retroactively.

- **Not building module 08-x402-demo** — HTTP 402 payment protocol is a niche integration pattern (Coinbase Pay dependency) with limited learning transfer to other Solana work. The AI fortune teller framing adds complexity without pedagogical value. Skip entirely.

- **Not replacing the Encode Club curriculum with SF modules** — the Encode Club bootcamp's AI Ramp philosophy, structured weekly progression, and community accountability are more valuable for learning than self-directed repo exploration. The SF repo lacks the guided progression and feedback loop.

## Open Questions

- Will the Encode Club bootcamp Weeks 5-6 already cover any of: ZK proofs, AMMs, oracle integration, or full-stack dApp patterns? If so, the supplementation value drops significantly.
- Is there a clean way to install Anchor v1.0.0-rc.2 in isolation (e.g., Docker container) without affecting the v0.31.0 environment, for post-bootcamp experimentation?
- Does the SF bootcamp have companion video content (YouTube playlist found in search) that would accelerate conceptual learning of modules 05, 07, and 11?
- Are there community solutions for running LiteSVM tests with Anchor v0.31.0, or is it strictly a v1.0.0+ feature?
- How different is framework-kit (@solana/react-hooks) from the web3.js v2 patterns the user is learning in Week 4? If the abstraction is thin, the patterns may transfer directly.

---

## Research Findings: solana-foundation/solana-bootcamp-2026

### Repository Structure

The repo contains 11 modules, of which 9 include code and 2 are video-only:

| Module | Topic | Code | Full-Stack | Key Concepts |
|--------|-------|------|------------|--------------|
| 01-local-install | Environment setup | No | No | Toolchain installation (video only) |
| 02-hello-world | First program | No | No | Basic Anchor program (video only) |
| 03-voting | On-chain polling | Yes | No | PDAs, time-gated access, typed arguments |
| 04-escrow | Trustless token swap | Yes | No | PDA vaults, transfer_checked CPI, TokenInterface (SPL + Token-2022) |
| 05-private-transfers | ZK privacy | Yes | Yes (Anchor + backend + React) | Noir ZK circuits, Groth16 verification via Sunspot, Merkle trees, nullifier sets |
| 06-stablecoin | Token-2022 stablecoin | Yes | No | Controlled minting, per-minter allowances, emergency pause, burn mechanism |
| 07-stableswap | StableSwap AMM | Yes | No | Curve-style hybrid invariant, Newton's method, adaptive fees, Pyth oracle depeg protection |
| 08-solana-x402-demo | HTTP 402 payments | Yes | Yes (Next.js) | X402 payment protocol, Coinbase Pay, AI content gating |
| 09-solana-rwa-labubu | NFT mystery box | Yes | Yes (Next.js) | Token-2022 NFTs, weighted random minting, collection management |
| 10-indexing | Data indexing | No | No | On-chain data indexing (video only) |
| 11-prediction-market | Full-stack dApp | Yes | Yes (Next.js 16 + React 19) | PDA pool management, payout math, Codama codegen, framework-kit, 90-min structured lecture plan |

### Technical Stack (SF Repo vs Encode Club)

| Component | SF Bootcamp | Encode Club Bootcamp | Impact |
|-----------|-------------|---------------------|--------|
| Anchor version | v1.0.0-rc.2 | v0.31.0 | **Critical** — API differences, macro changes, not backward compatible |
| Testing | LiteSVM (in-process VM, no validator) | Local validator + `anchor test` | **Moderate** — different test patterns, faster execution |
| Client codegen | Codama (IDL → TypeScript) | Manual / `@coral-xyz/anchor` | **Moderate** — different frontend integration patterns |
| Frontend framework | framework-kit (@solana/react-hooks) | web3.js v2 | **Low-Moderate** — abstraction layer differences |
| Frontend stack | Next.js 16, React 19, Tailwind v4 | TBD (Week 4) | **Low** — Next.js patterns transfer |
| Package manager | Yarn / Bun / pnpm (varies by module) | Yarn | **Low** — interchangeable |

### Module-by-Module Comparison Against Completed Exercises

**Modules that overlap with completed exercises (low supplementation value):**

- **03-voting** vs Counter PDA: Both teach PDA state management with Anchor. The voting module adds time-gated access (start_time/end_time checks) and multi-account relationships (Poll → Candidate), which are incremental concepts. The user's Proposal State Machine exercise already covered more complex state transitions. **Verdict: Skip.**

- **04-escrow** vs Tip Jar CPI: Both involve CPIs and token transfers. The escrow module adds PDA-as-vault pattern, `transfer_checked` with TokenInterface (supporting both SPL and Token-2022), and account closure with rent reclamation. The TokenInterface pattern is genuinely new — the user's Tip Jar used standard SPL Token. **Verdict: Study the TokenInterface pattern, skip the rest.**

- **06-stablecoin** vs Token-2022 exercise: Both use Token Extensions. The stablecoin adds role-based access (admin vs minters), per-minter allowances, emergency pause, and burn mechanism. These are production patterns not covered in the user's basic Token-2022 exercise. **Verdict: High value as a stretch project.**

- **09-rwa-labubu** vs First Token + Token-2022: Both involve Token-2022 minting. The RWA module adds weighted random minting, collection state management, and a Next.js frontend. The random minting logic is interesting but niche. **Verdict: Low-moderate value.**

**Modules with entirely new concepts (high supplementation value):**

- **05-private-transfers**: Zero-knowledge proofs are completely absent from the Encode Club curriculum. This module covers Noir circuits, Groth16 verification, Merkle tree commitments, nullifier sets for double-spend prevention, and the off-chain/on-chain split for proof generation. The starter/main code structure and step-by-step instructions (step-0 through step-5) with diagrams make this pedagogically excellent. **Verdict: Highest conceptual value. Study instructions and diagrams.**

- **07-stableswap**: AMM mechanics are absent from the Encode Club curriculum. This module covers the Curve-style StableSwap invariant ($4 \cdot A \cdot (x + y) + D = 4 \cdot A \cdot D + D^3 / (4 \cdot x \cdot y)$), Newton's method for solving the invariant, amplification parameter tuning, adaptive fees, and Pyth oracle integration for depeg protection. **Verdict: High value for DeFi understanding.**

- **11-prediction-market**: Production full-stack dApp architecture with Codama codegen pipeline (Rust → IDL → TypeScript client), framework-kit wallet integration, polling-based state updates, and a structured 90-minute lecture plan. The LECTURE_PLAN.md is a self-contained teaching document with architecture diagrams, code walkthroughs, and security trade-off discussions. **Verdict: Highest value for Week 4 frontend work and Week 5-6 capstone.**

- **08-x402-demo**: HTTP 402 payment protocol is a niche integration pattern. **Verdict: Skip.**

### Pedagogical Approach Comparison

| Dimension | SF Bootcamp | Encode Club Bootcamp |
|-----------|-------------|---------------------|
| Structure | Video-first, project-based, self-paced | Weekly cohorts, exercise-driven, AI Ramp |
| Guidance | Starter/main code versions, step-by-step instructions | Progressive AI withdrawal, community accountability |
| Testing | LiteSVM (fast, deterministic, no validator) | Local validator (realistic, slower) |
| Frontend | Codama codegen + framework-kit (production patterns) | web3.js v2 (foundational patterns) |
| Depth | Production-ready examples with real-world patterns | Learning-oriented with conceptual foundations |
| Feedback | None (self-directed) | Community + AI guidance + assignment review |

### Key Patterns Worth Extracting

1. **TokenInterface over concrete SPL Token types** (from 04-escrow): Using `InterfaceAccount<Mint>` and `TokenInterface` makes programs work with both legacy SPL Token and Token-2022. This is a production best practice the user should adopt.

2. **LiteSVM testing approach** (from 06-stablecoin, 07-stableswap): Tests run in-process without a local validator, making them faster and more deterministic. The 06-stablecoin module has 18 tests that all pass via `cargo test`. Worth adopting post-bootcamp.

3. **Codama codegen pipeline** (from 11-prediction-market): The IDL → TypeScript client generation eliminates manual serialization and PDA derivation. The LECTURE_PLAN.md explains this pipeline clearly: `lib.rs → IDL.json → TypeScript Client`.

4. **PDA-as-vault pattern** (from 04-escrow): Using PDAs as custodial token vaults with proper closure and rent reclamation. More sophisticated than the user's Tip Jar CPI.

5. **Checked math everywhere** (from 11-prediction-market): Consistent use of `checked_add`, `checked_mul`, `checked_div` with proper error handling. The LECTURE_PLAN.md explicitly calls this out as overflow attack prevention.

6. **Starter/main code versions** (from 05-private-transfers): The module provides both a starter (scaffold with gaps) and a main (complete solution). This guided building approach is excellent for self-study.

---

## Focused Toolchain Conflict Evaluation

### Current Project Evidence

The user's active projects already show why the SF repo should not be dropped into the existing bootcamp environment:

| Local file | Observed stack / issue | Why it matters |
|------------|------------------------|----------------|
| `exercises/proposal-state-machine/package.json` | `@coral-xyz/anchor` is `^0.31.0` | This matches the Encode Club Anchor line and should stay stable through Weeks 5-6. |
| `exercises/proposal-state-machine/Anchor.toml` | Devnet program id `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`; provider cluster `Devnet`; package manager `yarn` | The deployed program and tests depend on the current Anchor CLI/client assumptions. |
| `exercises/full-dapp-flow/package.json` | Frontend uses `@coral-xyz/anchor` `^0.30.1`, `@solana/web3.js` `^1.91.8`, wallet-adapter packages, Vite/React 18 | The deployed frontend is already on a slightly different Anchor JS version than the program workspace. More drift would increase data-layer risk. |
| `exercises/full-dapp-flow/src/lib/accounts.ts` | Manual account decoding exists because the IDL has spec `0.1.0` while the Anchor JS coder expects spec `1.0.0`; `program.coder.accounts.decode('Proposal', ...)` failed with `Account not found: Proposal` | This is direct evidence that IDL/client format drift already broke account reads once. |
| `exercises/full-dapp-flow/src/lib/program.ts` | `new Program(idl as any, provider)` with wallet-adapter + AnchorProvider | The frontend data layer relies on Anchor's JS client interpretation of the IDL and provider wallet/RPC behavior. |

### Anchor v0.31.x vs v1.0.0-rc.2

The SF repo's Anchor v1.0.0-rc.2 should be treated as a separate toolchain, not an upgrade target during the Encode Club bootcamp.

Key conflict areas:

- CLI/runtime coupling: the `anchor` binary on `PATH` controls build, IDL generation, tests, and deploy behavior. Installing the RC globally could make existing v0.31.x projects fail in non-obvious ways.
- Rust crate/API drift: account constraints, token interface patterns, generated IDLs, and helper crates may expect the v1.0 RC line. Even if code compiles after edits, generated artifacts may not match the JS client the frontend uses.
- IDL compatibility: the user's proposal dApp already hit an IDL spec mismatch. Moving to a repo built around newer IDL/client assumptions increases the risk of account coder failures, missing account namespaces, generated type mismatches, and method/account naming mismatches.
- Client generation model: current projects use manual Anchor JS calls plus hand-written PDA helpers. The SF repo uses Codama-generated clients in at least the full-stack modules. That changes where PDA derivation, instruction builders, account fetchers, and TypeScript types come from.
- Frontend state model: the current Vite dApp manually fetches program accounts, decodes bytes, and refreshes state. A Codama/framework-kit app will likely hide more of this behind generated helpers and hooks. That is useful later, but dangerous mid-bootcamp because debugging moves from known code into generated abstractions.
- Version pinning: local packages currently use caret ranges (`^0.31.0`, `^0.30.1`, `^1.91.8`). For a learning project this is workable, but any serious port should pin exact versions or use a lockfile/container to avoid silent minor-version drift.

### Why the December Proposal dApp Data-Layer Pain Matters

The proposal dApp's workaround in `src/lib/accounts.ts` is the strongest signal in this analysis. The frontend could not rely on Anchor's account coder because the IDL format and JS client expectations did not line up, so it bypassed the coder and decoded account bytes directly.

That class of failure tends to affect exactly the areas the user will need for DeFi, NFTs, and hackathon apps:

- Reading accounts: `program.account.someAccount.fetch()` can fail if the IDL account name, discriminator mapping, or IDL spec version does not match what the client expects.
- Generated types: TypeScript types can compile while runtime account decoding still fails, especially when the IDL shape changes but the deployed program/account layout does not.
- PDA derivation: generated clients may derive seeds differently from hand-written helpers if seed order, endian encoding, account names, or IDL seed metadata differ.
- Wallet/RPC flows: AnchorProvider, wallet-adapter, framework-kit hooks, and raw `Connection` calls each handle commitment, signer availability, and transaction confirmation slightly differently.
- Frontend state: when account fetches fail or return stale data, the UI can show empty proposals, wrong vote state, duplicate loading, or successful transactions that do not appear until manual refresh.

For the lotto/Powerball idea, this matters even more than in a proposal app. A micro-payment lottery app needs reliable reads for ticket ownership, draw state, prize pools, randomness/settlement status, and payout eligibility. A silent data-layer mismatch is not just annoying; it can make the UI misrepresent money state.

### Codama and Framework-Kit Risk/Reward

Codama and framework-kit are worth studying, but not adopting inside existing exercises yet.

| Tool | Reward | Risk during active bootcamp | Suggested use |
|------|--------|-----------------------------|---------------|
| Codama | Generates TypeScript clients from IDL; reduces manual serializers, PDA helpers, and account fetch boilerplate | Adds a codegen step; generated clients can hide IDL drift; harder to debug before the user fully understands the raw flow | Study module 11 now. Use Codama only for a fresh sandbox or post-bootcamp project. |
| framework-kit / `@solana/react-hooks` | Cleaner wallet/RPC hooks and production frontend patterns | Another abstraction over wallet-adapter/web3.js flow; may mask provider/commitment/transaction confirmation details | Read patterns now. Keep the current Vite frontend on explicit wallet-adapter + Anchor/web3 calls. |
| LiteSVM | Fast deterministic tests without a full local validator | Different mental model from `anchor test`; may depend on Anchor v1 RC examples; less practice with validator/devnet realism | Study test structure now. Consider adopting after bootcamp for unit-style program tests. |

### Docker vs GHCR, Plainly

Docker is the tool that runs containers. Podman can also run many Docker-compatible containers. GHCR, the GitHub Container Registry, is only a place to store container images.

Plain model:

```text
Dockerfile -> image -> GHCR stores image -> Docker/Podman runs image -> isolated shell/toolchain
```

So GHCR does not replace Docker. A pinned GHCR image helps if someone publishes an image like:

```text
ghcr.io/solana-foundation/solana-bootcamp-2026:anchor-1.0.0-rc.2
```

That would let the user run the SF repo in an isolated environment without changing the local `anchor` binary. The image should pin Anchor, Solana CLI, Rust, Node/Bun/Yarn, Noir/Nargo, and any module-specific tooling.

Local installs are acceptable when:

- the module uses the same Anchor/Solana/Node major versions as the user's current projects;
- the tool is easy to remove or version-manage;
- the user is not in the middle of deadline-sensitive bootcamp work;
- the module is read-only or conceptual, not being deployed.

A container is better when:

- testing Anchor v1.0.0-rc.2;
- running SF modules with LiteSVM/Codama/framework-kit;
- installing ZK tooling such as Noir/Nargo or Sunspot;
- preserving the user's current v0.31.x bootcamp setup;
- sharing a reproducible hackathon environment later.

### Week 5-6 Strategy: DeFi, Escrow, NFTs, ZK

Given the incoming Week 5-6 focus on DeFi, escrow, DeFi, and NFTs, the best short-term path is concept-first study of SF modules that map to those topics, while keeping the current toolchain unchanged.

| Priority | SF module | Study now or defer | Reason |
|----------|-----------|--------------------|--------|
| 1 | `04-escrow` | Study now | Directly matches escrow week. Focus on PDA vaults, `transfer_checked`, account closure, and `TokenInterface` patterns. Port concepts only. |
| 2 | `07-stableswap` | Study now | Best DeFi match. Focus on AMM invariant, slippage, amplification, checked math, and oracle/depeg guardrails. Defer full implementation unless Week 5-6 requires an AMM. |
| 3 | `09-solana-rwa-labubu` | Study now if NFTs appear | Useful for Token-2022 NFT/collection patterns and weighted minting. Skip the branding/theme; extract mint/collection/account structure. |
| 4 | `06-stablecoin` | Study if DeFi time remains | Strong production patterns: mint roles, allowances, pause/burn. Useful bridge from Token-2022 to DeFi. |
| 5 | `11-prediction-market` | Read selectively | Highest frontend architecture value, but Codama/framework-kit should remain conceptual until after the current dApp stack is stable. |
| 6 | `05-private-transfers` | Defer implementation; read concepts | ZK is high-value for lotto privacy/fairness, but the tooling stack is too heavy for the next few days. |
| Skip | `08-solana-x402-demo` | Defer/skip | Less aligned with DeFi, escrow, NFTs, hackathons, and the lotto app. |

### ZK Depth Recommendation

Go deep on ZK, but in the right order.

For the Latin America lotto/Powerball idea, ZK could add value in three possible ways:

1. private participation: prove a user bought an eligible ticket without revealing all ticket metadata;
2. fair draw mechanics: combine commitments, nullifiers, randomness, and public verification so users can audit that the draw was not manipulated;
3. payout/privacy UX: prove eligibility or prevent double-claiming without exposing unnecessary user data.

However, ZK should not be the first implementation layer. The first lotto prototype should prove the ordinary Solana mechanics: micro-payments, ticket account model, draw lifecycle, randomness source assumptions, prize pool accounting, admin controls, and payout rules. Then add ZK where it solves a real trust/privacy problem.

Recommended path:

- Now: read SF module 05 instructions and diagrams for vocabulary: commitments, Merkle roots, membership proofs, nullifiers, Groth16 verifier, off-chain proof generation.
- Weeks 5-6: prioritize escrow/DeFi/NFT modules that match the curriculum.
- Post-bootcamp: build a small ZK proof-of-concept in a container before mixing it into the lotto app.
- Hackathon/open-source angle: ZK becomes a differentiator if the core app already works. A broken lottery with ZK is weaker than a working lottery with clear upgrade path to ZK privacy/fairness.

### Concrete Decision

Do not install Anchor v1.0.0-rc.2 globally. Do not migrate active v0.31.x projects. Do not retrofit Codama/framework-kit into the proposal dApp.

Recommended decision for the IDEA stage:

1. Keep the current Anchor v0.31.x toolchain for all Encode Club work and Week 5-6 assignments.
2. Use the SF repo as a reading/porting reference for escrow, StableSwap, Token-2022 stablecoin/NFTs, and prediction-market architecture.
3. If the user wants to run SF code, create a separate Docker/Podman sandbox. Prefer a pinned GHCR image if the SF repo publishes one; otherwise build a local image from a pinned Dockerfile.
4. Pin exact versions in any sandbox. Record Anchor CLI version, Solana CLI version, Rust version, Node/Bun/Yarn versions, and module commit hash.
5. For the next spec decision, choose one capstone track:
   - DeFi track: escrow + simplified StableSwap using current Anchor v0.31.x.
   - NFT track: Token-2022 collection/mystery-box pattern using current tooling.
   - Lotto track: micro-payment ticketing + prize pool first, with ZK as post-MVP privacy/fairness layer.

---

## Feasibility Assessment

### Can Run As-Is: No

The SF repo modules cannot be run in the user's current environment without modification. The primary blocker is the Anchor version mismatch (v1.0.0-rc.2 vs v0.31.0). Anchor v1.0.0 introduces breaking API changes including:
- Different macro syntax (`#[program]` → `#[program]` with changed attributes)
- `TokenInterface` requires v1.0.0 features
- LiteSVM integration (`anchor-litesvm`) is a v1.0.0 feature
- Different account constraint syntax in some cases

### Can Study Conceptually: Yes

All modules include detailed READMEs, and several include structured instruction files with diagrams:
- 05-private-transfers: `instructions/step-0-introduction.md` through `step-5-finish.md` with 12 diagram assets
- 11-prediction-market: `LECTURE_PLAN.md` (90-minute structured lecture) and `scripts/00-overview.md` through `06-recap.md`

These can be read and understood without running any code.

### Can Implement Simplified Versions: Yes, with effort

The user could implement simplified versions of the high-value modules using their existing v0.31.0 toolchain:
- A basic StableSwap pool (without Pyth oracle) using v0.31.0 Anchor
- A prediction market program (without Codama codegen, using manual IDL)
- A stablecoin with pause/allowance patterns using Token-2022

Each would require adapting the SF code to v0.31.0 syntax, which is a non-trivial but educational exercise in itself.

### Post-Bootcamp Migration Path

After completing the Encode Club bootcamp, the user could:
1. Install Anchor v1.0.0 (stable release, not RC) in a fresh environment
2. Run the SF modules directly as reference implementations
3. Adopt LiteSVM testing and Codama codegen as standard workflow
4. Use the SF modules as portfolio projects

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Toolchain conflict (Anchor v0.31.0 vs v1.0.0-rc.2) | **High** | Do not install v1.0.0-rc.2 during bootcamp. Use Docker isolation if experimentation is needed. |
| Scope creep — attempting too many SF modules during active bootcamp | **High** | Limit to reading 3 modules as reference. Defer all implementation to post-bootcamp or Week 5-6 capstone only. |
| Conceptual overwhelm — ZK proofs and AMM math are advanced topics | **Medium** | Treat as exposure, not mastery. Read instructions for conceptual understanding. Don't attempt to implement 05-private-transfers without ZK background. |
| Premature optimization — switching to LiteSVM/Codama mid-bootcamp | **Medium** | Document the patterns as "future improvements" but don't change active workflow. The user's current toolchain works for learning. |
| Stale information — SF repo uses RC version that may change before stable release | **Low** | Anchor v1.0.0 stable release patterns will likely be close to RC. Revisit after stable release. |
| Missing video content — 3 modules are video-only with no code | **Low** | The YouTube playlist (17K views, found in search) may contain these. Check `https://www.youtube.com/playlist?list=PLilwLeBwGuK4HBRBohc5wZdv-KdOVY-9R`. |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Conceptual exposure to ZK proofs | User can explain commitment scheme, nullifier, and Merkle tree membership proof | After reading 05-private-transfers instructions |
| AMM math understanding | User can explain why StableSwap has lower slippage than constant-product for stable pairs | After reading 07-stableswap README |
| Full-stack architecture literacy | User can describe the IDL → codegen → frontend pipeline | After reading 11-prediction-market LECTURE_PLAN.md |
| No bootcamp disruption | All Encode Club exercises continue to build and test with v0.31.0 | Throughout bootcamp |
| 1 capstone project identified | User selects 1 SF module concept to implement as Week 5-6 project using v0.31.0 | By end of Week 4 |
| Toolchain migration documented | Notes file exists with v0.31.0 → v1.0.0 differences observed | By end of bootcamp |

---

## Resolved User Context and Remaining Questions

### Resolved Context

- The user has already built and deployed a December proposal dApp and experienced real data-layer breakage from Anchor/IDL/client mismatch.
- Weeks 5-6 arrive soon and are expected to cover DeFi, escrow, DeFi, and NFTs.
- Post-bootcamp goals are practical: build DeFi apps, contribute to open-source Solana projects, compete in hackathons, and build a Latin America micro-payment lotto/Powerball-style Solana app.
- The user is open to Docker but needs the purpose explained. Docker/Podman is for running isolated toolchains; GHCR is only a registry for storing images.
- The user wants to go deep on ZK if it helps them build. Recommendation: learn ZK concepts now, prototype ZK after the ordinary lotto/payment mechanics work.

### Remaining Questions

1. Does the SF bootcamp repo publish an official pinned GHCR image for Anchor v1.0.0-rc.2, LiteSVM, Codama, framework-kit, and ZK tooling? If yes, use that for sandbox runs.
2. Which Week 5-6 assignment becomes the user's main capstone: escrow, AMM/DeFi, NFT, or lotto-style payments?
3. Does the user want a Dockerfile/compose sandbox after IDEA, or only a written migration/spec decision first?
4. For the lotto app, what is the first jurisdiction/product constraint to model: micro-payment UX, prize custody, randomness, compliance, or privacy?
