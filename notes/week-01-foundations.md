# Week 1: Foundations — Learning Notes

## Key Concepts

### AI Learning Strategy
- **Verify Loop**: Always verify AI-generated code for constraints, versions, and security
- **Ask "Why"**: Understand reasoning, not just mechanics
- Identify what AI gets wrong and learn from it

### Solana Architecture

#### Account Model
- Everything is an account in Solana
- Accounts have: address (public key), lamports (balance), owner (program), data, executable flag
- **Rent exemption**: Accounts must maintain minimum balance or be closed
- Programs are stateless — all state lives in accounts

#### Programs
- Stateless binaries (like smart contracts)
- Programs process instructions but don't store state
- System Program owns default accounts
- Custom programs own accounts they create

#### Transactions
- Atomic: all instructions succeed or all fail
- Composable: multiple instructions in one transaction
- Lifecycle: client constructs → signs → submits → validator processes → block inclusion

#### PDAs (Program Derived Addresses)
- Deterministically derived from seeds + program ID
- No private key — only the program can sign for them
- Used for program-owned accounts with deterministic addresses

## Questions & Insights
*Add insights as you study the material*

## Resources
- Deck 00: Introduction
- Deck 01: Foundations
