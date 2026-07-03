---
name: solana-bootcamp-root
description: Root DOX file for the Encode Club Solana Developer Bootcamp project.
---

# Solana Bootcamp — Root AGENTS.md

## Purpose

Root DOX file for the Encode Club 6-Week Solana Developer Bootcamp project. Provides project-wide context for AI agents working in this workspace.

## Project Overview

- Program: Encode Club 6-Week Solana Developer Bootcamp (June 2026)
- Goal: Build operational confidence with Rust/CLI/Anchor on devnet
- Network: All deployments target Solana devnet
- Current: Completed Week 3 (June 27 2026)
- Tech Stack: Rust, Anchor v0.31.0, TypeScript, web3.js v2, Solana CLI, Anchor CLI
- Repo: https://github.com/ToXMon/solana-bootcamp

## Tech Stack

| Tool | Purpose |
|------|--------|
| Rust | On-chain program language |
| Anchor | Solana development framework |
| TypeScript | Client-side code |
| web3.js v2 | Solana JavaScript SDK |
| Solana CLI | Wallet, deploy, config, airdrop |
| Anchor CLI | Project scaffolding, build, test, deploy |
| Solana Explorer | Transaction/program verification |
| RPC | Network connectivity |

## Key Learning Principles

1. Verify everything on-chain — Check Explorer, dont trust terminal output
2. Understand the Account Model — Everything is an account in Solana
3. Master PDA reasoning — Derive addresses deterministically, debug seed mismatches
4. AI review discipline — Verify AI-generated code for constraints, versions, and security
5. Stateless programs — Programs dont store state; accounts do
6. Ask why — Understand the reasoning, not just the mechanics

## Development Rules

- Always verify deployments on Solana Explorer
- Use the AI Verify Loop before accepting AI-generated code
- Follow Anchor best practices for account validation and error handling
- Pin dependency versions explicitly
- Use PDAs correctly — understand seed derivation
- All accounts must be rent-exempt or use zero-lamport initialization
- Test programs locally before deploying to devnet
- Verify transaction signatures on-chain after every deployment
- All deployments target devnet
- Keep CLI configured to devnet: solana config set --url devnet

## Weekly Structure

- Week 1: Foundations (Mental Models)
- Week 2: First Deployments — Hello Solana, Counter PDA exercises
- Week 3: Programs and Frontend (completed)
- Week 4-6: Progressive Independence (remaining)

## Child DOX Index

| Directory | Purpose |
|-----------|--------|
| exercises/ | Exercise implementations and completed work |
| notes/ | Weekly learning notes and reflections |
| progress/ | Progress tracking and assignment status |
| resources/ | Reference materials, uploads, ecosystem analysis |
| social/ | Building in public content, drafts, published posts |
| projects/ | Larger project work (later weeks) |
| docs/ | Technical writing, ideas, proposals |
| tasks/ | Todo and plan tracking |

## Ownership

- Root DOX: Project-wide context and global rules
- Child DOX: Domain-specific rules for each subdirectory
- No child doc may weaken DOX

## Work Guidance

- Before editing: read the AGENTS.md chain from root to target path
- After meaningful changes: run a DOX pass — update affected AGENTS.md files
- Verify all Solana deployments on Solana Explorer
- Delegate Solana-specific work to subordinates with appropriate skills

## Verification

- [ ] Deployment verified on Solana Explorer
- [ ] Test results pass before reporting success
- [ ] AGENTS.md chain read before editing
- [ ] DOX pass completed after meaningful changes
