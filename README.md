# 🌐 Solana Developer Bootcamp — Encode Club

My journey through the **6-week Encode Club Solana Developer Bootcamp**, building real on-chain programs with Rust, Anchor, and Solana tokens.

## 📋 About

This repo tracks my complete bootcamp progress — exercises, projects, notes, and learnings. Everything deployed on **Solana devnet** and verified on-chain.

## 🛠 Tech Stack

| Tool | Purpose |
|------|----------|
| Rust | On-chain programs |
| Anchor | Solana framework |
| TypeScript | Client-side code |
| web3.js v2 | Solana JS SDK |
| Solana CLI | Wallet & deployment |
| Token-2022 | Programmable token extensions |

## 📁 Structure

```
├── exercises/          # Weekly exercises
│   ├── hello-solana/   # Week 2 — First deploy
│   ├── counter-pda/    # Week 2 — PDA counter
│   ├── first-token/    # Week 3 — First SPL token
│   └── token-2022/     # Week 3 — Token-2022 extensions
├── projects/           # Larger projects (later weeks)
├── notes/              # Learning notes & reflections
├── social/             # Building-in-public content (videos, threads, screenshots)
└── progress/           # Progress tracking
```

## 📅 Weekly Progress

| Week | Focus | Status |
|------|-------|--------|
| 1 | Foundations & Mental Models | ✅ Complete |
| 2 | First Deployments (Hello Solana, Counter PDA) | ✅ Complete |
| 3 | Tokens & Token-2022 Extensions | ✅ Complete |
| 4-6 | Progressive Independence | ⏳ Upcoming |

## 🚀 Deployments

### Programs

| Program | ID | Network | Explorer |
|---------|-----|---------|----------|
| hello-solana | `ggUpdzgva3CDB3UeDS6ntkLKgHGvrL5ApwW395Sj4k3` | Devnet | [View](https://explorer.solana.com/address/ggUpdzgva3CDB3UeDS6ntkLKgHGvrL5ApwW395Sj4k3?cluster=devnet) |
| counter-pda | `Box6VnMVRFpCsGJbfkVr6JGS1sHuLeJbVv3Yq3R9CtSZ` | Devnet | [View](https://explorer.solana.com/address/Box6VnMVRFpCsGJbfkVr6JGS1sHuLeJbVv3Yq3R9CtSZ?cluster=devnet) |

### Tokens

| Token | Mint | Type | Explorer | Video |
|-------|------|------|----------|-------|
| First SPL Token | `GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy` | SPL Token | [View](https://explorer.solana.com/address/GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy?cluster=devnet) | [MP4](social/first-token-video.mp4) |
| Bootcamp Token 2022 | `Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm` | Token-2022 (transfer fee + metadata) | [View](https://explorer.solana.com/address/Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm?cluster=devnet) | [MP4](social/token-2022-video.mp4) |

## 🔑 Key Principles

- **Verify everything on-chain** — Solana Explorer, not just terminal output
- **AI Verify Loop** — validate AI-generated code for constraints, versions, security
- **Ask "why"** — understand reasoning, not just mechanics
- **Stateless programs** — programs don't store state, accounts do
- **Token-2022 extensions are permanent** — choose wisely at creation time

## 🎥 Building in Public

All social content lives in [`social/`](social/):
- Explorer screenshots for every deployment
- Remotion videos for token milestones
- X/Twitter thread drafts

---

*Built with [Encode Club](https://www.encodeclub.com/) & [Solana](https://solana.com/)*
