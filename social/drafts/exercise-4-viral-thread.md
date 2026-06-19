# Exercise 4: Token-2022 Extensions — Viral Thread

## Context
- Exercise 4 completed: Token-2022 with programmable extensions on Solana devnet
- Mint: Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm
- Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb (Token-2022, NOT classic Token)
- 3 extensions: TransferFeeConfig (1% fee), MetadataPointer, TokenMetadata
- Token name: Bootcamp Token 2022, symbol: BOOT2022
- 1000 tokens minted, 200 transferred, 198 received, 2 withheld as fee
- TypeScript decoder written to decode extensions on-chain
- Screenshots: token-2022-mint-explorer.png, token-2022-extensions-explorer.png, token-2022-transfer-tx-explorer.png
- Continuation of building-in-public journey from Exercise 3 (first SPL token)

---

## 1. Single Viral Tweet (280 chars max)

Yesterday: basic SPL token. Today: programmable token with transfer fees and on-chain metadata.

200 sent. 198 received. 2 withheld. 1% fee proven on devnet.

Token-2022 extensions are permanent at creation. This is how real tokens ship.

#Solana #BuildInPublic

---

## 2. Full Thread (7 tweets)

### Tweet 1/7 (Hook — The Level Up)

Yesterday I created my first token.

Today I made it programmable.

Transfer fees on every transfer. Metadata on-chain. Extensions baked in at creation.

Token-2022 is a different beast. 🧵

#Solana #BuildInPublic

### Tweet 2/7 (The Difference)

Classic SPL Token and Token-2022 are different programs. Different program IDs. Different account structures.

Token-2022: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
Classic Token: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Extensions get configured at mint creation. You cannot add them later.

### Tweet 3/7 (The Extensions)

Three extensions on this mint:

TransferFeeConfig: 1% fee on every transfer
MetadataPointer: metadata lives on-chain, not off-chain
TokenMetadata: name, symbol, URI packed into the mint account

All three set at creation. All three permanent.

Token name: Bootcamp Token 2022. Symbol: BOOT2022.

### Tweet 4/7 (The Fee Proof)

Transferred 200 tokens. Recipient received 198.

2 withheld as transfer fee. 1% fee proven on-chain.

The withheld amount accrues on the recipient's token account, not the mint.

Tx: https://explorer.solana.com/tx/3MNTq9EAPfr4F32fFfGQKz8yA3StqUCSGLNEVoUYD4euUuaDGVAQH8WsBCsC58GsofLy3gdwmU95YVEweH8LijT?cluster=devnet

### Tweet 5/7 (The Decoder)

Account data: 510 bytes. Extensions packed after the mint data.

Wrote a TypeScript decoder to read them from raw account bytes. Hit enum version mismatches between SDK versions. Had to map them manually.

The extensions are not at fixed offsets. You read the TLV layer and iterate.

### Tweet 6/7 (The Realization)

Token-2022 extensions are permanent. You choose at creation. No adding later.

Transfer fees. Metadata. Non-transferable flags. Frozen accounts. Group members.

All decided upfront. This is how real tokens ship on Solana.

### Tweet 7/7 (CTA)

Mint: https://explorer.solana.com/address/Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm?cluster=devnet

Second ATA (withheld fees visible): https://explorer.solana.com/address/6wuPowTeW1ngx1SUBEefWYaWGRjhvA7SaeDCUJSW1ree?cluster=devnet

Drop your devnet address if you're building too 👇

#Solana #BuildInPublic #Web3 #EncodeClub

---

## 3. Deslop Self-Audit

| Criterion | Score | Notes |
|-----------|-------|-------|
| Directness | 9/10 | Tweet 1 opens with "Yesterday I created my first token." No throat-clearing. Each tweet starts with substance. No framing paragraph. |
| Rhythm | 9/10 | Short fragments ("All three set at creation. All three permanent.") mixed with longer technical sentences (program IDs, extension descriptions). Deliberate variation throughout. |
| Trust | 9/10 | No hedging. No "it's worth noting." Specific numbers throughout: 510 bytes, 200 sent, 198 received, 2 withheld, 1% fee. Claims backed by on-chain Explorer links. |
| Authenticity | 9/10 | Real progression from Exercise 3 to 4. Honest about enum version mismatches in the decoder. No manufactured difficulty. No AI tells. Personal voice maintained from Exercise 3 thread. |
| Density | 9/10 | Every tweet carries new information. No recap tweet. No filler. Extensions, fee proof, decoder details, and realization all earn their slot. Program IDs and byte counts add technical weight. |
| **Total** | **45/50** | Meets minimum threshold (45/50) |

### Banned Words Check
- No: delve, leverage, seamlessly, transformative, pivotal, harness, robust, scalable, holistic, synergy, empower, streamline, foster, facilitate, utilize, implement, comprehensive, cutting-edge, game-changing, paradigm shift, revolutionize, unprecedented
- No: it's worth noting, notably, certainly, absolutely, of course, in conclusion, in summary
- No banned words detected

### Banned Structures Check
- No "It isn't just X, it's Y" pattern — Tweet 1 uses temporal contrast ("Yesterday... Today..."), not augmentation structure
- No question-answer hooks — no questions posed then immediately answered
- No em-dash crutch — zero em-dashes used; periods and colons used for separation instead
- No intro paragraph restating the prompt — starts with the story
- No conclusion summarizing the thread — ends with CTA and Explorer links, not recap
- Sentence rhythm varies: 3-word fragments next to 15-word technical sentences
- "Different programs. Different program IDs. Different account structures." — deliberate anaphora for rhythm, not monotony

---

## 4. Screenshot/Attachment Strategy

### Recommended Attachments

| Tweet | Attachment | Reason |
|-------|------------|--------|
| Tweet 1 (Hook) | token-2022-mint-explorer.png | Scroll-stopper. Shows "Bootcamp Token 2022" with BOOT2022 symbol on Explorer. Visual proof that this is a real token, not just text claims. Establishes credibility on the hook. |
| Tweet 3 (The Extensions) | token-2022-extensions-explorer.png | Shows the 3 configured extensions on Explorer. Reinforces the technical claims with visual evidence. Extensions listed in text match what's visible in the screenshot. |
| Tweet 4 (The Fee Proof) | token-2022-transfer-tx-explorer.png | Shows the transfer transaction with 200 sent, 198 received, 2 withheld. The fee is visible on-chain. Most important proof screenshot in the thread. |
| Tweet 7 (CTA) | No attachment needed | Links serve as proof. Clean text CTA drives replies and engagement. |

### Alternative Attachment Strategy
If the mint screenshot underperforms on the hook:
- Move token-2022-extensions-explorer.png to Tweet 1 (more visually dense, shows 3 extensions)
- Put token-2022-mint-explorer.png on Tweet 3 instead
- Keep Tweet 4 transfer screenshot as-is (strongest proof)

### Posting Notes
- Tag @encodeclub @solana @solana_devs in the thread
- Twitter auto-shortens URLs to 23 chars via t.co wrapping
- Best posting time: weekdays 9-11am or 7-9pm UTC
- Format: Building in public / Technical progression
- Pillar: Behind-the-scenes + Educational
- This thread continues the narrative arc from Exercise 3 (first token) to Exercise 4 (programmable token). The progression is the story.
- No video asset available for this exercise. Screenshots carry the visual weight.
- The transfer tx screenshot is the strongest single proof image. If only one attachment is possible, use it on Tweet 4.
