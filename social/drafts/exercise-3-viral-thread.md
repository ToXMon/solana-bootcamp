# Exercise 3: First SPL Token — Viral Thread Draft

## Context
- Exercise 3 completed: First SPL token on Solana devnet
- Mint: GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy
- Supply: 1000 tokens, 9 decimals (same as SOL)
- Transferred 100 to second wallet (3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X)
- Main wallet: 900 tokens, Second wallet: 100 tokens
- Transfer tx: kJ1bUjJte5rcgwLSD9aLm1CjxqydGvTCiFZxdeECSQREDd3uEivTp8o5ZexUjFxyLzVGJcGA5R2UTcto522A5ds
- Fee: 0.000005 SOL, 19,773 CUs
- Screenshots: first-token-mint-explorer.png, first-token-balances-explorer.png, first-token-transfer-tx-explorer.png

---

## Option A: Single Viral Tweet (280 chars max)

1000 tokens minted. 100 transferred. 0.000005 SOL fee.

My first SPL token on Solana devnet is live.

Wallets don't hold tokens. Token accounts do. ATAs are deterministic.

Mint: GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy

#Solana #BuildInPublic #Web3 #EncodeClub

---

## Option B: Thread (6 tweets)

### Tweet 1/6 (Hook)

1000 tokens minted. 100 transferred. 0.000005 SOL fee.

My first SPL token on Solana devnet is live.

The biggest surprise: wallets don't hold tokens. At all.

Thread on what I learned building this 🧵

#Solana #BuildInPublic #EncodeClub

### Tweet 2/6 (Key Insight)

Your wallet doesn't hold tokens. Token accounts do.

ATAs (Associated Token Accounts) are deterministic addresses derived from your wallet + the mint.

Anyone can calculate your ATA. The address is not a secret.

#Solana #Web3

### Tweet 3/6 (Decimals)

Decimals are not optional.

The chain stores integers only. With 9 decimals (same as SOL), 1000 tokens = 1,000,000,000,000 base units.

Forget to divide by 10^decimals in your balance reader and you show 1000x the wrong amount.

Done that. Fixed it.

### Tweet 4/6 (Struggles)

Two real issues hit during the build:

1. Transfer to unfunded wallet failed. Fix: --fund-recipient flag
2. Decimals handling in TypeScript balance reader

Both one-command fixes. This is why you run the commands instead of just reading about them.

### Tweet 5/6 (Verification)

Verified everything on Solana Explorer. Never trust terminal output alone.

Mint address:
https://explorer.solana.com/address/GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy?cluster=devnet

900 tokens in main wallet. 100 in test wallet. On-chain.

### Tweet 6/6 (Transfer + CTA)

Transfer tx:
https://explorer.solana.com/tx/kJ1bUjJte5rcgwLSD9aLm1CjxqydGvTCiFZxdeECSQREDd3uEivTp8o5ZexUjFxyLzVGJcGA5R2UTcto522A5ds?cluster=devnet

19,773 CUs. 0.000005 SOL fee. Finalized in seconds.

Next: more complex token ops. Building in public.

Drop your devnet address if you're learning too 👇

#Solana #BuildInPublic #Web3

---

## Deslop Self-Audit

| Criterion | Score | Notes |
|-----------|-------|-------|
| Directness | 9/10 | Starts with numbers, no throat-clearing |
| Rhythm | 9/10 | Short facts mixed with longer technical explanations |
| Trust | 9/10 | No hedging, confident tone throughout |
| Authenticity | 9/10 | "Done that. Fixed it." shows human self-deprecation |
| Density | 9/10 | Every tweet carries substance, no fluff |
| **Total** | **45/50** | Meets minimum threshold |

## Banned Words Check
- No: delve, leverage, seamlessly, transformative, pivotal, harness, robust, scalable, holistic, synergy, empower, streamline, foster, facilitate, utilize, implement, comprehensive, cutting-edge, game-changing, paradigm shift, revolutionize, unprecedented
- No: it's worth noting, notably, certainly, absolutely, of course, in conclusion, in summary
- No banned structures detected (no question-answer hook, no em-dash crutch, no "It isn't just X, it's Y")

## Posting Notes
- Attach screenshots: first-token-mint-explorer.png, first-token-balances-explorer.png, first-token-transfer-tx-explorer.png
- Tag @encodeclub @solana @solana_devs in the thread
- Twitter auto-shortens URLs to 23 chars via t.co wrapping
- Best posting time: weekdays 9-11am or 7-9pm UTC
- Format: Building in public / Educational
- Pillar: Behind-the-scenes + Educational
