# Exercise 4 — Token-2022 Extensions

**Cluster:** devnet
**Mint:** `Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm`
**Explorer:** https://explorer.solana.com/address/Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm?cluster=devnet

## What is Token-2022?

Token-2022 (program ID `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`) is the
next-generation SPL token program. It is **not** a drop-in replacement for the
classic Token program (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`); it is a
*superset* that supports **extensions** — optional features bolted onto a mint
at creation time.

| Aspect | Classic Token | Token-2022 |
|--------|---------------|------------|
| Program ID | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Extensions | None | 25+ (transfer fee, metadata, non-transferable, hooks, …) |
| Account size | Fixed (82 bytes mint, 165 bytes account) | Variable (TLV-encoded, grows with extensions) |
| ATA derivation | `TOKEN_PROGRAM_ID` | `TOKEN_2022_PROGRAM_ID` (different program → different ATA) |
| Extensions at runtime | N/A | **Permanent** — set at mint creation, cannot be added later |

Extensions are encoded as **TLV (Type-Length-Value)** blocks appended after the
base mint/account data. This is why a Token-2022 mint is 510 bytes here while a
classic mint is only 82 bytes.

## Extensions configured on this mint

This mint was created with **three** extensions (one CLI flag enables two):

| # | Extension | Purpose |
|---|-----------|---------|
| 1 | `TransferFeeConfig` | Charges a fee on every transfer. Configured at 100 bps (1%) with a max fee of 1,000,000,000 raw (1 token at 9 decimals). Fees accrue on the recipient token account as `TransferFeeAmount.withheldAmount` and are withdrawable by the `withdrawWithheldAuthority`. |
| 2 | `MetadataPointer` | Points consumers to where the token's metadata lives. Here it points to the mint itself (metadata is embedded in the same account). |
| 3 | `TokenMetadata` | The actual metadata payload: name `Bootcamp Token 2022`, symbol `BOOT2022`, URI `https://arweave.net/bootcamp-token-2022-metadata.json`. Lives inside the mint account as a TLV block. |

Additionally, every Token-2022 ATA automatically gets `ImmutableOwner` (the
ATA owner cannot be changed by a malicious instruction) and, when the mint has
`TransferFeeConfig`, the ATA gets `TransferFeeAmount` to track withheld fees.

## How the transfer fee works

1. **Configuration (one-time, at mint creation):** The `transferFeeConfigAuthority`
   can later call `setTransferFee` to change the fee percentage or maximum within
   the constraints encoded at creation. The `withdrawWithheldAuthority` can sweep
   accumulated fees.
2. **On every transfer:** The Token-2022 program computes `fee = min(amount * bps / 10000, maxFee)`
   and deducts it from the amount the *recipient* receives. The withheld amount
   stays on the **recipient** token account (not the mint) in the
   `TransferFeeAmount.withheldAmount` field.
3. **Withdrawal:** The `withdrawWithheldAuthority` calls `withdrawWithheldTokensFromAccounts`
   to move accrued fees to a designated account.

### Verified on devnet

We sent 200 tokens (across two 100-token transfers) from the main wallet to a
second wallet:

| Account | Before | After | Delta |
|---------|--------|-------|-------|
| Main wallet ATA | 1000 | 800 | −200 (sent) |
| Second wallet ATA | 0 | 198 | +198 (received) |
| Withheld on Second ATA | 0 | 2 (raw 2,000,000,000) | +2 (1% fee) |

200 × 1% = 2 tokens withheld. Confirmed by `spl-token display` showing
`Transfer fees withheld: 2000000000` on the second wallet's ATA.

## How to inspect extensions

### CLI
```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  display Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm
```

### TypeScript decoder

`scripts/decode-extensions.ts` uses `@solana/spl-token` to fetch the mint via
`Connection.getAccountInfo`, then:

- `unpackMint(pubkey, accountInfo, TOKEN_2022_PROGRAM_ID)` → typed mint with TLV data
- `getExtensionTypes(data)` → array of `ExtensionType` enum values
- `getTransferFeeAmount(account)` → `{ withheldAmount: bigint }` on token accounts

Run:
```bash
cd exercises/token-2022/scripts
npm install
npx tsx decode-extensions.ts
```

Output captured in `metadata/decoder-output.txt`.

## Key addresses

| Entity | Address |
|--------|---------|
| Mint | `Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm` |
| Main wallet | `HnzAHTLny7JdWacKbWHmYhs66Yq4cEhUiiPUDvjJLYnx` |
| Main wallet ATA | `6fsRkKavjzLGLxTcea5B7SXmwWDfJbCttVp1z55dPySa` (800 tokens) |
| Second wallet | `3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X` |
| Second wallet ATA | `6wuPowTeW1ngx1SUBEefWYaWGRjhvA7SaeDCUJSW1ree` (198 tokens, 2 withheld) |
| Mint keypair | `exercises/token-2022/mint-keypair.json` |

## Reproduction commands

```bash
export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
MINT=Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm

# Create Token-2022 mint with TransferFee + MetadataPointer
NO_DNA=1 spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --enable-metadata \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 1000000000 \
  --decimals 9 \
  mint-keypair.json

# Initialize on-chain metadata
NO_DNA=1 spl-token initialize-metadata $MINT "Bootcamp Token 2022" BOOT2022 \
  https://arweave.net/bootcamp-token-2022-metadata.json

# Create ATA + mint 1000 tokens
NO_DNA=1 spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-account $MINT
NO_DNA=1 spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb mint $MINT 1000

# Transfer with fee (recipient must be funded with SOL for ATA rent)
NO_DNA=1 solana transfer 3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X 0.05 --allow-unfunded-recipient
NO_DNA=1 spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb transfer $MINT 100 \
  3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X --fund-recipient
```

## Files

```
exercises/token-2022/
├── README.md                  ← this file
├── mint-keypair.json          ← mint keypair (KEEP SECRET in real deployments)
├── scripts/
│   ├── package.json
│   └── decode-extensions.ts    ← TS extension decoder
└── metadata/
    ├── token-2022-metadata.json   ← structured mint metadata
    ├── explorer-links.json         ← all Explorer URLs
    ├── exercise-4-log.md          ← full execution log + signatures
    ├── decoder-output.txt         ← captured TS decoder output
    ├── create-mint-output.txt
    ├── init-metadata-output.txt
    ├── create-ata-main.txt
    ├── mint-tokens.txt
    ├── transfer-fee-test.txt
    ├── main-balance-after.txt
    ├── second-balance-after.txt
    ├── sol-transfer-second.txt
    └── display-mint-after-mint.txt
```

## Learnings

1. **Extensions are permanent.** `--enable-metadata` + `--transfer-fee-basis-points`
   must be passed at `create-token` time. There is no `spl-token add-extension`.
2. **ATA derivation is program-specific.** Using the classic Token program ID to
   derive an ATA for a Token-2022 mint produces an account under the wrong program
   — unusable. Always pass `--program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`.
3. **`--fund-recipient` requires the recipient wallet to exist on-chain.** A
   wallet with 0 SOL cannot receive an ATA creation because ATA rent must be
   paid. Fix: fund the recipient with a small SOL transfer first.
4. **Devnet airdrops are rate-limited.** When the faucet rejects an airdrop,
   transfer SOL from an already-funded wallet instead.
5. **Withheld fees land on the recipient, not the mint.** The mint's
   `Withheld fees: 0` stays zero; the recipient ATA accumulates the fee in its
   `TransferFeeAmount` extension.
