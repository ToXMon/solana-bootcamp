# Exercise 8 — Trustless Escrow Program Design

**Status**: Design complete; ready for test-first implementation
**Anchor version**: 0.31.0
**Token program**: Classic SPL Token (anchor_spl::token)

## Overview

Two parties swap tokens without trusting each other. The maker deposits Token A into a PDA-controlled vault. Any taker who sends the required Token B amount completes the swap atomically. The maker can cancel and reclaim Token A at any time before the swap completes.

```
Maker deposits Token A -> vault (PDA-owned)
                                | taker sends Token B to maker
                                | vault releases Token A to taker
                                | vault + escrow accounts closed, rent returned
```

## State Structure

### Escrow Account (PDA)

```rust
#[derive(InitSpace)]
#[account]
pub struct Escrow {
    pub seed: u64,        // Arbitrary seed for uniqueness
    pub maker: Pubkey,    // Maker wallet address (authority)
    pub mint_a: Pubkey,   // Token the maker is offering
    pub mint_b: Pubkey,   // Token the maker wants in return
    pub receive: u64,     // Amount of Token B required to complete swap
    pub bump: u8,         // PDA bump seed for signer reconstruction
}
```

Space: 8 (discriminator) + 8 + 32 + 32 + 32 + 8 + 1 = 121 bytes

### PDA Seeds

```
["escrow", maker_pubkey, seed_as_le_u64]
```

- Each maker can run multiple escrows simultaneously via different seeds
- PDA address is deterministic and verifiable
- Only the program can sign as the PDA to release vault funds

### Vault Token Account

An Associated Token Account (ATA) for mint_a with authority = escrow PDA.

```
vault = get_associated_token_address(escrow_pda, mint_a)
```

Critical: vault token authority is the escrow PDA, not the maker. Only program logic can move vault funds.

## Instructions

### make(seed: u64, receive: u64, amount: u64)

Maker opens an escrow and locks Token A in the vault.

**Validation**: receive > 0, amount > 0

**Accounts**:
- maker: Signer (mut) — pays for account creation
- escrow: Account<Escrow> (init, PDA-seeded)
- mint_a: Account<Mint>
- mint_b: Account<Mint>
- maker_ata_a: Account<TokenAccount> (mut, maker's Token A source)
- vault: Account<TokenAccount> (init, ATA owned by escrow PDA)
- associated_token_program: Program<AssociatedToken>
- token_program: Program<Token>
- system_program: Program<System>

**Logic**:
1. Store escrow fields manually (no set_inner in 0.31):
   - escrow.seed = seed
   - escrow.maker = maker.key()
   - escrow.mint_a = mint_a.key()
   - escrow.mint_b = mint_b.key()
   - escrow.receive = receive
   - escrow.bump = ctx.bumps.escrow
2. Transfer `amount` of Token A from maker_ata_a to vault using transfer_checked with mint decimals

### take()

Taker completes the atomic swap.

**Accounts**:
- taker: Signer (mut)
- maker: SystemAccount (mut) — receives Token B and rent
- escrow: Account<Escrow> (mut, close=maker, PDA-seeded, has_one on maker/mint_a/mint_b)
- mint_a, mint_b: Account<Mint>
- vault: Account<TokenAccount> (mut, ATA owned by escrow)
- taker_ata_a: Account<TokenAccount> (init_if_needed, taker's Token A destination)
- taker_ata_b: Account<TokenAccount> (mut, taker's Token B source)
- maker_ata_b: Account<TokenAccount> (init_if_needed, maker's Token B destination)
- associated_token_program, token_program, system_program

**Logic**:
1. Transfer escrow.receive of Token B from taker_ata_b to maker_ata_b (taker signs)
2. Transfer vault.amount (all) of Token A from vault to taker_ata_a (PDA signs)
3. Close vault account (rent -> maker)
4. Escrow closed via close=maker constraint (rent -> maker)

**PDA signer seeds**:
```rust
let signer_seeds = &[
    b"escrow".as_ref(),
    maker.key.as_ref(),
    &escrow.seed.to_le_bytes(),
    &[escrow.bump],
];
```

### cancel()

Maker reclaims Token A and closes the escrow.

**Accounts**:
- maker: Signer (mut)
- escrow: Account<Escrow> (mut, close=maker, PDA-seeded, has_one on maker/mint_a)
- mint_a: Account<Mint>
- vault: Account<TokenAccount> (mut, ATA owned by escrow)
- maker_ata_a: Account<TokenAccount> (init_if_needed, maker's Token A destination)
- associated_token_program, token_program, system_program

**Logic**:
1. Transfer vault.amount (all) of Token A from vault back to maker_ata_a (PDA signs)
2. Close vault account (rent -> maker)
3. Escrow closed via close=maker constraint (rent -> maker)

## Errors

```rust
#[error_code]
pub enum EscrowError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid maker")]
    InvalidMaker,
    #[msg("Invalid mint a")]
    InvalidMintA,
    #[msg("Invalid mint b")]
    InvalidMintB,
}
```

## Failure-Path Test Matrix

| # | Test Case | Setup | Expected Behavior | Signal |
|---|---|---|---|---|
| 1 | Make -> Take (happy path) | Maker deposits 1.0 Token A, receive = 0.5 Token B | Taker sends 0.5 Token B, receives 1.0 Token A. Vault and escrow closed. | Success. Balances reconcile. |
| 2 | Make -> Cancel (happy path) | Maker deposits 1.0 Token A | Maker reclaims 1.0 Token A. Vault and escrow closed. | Success. Balance restored. |
| 3 | Double-take rejection | After test 1 (escrow closed) | Second take fails. | AccountNotInitialized |
| 4 | Take after cancel | After test 2 (escrow closed) | Take fails. | AccountNotInitialized |
| 5 | Wrong mint B | Taker uses different mint B | has_one = mint_b fails. | EscrowError::InvalidMintB |
| 6 | Non-maker cancel | Non-maker tries cancel | has_one = maker or seed mismatch. | EscrowError::InvalidMaker or ConstraintSeeds |
| 7 | Insufficient taker funds | Taker lacks Token B | Token transfer CPI fails. | InsufficientFunds |
| 8 | Balance reconciliation | After all tests | Total supply conserved. No mint/burn. | Pass: totals match. |

## Security Checklist

- [ ] Vault token authority = escrow PDA (not maker)
- [ ] has_one constraints on mint_a, mint_b, maker fire before token movement
- [ ] close = maker returns rent to maker
- [ ] PDA seeds include maker pubkey + seed (no cross-user collisions)
- [ ] transfer_checked validates mint decimals on every CPI
- [ ] No unwrap() or expect() in program code
- [ ] receive > 0 and amount > 0 validated in make
- [ ] Escrow bump stored and used for signer reconstruction

## Reference Translation (Anchor 1.0 -> 0.31)

| Change | Reference (1.0) | This Project (0.31) |
|---|---|---|
| Token types | InterfaceAccount<Mint> | Account<Mint> |
| Token program | Interface<TokenInterface> | Program<Token> |
| Token CPI | token_interface::transfer_checked | token::transfer_checked |
| Close account | token_interface::close_account | token::close_account |
| State init | set_inner() | manual field assignment |
| Account discriminator | #[account(discriminator = 1)] | #[account] |
| Box wrapping | Box<Account<...>> | Account<...> |
| Tests | LiteSVM (Rust) | ts-mocha (TypeScript on devnet) |

## File Structure Plan

```
exercises/escrow-program/
  VERSION_MATRIX.md
  DESIGN.md
  Anchor.toml
  Cargo.toml
  package.json
  tsconfig.json
  programs/
    escrow-program/
      Cargo.toml
      src/
        lib.rs
        state.rs
        errors.rs
        instructions/
          mod.rs
          make.rs
          take.rs
          cancel.rs
  tests/
    escrow-program.ts
  migrations/
    deploy.ts
```
