# Week 5: Escrow, DeFi & NFTs

**Deck**: Solana Developer Course — Deck 05 — Escrow, DeFi & NFTs  
**Status**: Deck read; Exercises 8-10 not yet started  
**Theme**: One heavy protocol program plus two lighter ecosystem integrations before capstone.

## Week 5 Roadmap

Week 5 rounds out the pre-capstone toolkit:

| Exercise | Focus | Goal |
|---|---|---|
| Exercise 8 | Escrow | Build a trustless token exchange with `make`, `take`, and `cancel` |
| Exercise 9 | DeFi Basics | Read Pyth prices, request Jupiter quotes, and compute spread |
| Exercise 10 | NFTs & Metadata | Mint a collection and member NFTs with Umi + Metaplex Token Metadata |

Support shift: no more AI guidance boxes from this deck onward. Prompting, verification, and debugging workflow are now fully learner-owned.

## Exercise 8 — Trustless Escrow Program

### What You Are Building

Build a two-party token escrow where Alice deposits Token A, Bob fulfills with Token B, and the program enforces an atomic exchange.

### Required Instructions

1. `make`
   - Lock maker Token A in a PDA-controlled vault.
   - Initialize escrow PDA metadata.
   - Initialize the vault token account.

2. `take`
   - Transfer Token B from taker to maker.
   - Release vault Token A to taker.
   - Execute both sides atomically.
   - Close escrow/vault accounts after successful exchange.

3. `cancel`
   - Allow maker to reclaim Token A.
   - Close the vault and escrow.

### State To Store

- Maker pubkey for authority.
- Maker Token B destination.
- Token A mint address.
- Token B mint address.
- Requested amount for the Token B side.
- Vault reference.
- Escrow PDA metadata.

### Account Design

`make` accounts:
- Maker signer/payer.
- Escrow PDA initialized by the program.
- Vault token account initialized by the program.
- Maker Token A source account.
- Mint A.
- Token Program.

`take` accounts:
- Taker signer.
- Escrow PDA.
- Vault token account.
- Maker Token B destination.
- Taker Token A destination.
- Taker Token B source.
- Mint A.
- Mint B.
- Token Program.

`cancel` accounts:
- Maker signer.
- Escrow PDA.
- Vault token account.
- Maker Token A destination.
- Token Program.
- Close vault and escrow after reclaiming funds.

### PDA Authority Rule

The vault token authority must be PDA-controlled. If the maker remains vault authority, escrow can be bypassed outside program logic.

### Test Strategy

This is the most important test suite of the week. Start from failure paths and balance reconciliation, not only the happy path.

| Case | Expected Behavior | Signal |
|---|---|---|
| Make → Take | Alice receives Token B, Bob receives Token A, vault closes | Balances update and accounts close |
| Make → Cancel | Alice gets Token A back, escrow closes | Original balance restored |
| Double-take | Second take fails because escrow is closed | Clear error, no token movement |
| Take after cancel | Take fails after cancellation | Closed-account failure path |
| Wrong mint / wrong authority | Invalid taker token and non-maker cancel both fail | Constraints enforce trustless behavior |
| Balance reconciliation | Total token supply conserved across tests | No hidden mint or burn side effects |

### Pitfalls

- Vault authority: if maker controls the vault, the escrow can be drained or bypassed outside program rules.
- Mint validation: verify the taker sends the expected Token B mint. Otherwise worthless tokens could drain the escrowed Token A.
- Owner vs authority: the token account owner is the Token Program; token authority is the PDA. Do not confuse these.
- Closure rules: after completion or cancel, close the vault and escrow and send rent lamports to the intended recipient.

## Exercise 9 — DeFi Basics: Pyth + Jupiter Spread CLI

### What You Are Building

Build one TypeScript CLI tool that fetches, checks freshness, and compares two price sources.

Quote only. No swap execution.

### Required CLI Behavior

1. Fetch SOL/USD from Pyth using a devnet feed.
2. Print confidence interval.
3. Print staleness warning if the Pyth price is older than 30 seconds.
4. Request SOL → USDC quote from Jupiter on mainnet.
5. Compute implied Jupiter price.
6. Compute spread vs Pyth.

Example CLI shape:

```text
SOL/USD (Pyth):     $148.23 +/- $0.12
Last updated:       2s ago
SOL/USDC (Jupiter): $148.15 (for 1 SOL)
Spread:             0.054%
```

### Pitfalls

| Pitfall | Cause | Fix |
|---|---|---|
| Pyth account not found or stale | Wrong feed ID or network mixup | Look up current feed ID for the target network |
| Jupiter implied price off | Raw units not converted by decimals | Use SOL 9 decimals and USDC 6 decimals in math |
| Request failures | Outdated Jupiter endpoint schema | Confirm current API format in docs |
| Nonsense comparison | Using devnet liquidity for quote | Keep Jupiter quote on mainnet only |

## Exercise 10 — NFTs & Metadata

### What You Are Building

Mint and verify NFT assets using Umi and Metaplex Token Metadata.

Goal:
- One parent collection NFT.
- Three member NFTs.
- Verified collection references.
- Scripted fetch/list output showing names, images, and attributes.

### NFT Foundations

On Solana, NFT behavior comes from token configuration plus metadata:

- Mint supply: `1`.
- Decimals: `0`.
- Non-fungible experience comes from metadata and ecosystem interpretation, not special token math.

Chosen standard:
- Use Metaplex Token Metadata with Umi for broad ecosystem support.

Alternatives to know:
- Token-2022 metadata extension.
- Metaplex Core.
- Tooling coverage differs across standards.

### Umi Workflow

1. Create Umi instance on devnet.
2. Load or generate keypair signer for scripts.
3. Create collection NFT.
4. Create member NFTs with collection verification signature.
5. Fetch collection items.
6. Print name, image, and attributes.

### Metadata URI Rule

Metadata URI must point to valid public JSON. Broken JSON or broken URLs cause missing image/attributes in wallets and explorers.

### Collection Verification Rule

If member NFTs are unverified, the collection authority signature was likely not included.

## Week 5 Done-When Rubric

### Escrow + Tests

- [ ] `make`, `take`, and `cancel` all function correctly.
- [ ] Wrong mint, wrong authority, and closed-account paths fail clearly.
- [ ] Balances reconcile with no token creation or destruction.

### Integrations

- [ ] DeFi CLI prints Pyth price, confidence interval, and spread vs Jupiter quote.
- [ ] NFT collection and three members are minted and verified on devnet.
- [ ] NFT script lists collection NFTs with image and attributes.

## Stretch Goals

### Escrow

Add partial fills with:
- Proportional amounts.
- Overflow-safe arithmetic.
- Rounding-aware state updates.

### DeFi

Integrate live Pyth + Jupiter quote panel into the Week 4 React frontend. Keep it quote-only.

### NFTs

Compare the cost of 100 regular NFTs vs 100 compressed NFTs using Bubblegum + Merkle tree.

## Key Learnings

- Escrow proves deeper protocol engineering: multi-party token flows, strict account constraints, mint validation, PDA authority, and account closure.
- DeFi integration requires careful network separation: Pyth devnet price feed vs Jupiter mainnet quote route.
- Price math must respect raw units and decimals: SOL has 9 decimals, USDC has 6.
- NFT work is mostly metadata and authority discipline: valid JSON URI, correct signer model, verified collection authority.
- Capstone readiness means combining program depth, market data integrations, and digital asset tooling into one complete product.

## Source Capture

| Source | Path |
|---|---|
| Original PDF | `/a0/usr/projects/solana_bootcamp/resources/uploads/Solana_Developer_Course___Deck_05___Escrow__DeFi___NFTs.pdf` |
| Extracted text | `/a0/usr/projects/solana_bootcamp/resources/extracted/deck-05-escrow-defi-nfts.txt` |

## Next Steps

1. Scaffold Exercise 8 escrow program.
2. Design PDA seeds, escrow state, and vault authority before coding.
3. Write the escrow test matrix first, especially failure paths and balance reconciliation.
4. Build Exercise 9 as a standalone TypeScript CLI.
5. Build Exercise 10 scripts with public metadata JSON and verified collection output.
