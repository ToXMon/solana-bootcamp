# Exercise 10 - NFTs & Metadata

Umi + Metaplex Token Metadata NFT collection on Solana devnet.

## What This Does

- Mints one parent collection NFT
- Mints three member NFTs with verified collection references
- Lists all NFTs with names, images, and attributes

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| @metaplex-foundation/umi | 0.9.2 | Umi framework |
| @metaplex-foundation/umi-bundle-defaults | 0.9.2 | Umi devnet bundle |
| @metaplex-foundation/mpl-token-metadata | 3.4.0 | Token Metadata instructions |
| @solana/web3.js | 1.95.4 | Keypair utilities |
| tsx | 4.22.4 | TypeScript script runner |
| typescript | 5.7.2 | Type checking |

## Prerequisites

- Devnet wallet at `~/.config/solana/id.json` with SOL
- Solana CLI configured to devnet

## Usage

```bash
npm install
npx tsx src/mint-collection.ts   # Mint collection + 3 members
npx tsx src/list-collection.ts   # Fetch and display collection
```

## File Structure

```
nft-collection/
  package.json
  tsconfig.json
  README.md
  .gitignore
  src/
    umi-setup.ts         - Umi instance + devnet signer
    mint-collection.ts   - Mint collection + 3 verified members
    list-collection.ts   - Fetch and print collection items
  metadata/
    collection.json      - Collection NFT metadata
    member-1.json        - Member NFT 1 metadata
    member-2.json        - Member NFT 2 metadata
    member-3.json        - Member NFT 3 metadata
```

## Metadata URIs

Uses `data:application/json;base64,...` URIs - metadata JSON is embedded
directly in the on-chain URI field. No external hosting required, URIs
always resolve to valid JSON.

## NFT Foundations

- Mint supply: 1
- Decimals: 0
- Non-fungible behavior from metadata (TokenStandard.NonFungible)
- Collection verification via `verifyCollectionV1` instruction

## Verification

After minting, verify on [Solana Explorer](https://explorer.solana.com?cluster=devnet):
- Collection NFT shows `Collection` flag
- Member NFTs show verified collection reference
