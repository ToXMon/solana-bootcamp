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

---

## Week 5: Escrow, DeFi & NFTs
**Status**: Deck 05 read; Exercises 8-10 not yet started  
**Start Date**: 2026-06-29

### Session 1 — 2026-06-29
**Accomplished:**
- Ingested Deck 05 — Escrow, DeFi & NFTs.
- Saved the source PDF to `resources/uploads/Solana_Developer_Course___Deck_05___Escrow__DeFi___NFTs.pdf`.
- Extracted full deck text to `resources/extracted/deck-05-escrow-defi-nfts.txt`.
- Created Week 5 notes at `notes/week-05-escrow-defi-nfts.md`.
- Backfilled the missing Week 3 notes at `notes/week-03-first-token.md` so weekly capture now covers Weeks 1-5.
- Extracted requirements for Exercises 8, 9, and 10.
- Captured Week 5 done-when rubric, pitfalls, test strategy, and stretch goals.

**Key Learnings:**
- Exercise 8 is the hardest program so far: a trustless token escrow with `make`, `take`, and `cancel`.
- Escrow safety depends on PDA-controlled vault authority, mint validation, owner/authority reasoning, and account closure discipline.
- Escrow testing should start with failure paths and balance reconciliation, not just happy path execution.
- Exercise 9 is quote-only: compare Pyth SOL/USD price data with Jupiter SOL→USDC quote output without executing swaps.
- Pyth/Jupiter comparison requires strict network awareness: Pyth devnet feed, Jupiter mainnet quote.
- Exercise 10 introduces NFT collection tooling with Umi + Metaplex Token Metadata.
- NFT verification depends on valid public metadata JSON and collection authority signature.

**Upcoming Exercises:**
| Exercise | Program/Tool | Focus |
|---|---|---|
| 8 | Trustless Escrow | PDA vault authority, SPL token CPI, atomic make/take/cancel flow |
| 9 | DeFi CLI | Pyth price, confidence/staleness, Jupiter quote, spread math |
| 10 | NFT Scripts | Umi signer model, collection NFT, verified member NFTs, metadata fetch |

**Done-When Gate:**
- Escrow instructions pass success and failure tests.
- Escrow balances reconcile with no token creation/destruction.
- DeFi CLI prints Pyth price, confidence interval, staleness, Jupiter implied price, and spread.
- NFT scripts mint one collection and three verified member NFTs on devnet, then list image and attributes.

**Next Step:** Scaffold Exercise 8 escrow program and write failing tests from the test matrix before implementing any instruction logic.

### Session — Phase 0 Complete (2026-06-29)
**Accomplished:**
- Captured full Week 5 version matrix to `exercises/escrow-program/VERSION_MATRIX.md`
- Cloned and read `solana-bootcamp-2026/04-escrow` reference: state.rs, make.rs, take.rs, refund.rs, errors.rs, mod.rs, test file
- Translated Anchor 1.0 escrow architecture to Anchor 0.31 design in `exercises/escrow-program/DESIGN.md`
- Defined PDA seeds: `["escrow", maker, seed_le_u64]`
- Defined state fields: seed, maker, mint_a, mint_b, receive, bump
- Defined vault authority rule: PDA-owned, not maker
- Defined 8-case failure-path test matrix
- Defined security review checklist
- Documented 9 specific Anchor 1.0 to 0.31 translation changes

**Key Design Decisions:**
1. Classic SPL Token only (no TokenInterface) for simplicity on Anchor 0.31
2. transfer_checked for all token CPIs to validate decimals
3. init_if_needed feature flag for taker/maker ATA creation in take/cancel
4. Tests in ts-mocha on devnet (matching Exercises 5 and 6 convention)
5. Escrow and vault accounts closed with rent to maker on both take and cancel

**Next Step:** Run `anchor test` to verify tests fail as expected (test-first), then implement instruction logic to make tests pass.

### Session — Escrow Scaffold + Tests Complete (2026-06-30)
**Accomplished:**
- Scaffolded Exercise 8 Anchor project at `exercises/escrow-program/`
- 14 files created: Anchor.toml, Cargo.toml, package.json, tsconfig.json, 7 Rust source files, test file, migrations
- Program builds successfully: `anchor build` produces 282K `.so` binary
- Program ID: `ET53vYqkdpdipNAuW636NUubyhAZ7oMDNr4kJH9VL8Ho`
- IDL generated at `target/idl/escrow_program.json` (18K)
- TypeScript types generated at `target/types/escrow_program.ts` (19K)
- Test file written with 8-case failure-path matrix from DESIGN.md
- Dependencies installed via yarn
- blake3 pinned to 1.5.5 to avoid edition2024/rustc conflicts

**Key Implementation Details:**
- Single lib.rs pattern (matching proposal-state-machine approach)
- Classic SPL Token: `anchor_spl::token` with `TransferChecked`
- Vault authority = escrow PDA
- PDA seeds: `[b"escrow", maker, seed.to_le_bytes()]`
- `close=maker` on escrow in take and cancel
- `init_if_needed` for taker/maker ATAs in take and cancel
- No unwrap()/expect() in program code

**Next Step:** Run `anchor test` to verify tests fail as expected (test-first), then implement instruction logic to make tests pass.

### Session — Missing Deck Archive Backfill (2026-06-29)
**Accomplished:**
- Added missing source PDFs for Deck 03 and Deck 04 to `resources/uploads/`.
- Extracted full text for Deck 03 and Deck 04 to `resources/extracted/`.
- Linked Deck 03 and Deck 04 notes to their source PDF and extracted text artifacts.
- Verified the project now has Deck PDFs 00-05 and weekly notes 01-05.

### Session — Week 5 Implementation Plan (2026-06-29)
**Accomplished:**
- Created `tasks/week-05-implementation-plan.md` for Exercises 8-10.
- Incorporated Deck 05 requirements and external repo guidance from Codama, Solana AI Kit, crypto-primitives examples, and solana-bootcamp-2026.
- Confirmed local compatibility baseline: Anchor `0.31.0` for programs, `@coral-xyz/anchor` for Anchor client patterns, and separate Umi scripts for NFTs.
- Set Exercise 8 as the first, test-first priority before DeFi CLI and NFT scripts.

**Next Step:** Start Phase 0 by recording the toolchain/version matrix, then design the Exercise 8 escrow PDA/account model before coding.

### Session — Exercise 8 Tests Pass on Localnet (2026-06-30)
**Accomplished:**
- Ran `NO_DNA=1 anchor test --provider.cluster localnet` — all 8 tests pass
- Initial run: 5 passing, 3 failing (test harness bugs, not program bugs)
- Fixed 3 test issues:
  - Test 5 (Wrong mint B): ATA derivation was using wrong mint for maker_ata_b
  - Test 6 (Non-maker cancel): maker_ata_a belonged to maker not randomUser
  - Test 8 (Balance reconciliation): failed tests 5/6/7 left tokens trapped in unclosed escrows; added cleanup
- Final result: 8 passing, 0 failing (15.75s)
- Devnet deploy attempted but wallet has only 0.83 SOL (needs ~2.0 SOL); airdrop rate-limited
- Tests verified on localnet instead — zero devnet SOL consumed

**Test Results:**
| # | Test | Result | Signal |
|---|---|---|---|
| 1 | Make -> Take | PASS | Balances update, accounts closed |
| 2 | Make -> Cancel | PASS | Balance restored, accounts closed |
| 3 | Double-take | PASS | AccountNotInitialized |
| 4 | Take after cancel | PASS | AccountNotInitialized |
| 5 | Wrong mint B | PASS | InvalidMintB (Error 6) |
| 6 | Non-maker cancel | PASS | ConstraintSeeds |
| 7 | Insufficient funds | PASS | Token CPI simulation failed |
| 8 | Balance reconciliation | PASS | 98M + 2M = 100M conserved |

**Key Learning:**
- Test harness bugs can trigger earlier Anchor constraints before reaching the intended assertion target
- Wrong ATA derivation causes `associated_token::mint` or `ConstraintTokenOwner` failures instead of `has_one` failures
- Failed tests that leave escrows open trap tokens in vaults — cleanup needed for balance reconciliation
- The Rust program logic was correct on first implementation — all 3 failures were test-side account derivation errors

**Next Step:** Deploy to devnet after wallet funding, then proceed to Exercise 9 (DeFi CLI).

### Session — Exercise 8 Devnet Deploy (2026-06-30)
**Accomplished:**
- Deployed escrow program to devnet after wallet funding
- Program ID: ET53vYqkdpdipNAuW636NUubyhAZ7oMDNr4kJH9VL8Ho
- Deploy signature: 5iiLu7gGo4kWN2uL2GxA7WqLoKei4cnQKxp2y2c5k8XdC3qBwiEY5bE9HzvxoxSEXHQhrRC95pbCew6MaP7vXiea
- Verified on devnet: `solana program show` confirms program exists, authority, data length 288328 bytes
- ProgramData Address: ACWvrX7gsQyBw1dzETXRTSsJm35YpudXdQzn99m42Y6n
- Balance after deploy: 1.32 SOL
- Deployment cost: ~2.01 SOL (rent exemption for 282K binary)

**Explorer Links:**
- Program: https://explorer.solana.com/address/ET53vYqkdpdipNAuW636NUubyhAZ7oMDNr4kJH9VL8Ho?cluster=devnet
- Deploy TX: https://explorer.solana.com/tx/5iiLu7gGo4kWN2uL2GxA7WqLoKei4cnQKxp2y2c5k8XdC3qBwiEY5bE9HzvxoxSEXHQhrRC95pbCew6MaP7vXiea?cluster=devnet

**Exercise 8 Status: COMPLETE**
- 8/8 localnet tests passing
- Devnet deployment verified
- Next: Exercise 9 (DeFi CLI) and Exercise 10 (NFT scripts)

### Session — Exercise 9 DeFi CLI Complete (2026-07-01)
**Accomplished:**
- Built standalone TypeScript CLI at exercises/defi-cli/
- 11 files: package.json, tsconfig.json, README.md, .env.example, .gitignore, 5 source files
- 489 lines of TypeScript across index.ts, pyth.ts, jupiter.ts, math.ts, types.ts
- npm install successful (59 packages)
- CLI runs successfully with live price output

**Live CLI Output:**
```
SOL/USD (Pyth):         $78.47 +/- $0.04
Last updated:              2s ago
SOL/USDC (Jupiter):  $78.50 (for 1 SOL)
Spread:                          0.032%
No swap executed — quote only
```

**API Findings:**
- Pyth feed ID verified via Hermes API: ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d
- Jupiter endpoint updated: lite-api.jup.ag/swap/v1/quote (old quote-api.jup.ag is dead)

**Pitfalls Handled:**
- Pyth feed ID verified from Hermes /v2/price_feeds query
- SOL 9 decimals, USDC 6 decimals in math.ts
- Jupiter mainnet-only (not devnet liquidity)
- Staleness warning if Pyth price > 30s old
- Graceful error handling for API failures

**Exercise 9 Status: COMPLETE**
- Next: Exercise 10 (NFT scripts with Umi + Metaplex)

### Session — Exercise 10 NFT Collection Complete (2026-07-02)
**Accomplished:**
- Built standalone Umi + Metaplex scripts at exercises/nft-collection/
- 11 files: package.json, tsconfig.json, README.md, 3 source files, 4 metadata JSON files, mint-addresses.json
- npm install successful
- Minted collection NFT + 3 verified member NFTs on devnet
- All 3 members have verified collection references

**On-Chain Results:**
| Asset | Mint Address | Verified |
|---|---|---|
| Collection | 7hXSgWEDxava1y46Wt4HXCH8DJSzVPwdRMt4J6wvq5Uh | N/A |
| Member 1 | 6cdybQ7xR8zB9juxyrhK1VgB8R5jSNsyy5AVWQdarddf | YES |
| Member 2 | BDTDbfNMe3JxaisYyUBbYAd98D9oErkMv9WQFgZVDDrm | YES |
| Member 3 | EoptMV1f96ujPVpfBzvycnuxxxtxkATf42CRwq6t8N3T | YES |

**Explorer Links:**
- Collection: https://explorer.solana.com/address/7hXSgWEDxava1y46Wt4HXCH8DJSzVPwdRMt4J6wvq5Uh?cluster=devnet
- Member 1: https://explorer.solana.com/address/6cdybQ7xR8zB9juxyrhK1VgB8R5jSNsyy5AVWQdarddf?cluster=devnet
- Member 2: https://explorer.solana.com/address/BDTDbfNMe3JxaisYyUBbYAd98D9oErkMv9WQFgZVDDrm?cluster=devnet
- Member 3: https://explorer.solana.com/address/EoptMV1f96ujPVpfBzvycnuxxxtxkATf42CRwq6t8N3T?cluster=devnet

**Key Decisions:**
- Data URIs (base64 JSON) for on-chain metadata to avoid external hosting dependencies
- Two-tier metadata: minimal on-chain, full JSON locally for list script display
- Explicit verifyCollectionV1 call after each member mint

**Bugs Fixed:**
- Transaction too large (2204 bytes vs 1232 max): reduced on-chain metadata to minimal JSON
- Collection field serialization: createV1 expects { key, verified } struct, not bare PublicKey

**Exercise 10 Status: COMPLETE**
- All 3 Week 5 exercises done
