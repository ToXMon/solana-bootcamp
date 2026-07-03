# Week 5 Implementation Plan — Escrow, DeFi & NFTs

**Scope**: Complete Deck 05 exercises:

- Exercise 8 — trustless token escrow program
- Exercise 9 — Pyth + Jupiter quote-only DeFi CLI
- Exercise 10 — Umi + Metaplex NFT collection scripts

**Primary project sources**:

- `/a0/usr/projects/solana_bootcamp/notes/week-05-escrow-defi-nfts.md`
- `/a0/usr/projects/solana_bootcamp/resources/extracted/deck-05-escrow-defi-nfts.txt`
- Existing Week 4 programs: `/a0/usr/projects/solana_bootcamp/exercises/proposal-state-machine/`, `/a0/usr/projects/solana_bootcamp/exercises/tip-jar-cpi/`

**External reference repos requested by user**:

- `https://github.com/solana-foundation/solana-bootcamp-2026.git`
- `https://github.com/codama-idl/codama.git`
- `https://github.com/solanabr/solana-ai-kit.git`
- `https://github.com/solana-foundation/crypto-primitives-examples.git`

## Current compatibility baseline

Detected from existing project exercises:

| Area | Local project reality | Planning decision |
|---|---|---|
| Anchor programs | `anchor-lang = 0.31.0` in Exercise 5 and Exercise 6 | Keep Exercise 8 on Anchor `0.31.0` |
| Anchor TS client | `@coral-xyz/anchor` is used locally | Keep `@coral-xyz/anchor`; do not migrate to Anchor 1.0 client packages |
| Frontend | Exercise 7 uses `@solana/web3.js ^1.91.8` and wallet-adapter packages | Do not mix Exercise 7 frontend stack into Umi scripts |
| Token program work | Week 3 used classic SPL Token and Token-2022 separately | Use classic SPL for minimum Exercise 8; add Token-2022 compatibility only if tests stay simple |
| Target network | Project rule: devnet unless explicitly stated otherwise | Devnet deploys and Explorer verification; Jupiter quote intentionally uses mainnet API only |

## Source usage plan

| Source | How to use it | Do not do |
|---|---|---|
| `solana-bootcamp-2026/04-escrow` | Use as the main escrow architecture reference: PDA escrow, PDA-owned vault, make/take/refund behavior, balance assertions | Do not copy Anchor 1.0 code directly into Anchor 0.31 project |
| `codama-idl/codama` | Optional post-build client/codegen step from Anchor IDL if we want a typed CLI/client after Exercise 8 works | Do not make Codama part of the critical path for passing Week 5 |
| `crypto-primitives-examples` | Borrow the reproducible codegen workflow idea: generate, check generated output, keep clients/docs in sync | Do not copy Pinocchio/Agave 4.0 architecture into this Anchor exercise |
| `solana-ai-kit` | Use as a checklist source for Anchor security, PDA discipline, testing, token/NFT standards, and version risks | Do not add it as a dependency; treat it as workflow guidance |

## Guiding rules for this week

1. **Exercise 8 is first and test-first.** It is the hardest program and has the highest risk.
2. **Translate, do not copy.** External escrow examples may use Anchor 1.0; this project is Anchor 0.31.
3. **Keep stacks separate.** Anchor escrow, TypeScript DeFi CLI, and Umi NFT scripts should be separate exercise folders.
4. **Verify with evidence.** Every completed exercise needs command output, tests, devnet artifacts where applicable, and Explorer links.
5. **AI Ramp mode.** AI should explain the design, ask the user to reason about seeds/accounts/authority, then assist with code after the design is understood.

---

## Phase 0 — Setup and source-grounding

**Goal**: Lock versions, reference paths, and decisions before code.

### Task 0.1 — Create Week 5 version matrix

**Description**: Record exact tool/library versions for the three exercise folders before implementation.

**Acceptance criteria**:
- [ ] Anchor CLI version recorded.
- [ ] Solana CLI version recorded.
- [ ] Rust version recorded.
- [ ] Node/Yarn/npm versions recorded.
- [ ] Existing Anchor program dependency versions recorded.

**Verification**:
- [ ] Run: `anchor --version`, `solana --version`, `rustc --version`, `node --version`, `yarn --version`, `npm --version`.
- [ ] Save output to the Exercise 8 README or execution log.

**Dependencies**: None

**Likely files**:
- `exercises/escrow-program/README.md`
- `progress/weekly-log.md`

### Task 0.2 — Review reference escrow before scaffolding

**Description**: Read the external `solana-bootcamp-2026/04-escrow` reference and extract the design, not the code syntax.

**Acceptance criteria**:
- [ ] PDA seed formula documented.
- [ ] Escrow state fields documented.
- [ ] Vault authority model documented.
- [ ] Test cases translated into this project’s Anchor 0.31 style.

**Verification**:
- [ ] A design section exists before implementation starts.

**Dependencies**: Task 0.1

---

## Phase 1 — Exercise 8: Trustless Escrow Program

**Goal**: Build a tested Anchor escrow where Alice locks Token A, Bob atomically pays Token B, and the program releases Token A or lets Alice cancel.

### Architecture decision

Use a PDA escrow account with seeds like:

```text
["escrow", maker_pubkey, seed_le_bytes]
```

Store:

- maker pubkey
- mint A
- mint B
- maker Token B destination
- requested Token B amount
- seed
- bump

Vault rule:

- Vault token account holds Token A.
- Vault token authority must be the escrow PDA, not the maker.

### Task 1.1 — Scaffold `exercises/escrow-program`

**Description**: Create a new Anchor project for Exercise 8 using local project conventions.

**Acceptance criteria**:
- [ ] Project exists at `/a0/usr/projects/solana_bootcamp/exercises/escrow-program/`.
- [ ] `Anchor.toml` targets devnet.
- [ ] `anchor-lang` is pinned to `0.31.0`.
- [ ] `anchor-spl` version is compatible and pinned.
- [ ] Program builds before business logic is added.

**Verification**:
- [ ] `anchor build` succeeds.
- [ ] `git status --short exercises/escrow-program` shows expected scaffold only.

**Dependencies**: Phase 0

### Task 1.2 — Define escrow state and errors

**Description**: Add the escrow account struct, space calculation, and custom errors.

**Acceptance criteria**:
- [ ] `Escrow` stores all required fields.
- [ ] Space is explicit and correct.
- [ ] Custom errors cover invalid maker, wrong mint, invalid amount, and arithmetic/closure failures as needed.
- [ ] No `unwrap()` or `expect()` in program logic.

**Verification**:
- [ ] `anchor build` succeeds.
- [ ] Reviewer can explain each field’s purpose.

**Dependencies**: Task 1.1

### Task 1.3 — Write failing escrow tests first

**Description**: Create the test matrix before implementation.

**Acceptance criteria**:
- [ ] Test: make creates escrow/vault and moves Token A to vault.
- [ ] Test: make → take moves Token B to maker, Token A to taker, and closes accounts.
- [ ] Test: make → cancel restores Token A to maker and closes accounts.
- [ ] Test: double-take fails.
- [ ] Test: take after cancel fails.
- [ ] Test: wrong mint fails.
- [ ] Test: non-maker cancel fails.
- [ ] Test: total balances reconcile; no hidden mint/burn.

**Verification**:
- [ ] Tests initially fail for missing instructions or missing logic.

**Dependencies**: Task 1.2

### Task 1.4 — Implement `make`

**Description**: Maker initializes escrow and locks Token A in a PDA-controlled vault.

**Acceptance criteria**:
- [ ] Maker signs and pays.
- [ ] Escrow PDA initialized with deterministic seeds.
- [ ] Vault token account initialized.
- [ ] Vault authority is escrow PDA.
- [ ] Token A is transferred with checked token semantics.
- [ ] Escrow stores mint A, mint B, receive amount, maker destination, seed, and bump.

**Verification**:
- [ ] `make` test passes.
- [ ] Wrong/missing account tests fail clearly.

**Dependencies**: Task 1.3

### Task 1.5 — Implement `take`

**Description**: Taker completes the atomic exchange.

**Acceptance criteria**:
- [ ] Taker sends expected Token B amount to maker destination.
- [ ] Program validates Token B mint.
- [ ] Program releases vault Token A to taker using escrow PDA signer seeds.
- [ ] Vault closes after transfer.
- [ ] Escrow closes after completion.
- [ ] No partial state remains after success.

**Verification**:
- [ ] make → take test passes.
- [ ] double-take fails.
- [ ] wrong mint fails.
- [ ] balance reconciliation passes.

**Dependencies**: Task 1.4

### Task 1.6 — Implement `cancel`

**Description**: Maker can reclaim Token A before the escrow is taken.

**Acceptance criteria**:
- [ ] Only maker can cancel.
- [ ] Vault Token A returns to maker Token A destination.
- [ ] Vault closes.
- [ ] Escrow closes.
- [ ] Take after cancel fails.

**Verification**:
- [ ] make → cancel test passes.
- [ ] non-maker cancel fails.
- [ ] take-after-cancel fails.

**Dependencies**: Task 1.4

### Task 1.7 — Devnet deploy and Explorer verification

**Description**: Deploy the escrow program to devnet after all tests pass.

**Acceptance criteria**:
- [ ] Program deployed to devnet.
- [ ] Program ID recorded.
- [ ] Deployment transaction recorded.
- [ ] Explorer link recorded.
- [ ] At least one make/take or make/cancel transaction verified on Explorer.

**Verification**:
- [ ] `solana config get` confirms devnet.
- [ ] Explorer links resolve.

**Dependencies**: Tasks 1.4–1.6

---

## Phase 2 — Exercise 9: DeFi Basics CLI

**Goal**: Build a quote-only TypeScript CLI that compares Pyth SOL/USD with Jupiter SOL→USDC implied price.

### Architecture decision

Keep this separate from Anchor. Use a standalone script under:

```text
exercises/defi-cli/
```

The CLI should clearly label the deliberate network split:

- Pyth: devnet feed
- Jupiter: mainnet quote API

No swap execution.

### Task 2.1 — Scaffold `exercises/defi-cli`

**Acceptance criteria**:
- [ ] `package.json` created with pinned dependencies.
- [ ] `tsx` script runner configured.
- [ ] `.env.example` documents optional RPC/API settings.
- [ ] README explains quote-only scope.

**Verification**:
- [ ] `npm install` succeeds.
- [ ] `npm run check` or equivalent script runs.

**Dependencies**: Phase 0

### Task 2.2 — Confirm current Pyth feed and Jupiter API

**Acceptance criteria**:
- [ ] Current SOL/USD devnet Pyth feed/account documented.
- [ ] Current Jupiter quote endpoint documented.
- [ ] Any schema assumptions documented in code or README.

**Verification**:
- [ ] One manual request to each source succeeds before coding the final CLI.

**Dependencies**: Task 2.1

### Task 2.3 — Build price math helpers

**Acceptance criteria**:
- [ ] SOL raw amount conversion uses 9 decimals.
- [ ] USDC raw amount conversion uses 6 decimals.
- [ ] Spread formula is documented.
- [ ] Helper tests cover deterministic conversion examples.

**Verification**:
- [ ] Unit tests pass for decimal conversion and spread math.

**Dependencies**: Task 2.1

### Task 2.4 — Build CLI output

**Acceptance criteria**:
- [ ] Prints Pyth price.
- [ ] Prints confidence interval.
- [ ] Prints publish age.
- [ ] Warns if Pyth price is older than 30 seconds.
- [ ] Prints Jupiter implied SOL/USDC price for 1 SOL.
- [ ] Prints spread in percent.
- [ ] Clearly states no swap was executed.

**Verification**:
- [ ] CLI output matches Deck 05 shape.
- [ ] Network labels are visible.

**Dependencies**: Tasks 2.2–2.3

---

## Phase 3 — Exercise 10: NFTs & Metadata

**Goal**: Mint one collection NFT and three verified member NFTs on devnet using Umi + Metaplex Token Metadata.

### Architecture decision

Keep NFT scripts separate from Anchor and wallet-adapter code:

```text
exercises/nft-collection/
```

Use Umi’s signer/identity model directly.

### Task 3.1 — Scaffold Umi scripts

**Acceptance criteria**:
- [ ] `package.json` created with pinned Umi and Metaplex dependencies.
- [ ] Devnet RPC configured.
- [ ] Wallet/signer loading documented.
- [ ] README states this is devnet-only.

**Verification**:
- [ ] Script can print devnet identity public key.

**Dependencies**: Phase 0

### Task 3.2 — Prepare metadata JSON

**Acceptance criteria**:
- [ ] Collection metadata JSON exists.
- [ ] Three member metadata JSON files exist.
- [ ] Each JSON includes name, symbol, description, image, and attributes.
- [ ] URIs are publicly reachable before minting.

**Verification**:
- [ ] `curl` or browser fetch returns valid JSON for each URI.

**Dependencies**: Task 3.1

### Task 3.3 — Mint collection NFT

**Acceptance criteria**:
- [ ] Collection NFT minted on devnet.
- [ ] Mint address recorded.
- [ ] Transaction signature recorded.
- [ ] Explorer link recorded.

**Verification**:
- [ ] Explorer shows the minted collection asset.

**Dependencies**: Task 3.2

### Task 3.4 — Mint three verified member NFTs

**Acceptance criteria**:
- [ ] Three member NFTs minted on devnet.
- [ ] Each member references the collection.
- [ ] Collection authority signature verifies each member.
- [ ] Mint addresses and Explorer links recorded.

**Verification**:
- [ ] Script or Explorer confirms verified collection references.

**Dependencies**: Task 3.3

### Task 3.5 — List collection items

**Acceptance criteria**:
- [ ] Script fetches collection members.
- [ ] Script prints name, mint, URI, image, attributes, and verified status.
- [ ] Output saved to a log file.

**Verification**:
- [ ] Script output lists all three member NFTs.

**Dependencies**: Task 3.4

---

## Phase 4 — Optional Codama/client generation

**Goal**: Use Codama only after the escrow program works, if a typed client would help capstone readiness.

### Task 4.1 — Evaluate whether Codama is worth adding

**Acceptance criteria**:
- [ ] Decision recorded: use Codama or skip for Week 5.
- [ ] If used, exact Codama package versions are pinned.
- [ ] Generated files are clearly separated from handwritten code.

**Verification**:
- [ ] Generated client can derive escrow PDA and build instructions, or Codama is explicitly deferred.

**Dependencies**: Exercise 8 complete

### Task 4.2 — Add generated client check if Codama is used

**Acceptance criteria**:
- [ ] Anchor IDL is generated.
- [ ] Codama conversion succeeds.
- [ ] Client generation is reproducible.
- [ ] A check script detects stale generated output.

**Verification**:
- [ ] `npm run generate` and `npm run check-generated` or equivalents pass.

**Dependencies**: Task 4.1

---

## Phase 5 — Review, security, and documentation

### Task 5.1 — Security review Exercise 8

**Acceptance criteria**:
- [ ] Maker signer checks confirmed.
- [ ] Mint A and Mint B validation confirmed.
- [ ] Vault authority confirmed as PDA.
- [ ] PDA seed collision risks reviewed.
- [ ] Account close destinations reviewed.
- [ ] Arithmetic checked for overflow/underflow.
- [ ] Token account owner vs token authority distinction documented.

**Verification**:
- [ ] Security review notes saved in Exercise 8 README or log.

**Dependencies**: Exercise 8 tests passing

### Task 5.2 — Documentation and progress update

**Acceptance criteria**:
- [ ] Each exercise has a README.
- [ ] Each README has commands, output, and verification links.
- [ ] `progress/assignments.md` updated only after verification.
- [ ] `progress/weekly-log.md` updated with what was learned.
- [ ] Social post offered after milestone completion.

**Verification**:
- [ ] Paths and Explorer links resolve.
- [ ] Completed assignments have evidence.

**Dependencies**: Exercises complete

---

## Checkpoints

### Checkpoint A — Before coding Exercise 8

- [ ] Version matrix exists.
- [ ] Escrow account design is written.
- [ ] Test matrix is written.
- [ ] User can explain why vault authority must be a PDA.

### Checkpoint B — Escrow local complete

- [ ] All escrow tests pass locally.
- [ ] Wrong mint/wrong authority/closed-account failures pass.
- [ ] Balances reconcile.
- [ ] No devnet deploy until local evidence is clean.

### Checkpoint C — Week 5 complete

- [ ] Exercise 8 deployed and verified on devnet.
- [ ] Exercise 9 CLI prints Pyth + Jupiter spread and executes no swap.
- [ ] Exercise 10 mints collection + three verified members on devnet.
- [ ] Progress and assignment trackers updated.
- [ ] Final reflection/social draft offered.

## Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Copying Anchor 1.0 escrow code into Anchor 0.31 | Build/test breakage | Translate architecture only; keep local dependency style |
| Vault authority accidentally remains maker | Escrow bypass | Test vault authority and use PDA signer seeds for withdrawals |
| Wrong mint accepted in `take` | Worthless tokens drain escrow | Enforce `mint_b` and token account mint constraints |
| Account closure incomplete | Rent leaks, double-use confusion | Assert closed accounts in tests |
| Jupiter/Pyth network mismatch misunderstood | Bad DeFi output interpretation | Label Pyth devnet and Jupiter mainnet clearly; quote-only |
| Jupiter API schema changes | CLI breakage | Confirm API immediately before coding and handle parse errors clearly |
| Umi identity confusion | NFTs minted by wrong signer or unverified collection | Print signer pubkey, cluster, collection authority; verify collection membership |
| Public metadata URI broken | Wallet/explorer missing image/attributes | Fetch JSON before minting |
| Devnet airdrop limits | Blocked deployment/tests | Fund from existing dev wallet, avoid repeated airdrops |

## Recommended execution order

1. Phase 0: version matrix and source-grounding.
2. Phase 1: Exercise 8 escrow, test-first.
3. Security review for escrow before devnet deploy.
4. Phase 2: DeFi CLI.
5. Phase 3: NFT scripts.
6. Optional Phase 4: Codama generated client if useful.
7. Phase 5: docs, assignment tracker, weekly log, social draft.

## Human learning prompts

Before I write code for each step, the user should answer these briefly:

1. **Escrow seeds**: What values make one escrow unique?
2. **Vault authority**: Why can’t Alice remain the vault authority?
3. **Take validation**: Which account proves Bob is sending the right mint?
4. **Closure**: Who should receive rent when escrow completes vs cancels?
5. **DeFi CLI**: Why is Jupiter mainnet while Pyth is devnet in this exercise?
6. **NFTs**: What is the difference between assigning a collection and verifying a collection?
