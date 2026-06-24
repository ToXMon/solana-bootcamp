# Assignment Tracker

## Week 1: Foundations
- [ ] Read all materials thoroughly
- [ ] Practice the AI verify loop
- [ ] (Optional) Read Rust basics (chapters 1-6 of The Rust Book)
- [ ] (Optional) Install development tools

## Week 2: First Deployments
- [x] Exercise 1 — Hello Solana: Setup environment, run default deploy ✅ Program ID: `ggUpdzgva3CDB3UeDS6ntkLKgHGvrL5ApwW395Sj4k3` on devnet
- [x] Exercise 2 — Counter PDA: Initialize and increment a PDA counter ✅ Program ID: `Box6VnMVRFpCsGJbfkVr6JGS1sHuLeJbVv3Yq3R9CtSZ` on devnet
- [x] Verify all deployments on Solana Explorer
- [x] Successfully run PDA tests (3/3 passing)

## Week 3: First Token
- [x] Exercise 3 — Create SPL token on devnet ✅ Mint: GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy
- [x] Exercise 3 — Create Associated Token Accounts (ATAs)
- [x] Exercise 3 — Mint 1000 tokens
- [x] Exercise 3 — Transfer tokens between wallets (100 to second wallet)
- [x] Exercise 3 — Build TypeScript balance reader (tsx, decimals handled)
- [x] Exercise 3 — Verify all operations on Solana Explorer (3 screenshots)

- [x] Exercise 4 — Token-2022 Extensions: Create mint with TransferFeeConfig + MetadataPointer + TokenMetadata ✅ Mint: `Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm`
- [x] Exercise 4 — Initialize on-chain metadata (name/symbol/URI)
- [x] Exercise 4 — Create ATA + mint 1000 tokens on Token-2022 program
- [x] Exercise 4 — Test transfer fee extension (200 sent, 198 received, 2 withheld = 1%)
- [x] Exercise 4 — TypeScript extension decoder (unpackMint + getExtensionTypes + getTransferFeeAmount)
- [x] Exercise 4 — Verify on Solana Explorer (mint + transfer tx + withheld fees)
- [x] Exercise 4 — Save metadata, explorer links, execution log

## Week 4: Programs & Frontend
- [x] Exercise 5 — Proposal State Machine: Build a proposal/voting program with guarded `Draft → Active → Closed` transitions. Instructions: `create_proposal`, `activate`, `vote`, `close`. Creator-only authority for activation and closing. Deploy to devnet and verify on Solana Explorer. ✅ Program ID: `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG` on devnet, 9/9 tests passing
- [x] Exercise 6 — Tip Jar CPI: Build a tip jar using CPI to the System Program. Implement user deposits with `invoke` and owner-only PDA withdrawals with `invoke_signed`. Deploy to devnet and verify. ✅ Program ID: `7BjcqxB1gqyudc5vY3yBrvxuNfktUi8RcpDc8wN77P7H` on devnet, 7/7 tests passing
- [x] Exercise 7 — Full Dapp Flow: Build a React frontend with Solana wallet adapter integration. Implement on-chain reads, signed transaction submission, wallet signing, and UI state refresh on devnet. ✅ Created StateBadge, ProposalCard, ProposalList components; updated App.tsx with header + proposal list layout; builds clean (tsc + vite build pass)
- [ ] Verify all Week 4 deployments on Solana Explorer
- [ ] Successfully run tests for Exercises 5 and 6

## Weeks 5-6
*Assignments will be added as course progresses*

- [x] Full dApp Flow — Create proposal form component integrated above proposal list and verified with `npm run build` on 2026-06-23.
