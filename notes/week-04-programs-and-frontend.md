# Week 4: Programs & Frontend

**Deck**: Solana Developer Course — Deck 04 — Programs & Frontend
**Date**: 2026-06-22
**Status**: In Progress — Deck read, exercises not yet started

## Core Concepts

### Programs Are Stateless
- Solana programs are just executable code stored on-chain.
- All persistent state lives in accounts, not in the program.
- This is why PDAs matter: they give programs deterministic, program-owned accounts.

### State Machines and Guarded Transitions
- Model on-chain data as a state machine with explicit states and allowed transitions.
- Reject invalid transitions at the instruction level using Anchor constraints.
- Example: a proposal moves `Draft → Active → Closed`, and only the creator can call `activate` or `close`.

### Cross-Program Invocations (CPI)
- CPI lets one program call another program's instruction.
- `invoke` is used when the user signs the transaction.
- `invoke_signed` is used when a PDA must sign on behalf of the program.
- CPI is the foundation of Solana composability.

### Frontend Transaction Flow
- Wallet adapter connects the browser keypair.
- Anchor IDL gives TypeScript typed access to the program.
- Read: `program.account.<account>.fetch(pda)`
- Write: `program.methods.<instruction>(...).accounts({...}).rpc()`
- Always refetch on-chain state after a transaction to refresh the UI.

## Exercises

### Exercise 5 — Proposal State Machine
- Build a proposal/voting program.
- Instructions: `create_proposal`, `activate`, `vote`, `close`.
- State transitions guarded by authority and proposal state.
- Track `yesVotes` and `noVotes`.
- PDA design: derive proposal account from a stable identifier.

### Exercise 6 — Tip Jar CPI
- Build a tip jar program.
- Deposit: user transfers SOL into a PDA vault using `invoke` (System Program transfer).
- Withdraw: owner drains the vault using `invoke_signed` (PDA signs).
- Vault PDA seeds: `["vault", owner_wallet]`.

### Exercise 7 — Full Dapp Flow
- React frontend with Solana wallet adapter.
- Read on-chain state and render it.
- Submit signed transactions.
- Refresh UI after transactions confirm.

## Key Commands

```bash
anchor build
anchor test --provider.cluster devnet
```

## Wallet Adapter Packages

- `@solana/wallet-adapter-base`
- `@solana/wallet-adapter-react`
- `@solana/wallet-adapter-react-ui`
- `@solana/wallet-adapter-wallets`

## Common Failure Modes to Watch

- Seed mismatch when deriving PDAs (double-check seeds + bump)
- Missing `mut` on writable accounts
- Using `invoke` when the PDA should sign (needs `invoke_signed`)
- IDL version mismatch between program and frontend
- Wallet adapter not configured for devnet
- Forgetting to refetch on-chain state after a transaction

## Next Steps

1. Scaffold Exercise 5 (proposal state machine).
2. Build and test locally before devnet deployment.
3. Verify program ID and transactions on Solana Explorer.
4. Move to Exercise 6 (CPI tip jar) once tests pass.
