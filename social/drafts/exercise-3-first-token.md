# Exercise 3: First Token — Social Post Draft

## Option A: Single Tweet (280 chars)

Just created my first SPL token on Solana devnet! 🪙

Minted 1000 tokens, transferred 100 to a test wallet, and built a TypeScript balance reader that handles decimals properly.

Key lesson: wallets don't hold tokens — ATAs do.

#Solana #BuildInPublic #Web3 #EncodeClub

## Option B: Thread (5 tweets)

1/ Created my first SPL token on Solana devnet today! 🪙

Used spl-token CLI to create a mint with 9 decimals, set up Associated Token Accounts, minted 1000 tokens, and transferred 100 to a test wallet.

#Solana #BuildInPublic #EncodeClub

2/ The biggest mental shift: your wallet doesn't hold tokens directly.

Tokens live in Associated Token Accounts (ATAs) — deterministic addresses derived from your wallet + the mint.

Anyone can calculate your ATA. The address is not a secret.

#Solana #Web3

3/ Decimals matter.

Blockchain stores integers only. With 9 decimals (like SOL), 1000 tokens = 1,000,000,000,000 base units.

My TypeScript balance reader divides by 10^decimals to show human-readable amounts. Easy to forget, easy to break things.

4/ Hit two real issues:

1. Transfer to unfunded wallet failed → needed --allow-unfunded-recipient
2. ts-node choked on .ts ESM imports → switched to tsx

Both fixable in one command. This is why you actually run the commands instead of just reading about them.

5/ Verified everything on Solana Explorer — never trust terminal output alone.

Mint: explorer.solana.com/address/GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy?cluster=devnet

Next up: more complex token operations. Building in public. 🚀

#Solana #BuildInPublic
