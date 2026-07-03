---
name: exercises-child
description: Child DOX for exercises directory in Solana Bootcamp project.
---

# Exercises — Child AGENTS.md

## Purpose

Exercise implementations and completed work from the Encode Club Solana Developer Bootcamp.

## Child DOX Index

| Subdirectory | Purpose |
|--------------|----------|
| hello-solana/ | Week 2 Exercise 1 — First Anchor deployment |
| counter-pda/ | Week 2 Exercise 2 — PDA-backed counter |
| first-token/ | Week 3 — SPL Token creation and transfer |
| token-2022/ | Week 3 — Token-2022 with extensions |
| proposal-state-machine/ | Week 4 — CPI and state machine |
| tip-jar-cpi/ | Week 4 — CPI with tip jar |
| full-dapp-flow/ | Week 4-5 — Full dApp frontend |

## Local Contracts

- Exercise programs are Anchor projects with TypeScript clients
- Each exercise has its own directory with programs/, tests/, app/ subdirectories
- Programs deploy to devnet and are verified on Solana Explorer
- Client scripts and tests are in app/ and tests/ subdirectories

## Work Guidance

- Before editing an exercise: read root AGENTS.md chain to root
- After completing an exercise: update progress/assignments.md
- Verify deployments on Solana Explorer before marking complete

## Verification

- [ ] Exercise builds without errors: NO_DNA=1 anchor build
- [ ] Tests pass: NO_DNA=1 anchor test
- [ ] Program deployed to devnet
- [ ] Transaction verified on Solana Explorer
- [ ] progress/assignments.md updated
