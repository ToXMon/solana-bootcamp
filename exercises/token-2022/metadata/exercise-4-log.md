# Exercise 4 — Token-2022 Extensions (Execution Log)

**Date:** 2026-06-19
**Cluster:** devnet
**Wallet:** HnzAHTLny7JdWacKbWHmYhs66Yq4cEhUiiPUDvjJLYnx

## TL;DR

Created a Token-2022 mint `Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm` with three extensions:
1. **TransferFeeConfig** — 100 bps (1%) fee on every transfer, max 1,000,000,000 raw
2. **MetadataPointer** — points metadata to the mint itself
3. **TokenMetadata** — on-chain name/symbol/URI (`Bootcamp Token 2022` / `BOOT2022`)

Verified the transfer fee by sending 200 tokens to a second wallet across two transactions: 198 arrived, 2 were withheld (1%).

## Key Addresses

| Entity | Address |
|--------|---------|
| Mint | `Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm` |
| Main wallet ATA | `6fsRkKavjzLGLxTcea5B7SXmwWDfJbCttVp1z55dPySa` |
| Second wallet ATA | `6wuPowTeW1ngx1SUBEefWYaWGRjhvA7SaeDCUJSW1ree` |
| Second wallet (owner) | `3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X` |
| Mint keypair | `exercises/token-2022/mint-keypair.json` |

## Transaction Signatures

| Step | Signature |
|------|-----------|
| Create mint (TransferFee + MetadataPointer) | `2nSep1Pxn5qAWNDy3XCJr6hhAmAAwv2GjkdSCHBh516XHj8zTVVynmK8xd52aNStE7KFzRq1FKiCQuppY3ZNQ5xQ` |
| Initialize TokenMetadata | `2RZG2rQqcnVA3eY9ofkiq18CWz6AB5vSeFVno172gTuzn5o3fDda8UTrtqKSuV5iuBeNU8BfgPyM7wLKAW3z5XMQ` |
| Create main ATA | `mzpvHTitTmqDhqczBFcvMcenMscTRdGFmFXyfmcAcT6snEcuaZWM5f4xASYxCXdwYbSxBmcWvSHchisRFRY4WY2` |
| Mint 1000 tokens | `2Umz11ei2n2AgKNKucSFb7di7cAcnPVEDfH8uWfBE3aaBqtaNkSneGKUrdKP2AGxjwnbouK9Km3uZSTMtQDZV6rZ` |
| Fund second wallet (0.05 SOL) | `5ZFcFnfMu521mKqgwUCfDWC3SLyqgAeZN1nGUepk9367rJSJ9UPvtMvZhQ2nLjfxu8dbnPqT5JVhVDpBG2doHcZw` |
| Transfer with fee (1) | `3KTfYmvroxn27Si7VAPsZc4NBb2jGmGc8FhLXoiEGJJkvSRMfYi5cZ6jwnyPUcx5GBHDREo6BdvsAbdhAGjcW5B1` |
| Transfer with fee (2) | `3MNTq9EAPfr4F32fFfGQKz8yA3StqUCSGLNEVoUYD4euUuaDGVAQH8WsBCsC58GsofLy3gdwmU95YVEweH8LijT` |

## Step-by-step

### 1. Created exercise dirs
```bash
mkdir -p exercises/token-2022/{scripts,metadata}
```

### 2. Generated mint keypair
```bash
solana-keygen new --no-bip39-passphrase --silent --outfile mint-keypair.json
# => Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm
```

### 3. Created Token-2022 mint with TransferFee + MetadataPointer extensions
```bash
NO_DNA=1 spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --enable-metadata \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 1000000000 \
  --decimals 9 \
  mint-keypair.json
```
- Program ID `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` selects Token-2022 (NOT classic `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
- `--enable-metadata` adds MetadataPointer + reserves space for TokenMetadata
- `--transfer-fee-basis-points 100` = 1% fee (100/10000)
- `--transfer-fee-maximum-fee 1000000000` = cap in raw units (1 token with 9 decimals)
- Extensions are PERMANENT — cannot be added to existing mints

### 4. Initialized TokenMetadata (name/symbol/URI)
```bash
NO_DNA=1 spl-token initialize-metadata Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm \
  "Bootcamp Token 2022" "BOOT2022" \
  "https://arweave.net/bootcamp-token-2022-metadata.json"
```
The mint authority must sign. This populates the TokenMetadata TLV block inside the mint account.

### 5. Created main ATA and minted 1000 tokens
```bash
NO_DNA=1 spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-account $MINT
NO_DNA=1 spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb mint $MINT 1000
```
ATA derivation MUST use TOKEN_2022_PROGRAM_ADDRESS, otherwise the ATA lands under the classic Token program and is incompatible.

### 6. Transfer fee test
The second wallet had 0 SOL, so ATA funding failed twice:
- `--fund-recipient` requires the recipient wallet to exist on-chain
- Airdrop was rate-limited

Fix: transferred 0.05 SOL from main wallet to second wallet, then retried:
```bash
NO_DNA=1 solana transfer 3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X 0.05 --allow-unfunded-recipient
NO_DNA=1 spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb transfer $MINT 100 $SECOND_WALLET --fund-recipient
```

### 7. Verification of fee
| Account | Pre | Post | Delta |
|---------|-----|------|-------|
| Main ATA | 1000 | 800 | -200 (sent 200) |
| Second ATA | 0 | 198 | +198 (received 99%) |
| Withheld on Second ATA | 0 | 2 (raw 2,000,000,000) | +2 (1% fee) |

Fee math: 200 × 1% = 2 tokens withheld. Confirmed by `spl-token display` showing `Transfer fees withheld: 2000000000`.

### 8. TypeScript decoder
`scripts/decode-extensions.ts` uses `@solana/spl-token` `unpackMint` + `getExtensionTypes` + `getTransferFeeAmount` to:
- Fetch mint via `Connection.getAccountInfo`
- List extension TLV types
- Print base mint fields (supply, decimals, authorities)
- Fetch both ATAs and show their `TransferFeeAmount.withheldAmount`

Run:
```bash
cd exercises/token-2022/scripts
npm install
npx tsx decode-extensions.ts
```

Output captured in `metadata/decoder-output.txt`.

## Issues & Solutions

1. **Recipient not funded error** — Second wallet had 0 SOL. Fix: transfer SOL from main wallet before retrying `--fund-recipient`.
2. **Airdrop rate-limited** — Devnet faucet rejected the airdrop. Fix: used existing main wallet SOL balance instead.
3. **Extension enum IDs differ across versions** — `spl-token` 0.4.0 reports `UnknownExtension(33529)` for MetadataPointer. The semantic meaning is still clear from `spl-token display` output, which prints `Metadata Pointer:` correctly.
4. **Legacy spl-token CLI flag discovery** — Used `spl-token create-token --help | grep` to find `--transfer-fee-basis-points`, `--transfer-fee-maximum-fee`, and `--enable-metadata`. The bundled help text covers all extension flags.

## Costs
- Main wallet SOL: 5.352875 → 5.29407932 (≈0.058 SOL spent on rents + fees + 0.05 SOL top-up to second wallet)
- Per-token-2022 mint rent: ~0.0044 SOL (510-byte account with extensions)
- Per-ATA rent: ~0.002 SOL
