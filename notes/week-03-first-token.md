# Week 3: First Token — Learning Notes

**Status**: Complete  
**Focus**: SPL tokens, Associated Token Accounts, Token-2022 extensions, metadata, transfer fees, and TypeScript token inspection.

## Core Concepts

### SPL Token Mint

A token mint is the account that defines a token class:

- **Mint address**: the token identifier.
- **Decimals**: display precision. Week 3 used 9 decimals for the classic SPL token.
- **Mint authority**: signer allowed to create new supply.
- **Token program**: classic SPL Token uses `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`.

The mint does not hold user balances. Balances live in token accounts.

### Associated Token Accounts

An Associated Token Account (ATA) is the canonical token account for a `(wallet, mint, token program)` tuple.

Key lesson: ATA derivation depends on the token program. Classic SPL Token and Token-2022 use different program IDs, so the ATA must be derived with the correct token program.

### Raw Units vs Display Units

Token balances are stored in raw integer units.

For a token with 9 decimals:

- `1000` display tokens = `1000 * 10^9` raw units.
- TypeScript balance readers must divide raw amount by `10^decimals` for display.

### Token-2022

Token-2022 extends SPL Token with opt-in extensions configured at mint creation.

Week 3 Token-2022 mint:

- Mint: `Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm`
- Program: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Extensions:
  - `TransferFeeConfig`
  - `MetadataPointer`
  - `TokenMetadata`

Critical rule: extensions are permanent. They must be selected when the mint is created.

## Exercise 3 — Your First Token

### What Was Built

- Created SPL token mint on devnet: `GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy`
- Created main wallet ATA: `4HDh6ubpekpgG4qNwjtoq9nGAWMk7KNMJmfQUTAET76n`
- Minted 1000 tokens to the main wallet ATA.
- Created second wallet: `3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X`
- Transferred 100 tokens to the second wallet ATA: `8Fwmf7pVQBk64efnh6QVv8rcueRABwmnm7HjrkzyGsGh`
- Verified final balances: main wallet `900`, second wallet `100`.
- Built a TypeScript balance reader using `@solana/web3.js` and `@solana/spl-token`.

### Issues Solved

- ATA creation for an unfunded wallet required `--fund-recipient` and `--allow-unfunded-recipient`.
- `ts-node` ESM friction was avoided by switching scripts to `tsx`.
- Balance display required careful raw-unit conversion using mint decimals.

## Exercise 4 — Token-2022 Extensions

### What Was Built

- Created Token-2022 mint on devnet: `Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm`
- Configured transfer fees at mint creation: 100 bps / 1%.
- Added metadata pointer and on-chain token metadata.
- Metadata:
  - Name: `Bootcamp Token 2022`
  - Symbol: `BOOT2022`
  - URI: `https://arweave.net/bootcamp-token-2022-metadata.json`
- Created Token-2022 ATA: `6fsRkKavjzLGLxTcea5B7SXmwWDfJbCttVp1z55dPySa`
- Minted 1000 tokens.
- Sent 200 tokens across two transactions to test transfer fees.
- Verified recipient received 198 tokens and 2 tokens were withheld as fees.
- Built a TypeScript extension decoder with `unpackMint`, `getExtensionTypes`, and `getTransferFeeAmount`.

### Key Learnings

1. Token-2022 uses a different program ID from classic SPL Token.
2. Extensions are set at mint creation and cannot be added later.
3. Token-2022 ATAs must be derived with `TOKEN_2022_PROGRAM_ID`.
4. Withheld transfer fees accrue on the recipient token account, not the mint.
5. `--enable-metadata` adds the metadata pointer and reserves TLV space for token metadata.
6. Token extension enum IDs can be version-specific, so decoder output should be interpreted with dependency versions in mind.

## Artifacts

| Artifact | Path |
|---|---|
| First token exercise | `/a0/usr/projects/solana_bootcamp/exercises/first-token/README.md` |
| First token quick reference | `/a0/usr/projects/solana_bootcamp/exercises/first-token/QUICK_REFERENCE.md` |
| Token config | `/a0/usr/projects/solana_bootcamp/config/tokens.devnet.json` |
| Token-2022 exercise | `/a0/usr/projects/solana_bootcamp/exercises/token-2022/README.md` |
| Token-2022 metadata | `/a0/usr/projects/solana_bootcamp/exercises/token-2022/metadata/` |
| Token-2022 scripts | `/a0/usr/projects/solana_bootcamp/exercises/token-2022/scripts/` |

## Common Failure Modes

- Deriving ATAs with the wrong token program.
- Confusing raw units with display units.
- Trying to add Token-2022 extensions after mint creation.
- Expecting withheld transfer fees to appear on the mint instead of the recipient token account.
- Using an unfunded recipient without explicit funding flags.

## Why This Week Matters

Week 3 moved from programs into assets. It established the mental model that tokens are account graphs: mints define the asset, token accounts hold balances, authorities control actions, and extensions add behavior through the token program.

## Source Capture

| Source | Path |
|---|---|
| Original PDF | `/a0/usr/projects/solana_bootcamp/resources/uploads/Solana_Developer_Course___Deck_03___Tokens.pdf` |
| Extracted text | `/a0/usr/projects/solana_bootcamp/resources/extracted/deck-03-tokens.txt` |
