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
