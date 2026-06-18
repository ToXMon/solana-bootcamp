# Exercise 3: First SPL Token — Viral Thread V2 (Personal Narrative)

## Context
- Exercise 3 completed: First SPL token on Solana devnet
- Mint: GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy
- Supply: 1000 tokens, 9 decimals (same as SOL)
- Transferred 100 to second wallet (3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X)
- Main wallet: 900 tokens, Second wallet: 100 tokens
- Transfer tx: kJ1bUjJte5rcgwLSD9aLm1CjxqydGvTCiFZxdeECSQREDd3uEivTp8o5ZexUjFxyLzVGJcGA5R2UTcto522A5ds
- Fee: 0.000005 SOL, 19,773 CUs
- Screenshots: first-token-mint-explorer.png, first-token-balances-explorer.png, first-token-transfer-tx-explorer.png
- Video: first-token-video.mp4 (18s, shows token creation + transfer)

---

## 1. Single Viral Tweet (280 chars max)

Tried to learn Solana dev 3 times. Quit at the install step every single time. This time I didn't. First SPL token on devnet. 1000 minted. 100 transferred. Live on-chain. Setup was the wall. Not the code.

#Solana #BuildInPublic #EncodeClub

---

## 2. Full Thread (7 tweets)

### Tweet 1/7 (Hook — The Pattern)

Tried to learn Solana development 3 times.

Every time I quit at the install step.

Dependencies. Version mismatches. Errors that made no sense before I wrote a single line of code.

This time I didn't quit.

Thread on what changed 🧵

#Solana #BuildInPublic

### Tweet 2/7 (The Wall)

`anchor` installed wrong. Build errors I couldn't parse. Cargo compiling for 12 minutes then failing on a dependency I'd never heard of.

That's where I quit. Three times. Before writing a single line of Rust.

The hardest part of Solana dev isn't Solana. It's getting the tools to talk to each other.

### Tweet 3/7 (The Breakthrough)

What changed: structure.

Encode Club bootcamp gave me a checklist. A sequence. Verify each tool works before moving to the next. Don't skip steps. Don't assume.

Week 2: deployed my first Anchor program on devnet. Program ID live on Explorer.

The wall crumbled.

### Tweet 4/7 (The Token)

Exercise 3: created my first SPL token.

1000 tokens. 9 decimals (same as SOL). Minted on devnet.

Mint: GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy

Key insight: wallets don't hold tokens. Token accounts do. Associated Token Accounts are deterministic, derived from wallet + mint.

Not a secret. Calculable by anyone.

### Tweet 5/7 (The Transfer)

Transferred 100 tokens to a second wallet. Real transaction on devnet.

Main wallet: 900 tokens
Second wallet: 100 tokens

Tx: https://explorer.solana.com/tx/kJ1bUjJte5rcgwLSD9aLm1CjxqydGvTCiFZxdeECSQREDd3uEivTp8o5ZexUjFxyLzVGJcGA5R2UTcto522A5ds?cluster=devnet

0.000005 SOL fee. 19,773 compute units. Finalized in seconds.

### Tweet 6/7 (The Realization)

Three times I quit. Not because the code was hard. Because I had no structured path and no way to verify I was on the right track.

The bootcamp's verify loop changed that. Run the command. Check Explorer. Don't trust terminal output alone.

Every step confirmed on-chain.

### Tweet 7/7 (CTA)

Mint on Explorer: https://explorer.solana.com/address/GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy?cluster=devnet

If you've been stuck at the install step, push through. The other side is worth it.

Drop your devnet address if you're learning too 👇

#Solana #BuildInPublic #Web3 #EncodeClub

---

## 3. Deslop Self-Audit

| Criterion | Score | Notes |
|-----------|-------|-------|
| Directness | 9/10 | Starts with the personal pattern. No throat-clearing. First tweet opens with the conflict immediately. |
| Rhythm | 9/10 | Short fragments ("That's where I quit. Three times.") mixed with longer technical sentences. Deliberate variation throughout. |
| Trust | 9/10 | No hedging. No "it's worth noting." Confident claims backed by on-chain evidence. Honest about past failures. |
| Authenticity | 10/10 | Real personal story. Specific struggles (12min cargo build, wrong anchor install) match actual experience. No manufactured difficulty. No AI tells. |
| Density | 9/10 | Every tweet carries new information. No recap tweet. No filler. Token facts, transfer proof, and insight all earn their slot. |
| **Total** | **46/50** | Exceeds minimum threshold (45/50) |

### Banned Words Check
- No: delve, leverage, seamlessly, transformative, pivotal, harness, robust, scalable, holistic, synergy, empower, streamline, foster, facilitate, utilize, implement, comprehensive, cutting-edge, game-changing, paradigm shift, revolutionize, unprecedented
- No: it's worth noting, notably, certainly, absolutely, of course, in conclusion, in summary
- No banned structures detected

### Banned Structures Check
- No "It isn't just X, it's Y" pattern — used direct replacement ("Setup was the wall. Not the code.") which is negation, not augmentation
- No question-answer hooks — no questions posed then immediately answered
- No em-dash crutch — zero em-dashes used
- No intro paragraph restating the prompt — starts with the story
- No conclusion summarizing the thread — ends with CTA, not recap
- Sentence rhythm varies: 2-word fragments next to 15-word technical sentences

---

## 4. Screenshot/Video Attachment Notes

### Recommended Attachments

| Tweet | Attachment | Reason |
|-------|------------|--------|
| Tweet 1 (Hook) | first-token-video.mp4 (18s) | Video as pattern interrupt. Shows actual token creation + transfer in 18 seconds. Maximum scroll-stop power on the hook tweet. X allows 1 video per tweet. |
| Tweet 4 (The Token) | first-token-mint-explorer.png | Visual proof of the mint on Solana Explorer. Reinforces the mint address with on-chain evidence. |
| Tweet 5 (The Transfer) | first-token-transfer-tx-explorer.png + first-token-balances-explorer.png | Two images: the transfer transaction proof and the balance split (900/100). X allows up to 4 images per tweet. |
| Tweet 7 (CTA) | No attachment needed | Links serve as proof. Clean text CTA drives replies. |

### Alternative Attachment Strategy
If video on the hook underperforms in testing:
- Move video to Tweet 5 (The Transfer) as a reply to the thread, showing the full flow
- Put first-token-mint-explorer.png on Tweet 1 instead
- Keep Tweet 4 and Tweet 5 image attachments as above

### Posting Notes
- Tag @encodeclub @solana @solana_devs in the thread
- Twitter auto-shortens URLs to 23 chars via t.co wrapping
- Best posting time: weekdays 9-11am or 7-9pm UTC
- Format: Building in public / Personal narrative
- Pillar: Behind-the-scenes + Educational
- The video is the strongest visual asset. Lead with it.
