# Week 5 Version Matrix

## Toolchain

| Tool | Version | Path |
|---|---|---|
| Anchor CLI | 0.31.0 | /root/.cargo/bin/anchor |
| Rustc | 1.96.0 (ac68faa20 2026-05-25) | /root/.cargo/bin/rustc |
| Cargo | 1.96.0 (30a34c682 2026-05-25) | /root/.cargo/bin/cargo |
| Solana CLI | 2.2.7 (Agave) | system PATH |
| Node | v22.22.0 | system PATH |
| npm | 9.2.0 | system PATH |
| Yarn | 1.22.22 | system PATH |

## Solana Config

| Setting | Value |
|---|---|
| RPC URL | https://api.devnet.solana.com |
| WebSocket | wss://api.devnet.solana.com/ |
| Keypair | /root/.config/solana/id.json |
| Commitment | confirmed |
| Wallet Address | HnzAHTLny7JdWacKbWHmYhs66Yq4cEhUiiPUDvjJLYnx |
| Wallet Balance | 0.83 SOL |

## Project Dependencies (from existing exercises)

| Dependency | Version | Source |
|---|---|---|
| anchor-lang | 0.31.0 | Exercises 5, 6 Cargo.toml |
| anchor-spl | not yet used, will pin 0.31.0 | New for Exercise 8 |
| @coral-xyz/anchor | ^0.31.0 | Exercises 5, 6 package.json |
| @coral-xyz/anchor | ^0.30.1 | Exercise 7 package.json |
| @solana/web3.js | ^1.91.8 | Exercise 7 package.json |
| chai | ^4.3.4 | Exercises 5, 6 test deps |
| ts-mocha | ^10.0.0 | Exercises 5, 6 test runner |

## Anchor 0.31 vs 1.0 Translation Guide

| Concept | Anchor 0.31 (this project) | Anchor 1.0 (reference repo) |
|---|---|---|
| Token types | anchor_spl::token::{Mint, TokenAccount, Token} | anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface} via InterfaceAccount |
| Token CPI | anchor_spl::token::transfer_checked | anchor_spl::token_interface::transfer_checked |
| Account wrapper | Account<'info, T> | InterfaceAccount<'info, T> or Account<'info, T> |
| State init | Manual field assignment | set_inner() method |
| init_if_needed | Feature flag on anchor-lang | Available natively |
| TS client | @coral-xyz/anchor | @anchor-lang/core |
| Test runner | ts-mocha on devnet/localnet | LiteSVM / Surfpool |
| Token program | Program<'info, Token> | Interface<'info, TokenInterface> |
| Close account | anchor_spl::token::close_account | anchor_spl::token_interface::close_account |

## Decisions for Exercise 8

1. Use classic SPL Token types (anchor_spl::token), not token_interface.
2. Use transfer_checked for all token CPIs, it validates decimals.
3. Use init_if_needed feature flag on anchor-lang (same as Exercise 5).
4. Use ts-mocha + devnet tests (same as Exercises 5 and 6).
5. Use @coral-xyz/anchor ^0.31.0 for any TypeScript client code.
6. Vault ATA is owned by the escrow PDA (not the maker).
