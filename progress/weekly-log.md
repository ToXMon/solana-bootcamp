# Weekly Progress Log

## Week 1: Foundations
**Status**: Complete

### Session Notes
- Read course decks 00 (Intro), 01 (Foundations), 02 (First Deployments)
- Studied: Account Model, Programs, Transactions, PDAs, AI Verify Loop

---

## Week 2: First Deployments
**Status**: Complete ✅
**Start Date**: 2026-06-08

### Session 1 — 2026-06-08
**Accomplished:**
- Installed full toolchain: Rust 1.96.0, Solana CLI 4.0.1, Anchor CLI 0.31.0, Yarn 1.22.22
- Configured devnet wallet: HnzAHTLny7JdWacKbWHmYhs66Yq4cEhUiiPUDvjJLYnx
- **Exercise 1**: Scaffolded, built, deployed Hello Solana to devnet. Tests passing (1/1)
- **Exercise 2**: Built Counter PDA with initialize + increment instructions. Tests passing (3/3)
- All deployments verified on Solana Explorer

**Key Learnings:**
- Anchor CLI npm package is just a JS wrapper — must compile from source via cargo
- Program deployment costs SOL (rent exemption for storing binary on-chain)
- Devnet airdrops have rate limits — plan ahead or use web faucet
- PDAs: deterministic addresses derived from seeds + program_id, no private key, only program can sign
- PDA seeds bind data to users — each user gets a unique counter
- init constraint creates account, mut marks it writable, seeds+bump ensure same address

**Deployments:**
| Program | ID | Network | Tests |
|---------|-----|---------|-------|
| hello-solana | ggUpdzgva3CDB3UeDS6ntkLKgHGvrL5ApwW395Sj4k3 | Devnet | 1/1 |
| counter-pda | Box6VnMVRFpCsGJbfkVr6JGS1sHuLeJbVv3Yq3R9CtSZ | Devnet | 3/3 |

## Week 3: First Token (June 18, 2026)
### Exercise 3: Your First Token ✅ COMPLETE
- Created SPL token mint on devnet: GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy (9 decimals)
- Created main wallet ATA: 4HDh6ubpekpgG4qNwjtoq9nGAWMk7KNMJmfQUTAET76n
- Minted 1000 tokens to main wallet ATA
- Generated second test wallet: 3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X
- Transferred 100 tokens to second wallet (ATA: 8Fwmf7pVQBk64efnh6QVv8rcueRABwmnm7HjrkzyGsGh)
- Verified balances: main 900, second 100 ✅
- Built TypeScript balance reader using @solana/web3.js + @solana/spl-token
- Balance reader correctly handles 9 decimals (raw ÷ 10^9 = display)
- Captured 3 Solana Explorer screenshots for building in public
- Saved metadata to exercises/first-token/metadata/ and config/tokens.devnet.json
- Issues solved: ATA creation for unfunded wallet (--fund-recipient + --allow-unfunded-recipient), ts-node ESM error (switched to tsx)

### Exercise 4: Token-2022 Extensions ✅ COMPLETE (June 19, 2026)
- Created Token-2022 mint `Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm` on devnet (program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb)
- Configured 3 extensions at mint creation: TransferFeeConfig (100 bps / 1%), MetadataPointer, TokenMetadata
- Initialized on-chain metadata: name "Bootcamp Token 2022", symbol "BOOT2022", URI https://arweave.net/bootcamp-token-2022-metadata.json
- Created main ATA (6fsRkKavjzLGLxTcea5B7SXmwWDfJbCttVp1z55dPySa) and minted 1000 tokens
- Funded second wallet (3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X) with 0.05 SOL via transfer (airdrop rate-limited)
- Tested transfer fee: sent 200 tokens across 2 txs, second wallet received 198, 2 withheld (1% fee)
- Withheld fee verified on-chain: Second ATA shows `Transfer fees withheld: 2000000000` (2 raw tokens)
- Built TypeScript extension decoder using @solana/spl-token (unpackMint + getExtensionTypes + getTransferFeeAmount)
- Decoder confirms: 510-byte mint, TransferFeeConfig + MetadataPointer extensions, withheld fee 2 tokens on second ATA
- Key learnings:
  - Token-2022 uses program ID TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb (different from classic TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA)
  - Extensions are PERMANENT — set at create-token time, cannot be added later
  - ATA derivation must use TOKEN_2022_PROGRAM_ID (pass --program-id flag to spl-token CLI)
  - Withheld fees accrue on the RECIPIENT token account (TransferFeeAmount extension), not on the mint
  - --enable-metadata adds both MetadataPointer extension AND reserves space for TokenMetadata TLV
  - spl-token CLI flags: --transfer-fee-basis-points, --transfer-fee-maximum-fee, --enable-metadata
  - spl-token 0.4.0 enum maps MetadataPointer to id 33529 (version-specific; display still works correctly)
- Deliverables: README.md, decode-extensions.ts, token-2022-metadata.json, explorer-links.json, exercise-4-log.md, decoder-output.txt

## Week 4: Programs & Frontend
**Status**: In Progress — Deck 04 read
**Start Date**: 2026-06-22

### Session 1 — 2026-06-22
**Accomplished:**
- Read Deck 04 — Programs & Frontend
- Updated assignment tracker with Exercises 5, 6, 7
- Captured Week 4 notes: state machines, CPI, frontend transaction flow, common failure modes

**Key Learnings:**
- Programs are stateless — all state lives in accounts
- State machine discipline: model allowed transitions explicitly, reject invalid ones
- CPI: `invoke` for user-signed calls, `invoke_signed` for PDA-signed calls
- Frontend must refetch on-chain state after transactions to refresh the UI
- Wallet adapter packages for React integration: `@solana/wallet-adapter-*`

**Upcoming Exercises:**
| Exercise | Program | Focus |
|---|---|---|
| 5 | Proposal State Machine | Guarded transitions, creator authority |
| 6 | Tip Jar CPI | `invoke` deposits + `invoke_signed` PDA withdrawals |
| 7 | Full Dapp Flow | Wallet adapter, reads, writes, devnet UI |

**Next Step:** Exercise 5 complete — see below.

### Session — Exercise 5 Complete (2026-06-22)
**Accomplished:**
- Built Proposal State Machine Anchor program: Draft → Active → Closed
- Program ID: `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG` on devnet
- Deploy sig: `3Er1fnJkGM7RWFfcNTsrT5dqDMCbXraFg3wiwYozvvuKSeGZ5gfgkiaJzCeUsTkiBzgJhm2pXmFBQ6Yr7UAS2TKv`
- Explorer: https://explorer.solana.com/tx/3Er1fnJkGM7RWFfcNTsrT5dqDMCbXraFg3wiwYozvvuKSeGZ5gfgkiaJzCeUsTkiBzgJhm2pXmFBQ6Yr7UAS2TKv?cluster=devnet
- Tests: 9/9 passing on devnet

**Key Learnings:**
1. `init_if_needed` requires `anchor-lang` feature flag `init-if-needed` — used for global counter PDA
2. Anchor 0.31 needs `#[derive(InitSpace)]` on enums too, not just account structs
3. One-vote-per-voter: `init` on VoteRecord PDA (seeded by proposal+voter) fails if account exists — natural double-vote prevention
4. `has_one = creator` constraint enforces authority elegantly without manual checks
5. edition2024/MSRV conflict: Solana platform-tools bundles cargo 1.79.0 which can't parse edition2024 manifests. Fixed via cargo wrapper + blake3 pin to 1.5.5 + `CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback`
6. Devnet test pattern: avoid airdrop (429 rate limits) — use SOL transfer from main wallet to fund keypairs

**Issues Encountered:**
- blake3 v1.8.5 requires edition2024 → pinned to v1.5.5
- Solana platform-tools cargo 1.79.0 can't parse edition2024 → wrapper script redirecting to system cargo 1.96.0
- ProposalState enum needed InitSpace derive
- Devnet airdrop 429 rate limits → replaced with SOL transfer

**Status:** Exercise 5 complete ✅

### Session — Exercise 6 Complete (2026-06-22)
**Accomplished:**
- Built Tip Jar CPI Anchor program: TipJar PDA vault with raw `invoke` deposits + owner-only withdrawals
- Program ID: `7BjcqxB1gqyudc5vY3yBrvxuNfktUi8RcpDc8wN77P7H` on devnet
- Deploy sig: `HpTk8TdEv6SvnQCcygWg3g3N9c111igzKAr2GP2pHxWJE6k7VsTcHpXaukXRVvmPsAzCT6kYYZG8MdQZiYqWu3T`
- Tests: 7/7 passing on devnet

**Verified Transactions on Solana Explorer:**
- Deposit (owner, 0.1 SOL): https://explorer.solana.com/tx/qgBLnoJRR1Q9MR3fEa1tAgqJMQY8XSGuNHH9BG63aP1n29MVcdd8XUfLgQ8WeiCjrbDhGVxVHGE4R2ihP6MK2An?cluster=devnet
- Deposit (depositor2, 0.05 SOL): https://explorer.solana.com/tx/4r6oB5qHU8Cb36B87zXDpsXWmw9fajNzAZFvkV3C7X1cFBRuFsGzn4iZnBHcwwN6ED3vHtpBfkG5foQbwwdZYU78?cluster=devnet
- Withdraw (owner, 0.05 SOL): https://explorer.solana.com/tx/4TEFv2PAa6jpwkWGPNzrkj32gNoDaVshpxaDQg3XfDjARTJtVqDZptyuYudg68Fqo2Q6k9HGtgRhbpvbvY4pRHuh?cluster=devnet
- TipJar PDA account: https://explorer.solana.com/address/2bC9T2yyezPLgS6cn4f6EobfJzaBTFqhVpT7yZsQDzHC?cluster=devnet

**Key Learnings:**
1. **CRITICAL: `system_instruction::transfer` cannot withdraw FROM PDA data accounts.** The System Program rejects transfers where the source account carries data: "Transfer: `from` must not carry data". When a PDA doubles as both a data account (storing struct data) and a vault (holding lamports), withdrawals must use **direct lamport manipulation** (`**info.lamports.borrow_mut() -= amount`) rather than `invoke_signed` + `system_instruction::transfer`. The program owns the PDA, so it has authority to debit/credit lamports directly.
2. **`invoke` works for deposits** because the depositor (source) is a regular System Program account with no data — the depositor signs the transaction, so no PDA signer seeds are needed.
3. **PDA seed constraints are the first line of defense.** When a non-owner passes their pubkey as `owner` in the withdraw instruction, the PDA seeds derive a different address → `ConstraintSeeds` error fires before `has_one = owner` even runs. Both constraints provide defense in depth.
4. **`total_tips` is cumulative** — deposits increment it, withdrawals do NOT decrement it. It tracks lifetime tips received, not current balance.
5. **Storing the bump in the account** (`tip_jar.bump`) allows reconstructing signer seeds for `invoke_signed` without re-deriving — though we ended up using direct lamport manipulation instead.
6. **Borrow checker with CPI**: Must bind temporary `Pubkey` values (from `.key()`) to `let` bindings before using in seed slices, otherwise the temporary is dropped before the CPI call.
7. **`anchor_lang::solana_program` re-export**: Anchor re-exports `solana_program` so you don't need to add it as a direct dependency — use `anchor_lang::solana_program::program::invoke` etc.
8. **Testing pattern for devnet**: Use fresh keypairs per test run (avoids "account already exists" on PDAs), fund via SOL transfer from payer (avoids airdrop 429 rate limits), and run tests directly via `yarn run ts-mocha` with `ANCHOR_WALLET` env var set (skips expensive program redeploy).

**Issues Encountered & Resolved:**
1. **`solana_program` not found** → Use `anchor_lang::solana_program::...` re-export
2. **`system_instruction::transfer` expects `&Pubkey`** → Add `&` to `.key()` calls
3. **Borrow checker E0502** → Change `&mut ctx.accounts.tip_jar` to `&ctx.accounts.tip_jar` in withdraw (no mutation needed)
4. **Temporary value dropped (E0716)** → Bind `ctx.accounts.owner.key()` to `let owner_key` before seed slice
5. **`Transfer: 'from' must not carry data`** → Replace `invoke_signed` + `system_instruction::transfer` with direct lamport manipulation for PDA vault withdrawals
6. **`ConstraintSeeds` instead of `Unauthorized`** → PDA seed mismatch fires before `has_one` — update test assertion, both are valid security gates
7. **Insufficient funds for redeploy** → Close existing program to recover rent SOL, generate new program keypair
8. **Toolchain (blake3 edition2024)** → Pin blake3 1.5.5, block-buffer 0.10.4, constant_time_eq 0.3.1, crypto-common 0.1.6, digest 0.10.7 + `rust-version = 1.79.0` + `CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback`

**Status:** Exercise 6 complete ✅

## 2026-06-23 — Full dApp Flow: Create Proposal Form

- Built `CreateProposalForm` in `exercises/full-dapp-flow/src/components/CreateProposalForm.tsx`.
- Added title validation with 64-character limit, character count, wallet-aware disabled states, pending spinner, success Explorer link, and mapped program errors 6000-6004.
- Exported from `src/components/index.ts`.
- Integrated into `src/App.tsx` above `ProposalList`; `onSuccess` remounts/refetches the list.
- Verified with `npm run build` in `exercises/full-dapp-flow` — passed with existing Vite dependency/chunk warnings only.

### Exercise 7 — Full Dapp Flow ✅ COMPLETE (June 23, 2026)
- Built production-quality React + TypeScript + Tailwind + shadcn/ui frontend for proposal state machine (Exercise 5)
- 7 components: WalletButton, ProposalList, ProposalCard, CreateProposalForm, VoteDialog, StateBadge, ExplorerLink
- Hallmark Terminal theme: dark canvas (OKLCH), JetBrains Mono display, Inter body, Solana green accent
- Anti-slop: no purple gradients, dual-font, asymmetric layout, no icon-tile cards
- 19/19 unit tests passing (vitest + testing-library + jsdom)
- 31 TypeScript source files, 7 components, 6 test files
- Cloudflare Pages deployment configured (wrangler.toml + deploy script)
- RPC: public devnet (switchable to Helius via env var)
- Proposal fetching: getProgramAccounts with memcmp filter on Proposal discriminator
- Vote flow: confirmation dialog with Yes/No, focus trap, pending state, error retry
- Verification: all 4 program instructions (create, activate, vote, close) executable from UI
- Deployed via parallel swarm (11 tasks, 5 concurrent, dependency-aware)
- Key learnings:
  - vi.hoisted() needed for mock variables referenced in vi.mock() factories
  - @vitest-environment node annotation needed for @solana/web3.js PDA tests in jsdom
  - Anchor enum pattern: { draft: {} | null, active: {} | null, closed: {} | null }
  - Cloudflare Pages supports SPA routing automatically — no nginx config needed
  - getProgramAccounts with memcmp filter is single RPC call vs N round trips
