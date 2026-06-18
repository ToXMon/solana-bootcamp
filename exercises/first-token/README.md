# Exercise 3: Your First Token

Welcome to Exercise 3! This is where you'll create your first SPL token on Solana devnet. This is a major milestone - you're moving from static programs to actual tokens that can be transferred, tracked, and integrated into dApps.

## What You'll Learn

### Core Concepts

**1. SPL Tokens (Solana Program Library Tokens)**
- SPL is Solana's standard for fungible tokens (like ERC-20 on Ethereum)
- The Token Program is a native Solana program (not deployed by you)
- All tokens on Solana use this standard

**2. Mint Account**
Think of this as the "factory" for your token:
- Defines token properties (decimals, supply, authority)
- Controls who can mint new tokens
- Stored on-chain like any other account

**3. Associated Token Account (ATA)**
This is where the magic happens:
- Your wallet doesn't hold tokens directly
- Instead, you have an ATA for each token you own
- ATAs are deterministic: derived from your wallet + mint address
- Anyone can create an ATA for any wallet + mint combination

**4. Decimals**
Just like SOL has lamports (1 SOL = 10^9 lamports):
- Raw amounts are integers (base units)
- Display amounts = raw / 10^decimals
- 9 decimals is standard (like SOL)
- 6 decimals for stablecoins (like USDC)

## The Mental Model

```
Traditional Banking:          Solana Token Model:
┌──────────────┐              ┌──────────────┐
│ Your Bank    │              │ Your Wallet  │
│ Account      │              │ (Keypair)    │
└──────────────┘              └──────────────┘
       │                             │
       ▼                             ▼
┌──────────────┐              ┌──────────────────┐
│ Holds $$$    │      vs      │ Holds SOL only   │
│ (dollars)    │              │ (for gas fees)   │
└──────────────┘              └──────────────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │ Token Account    │
                               │ (ATA)            │
                               │ Holds: 1000 USDC │
                               └──────────────────┘
```

## Exercise Steps

### Step 1: Create a Token Mint

**What this does:** Creates the "factory" account that defines your token

```bash
# Create a new token with 9 decimals
spl-token create-token --decimals 9
```

**Why 9 decimals?**
- Same as SOL for consistency
- Allows precise micro-transactions
- Industry standard for most tokens

**What happens:**
1. A new keypair is generated for the mint
2. The mint account is created on devnet
3. Your wallet is set as the mint authority
4. You get a mint address (save this!)

### Step 2: Create Your ATA

**What this does:** Creates the account that will hold your tokens

```bash
# Create an Associated Token Account for your wallet
spl-token create-account <MINT_ADDRESS>
```

**Why this matters:**
- Your wallet can't hold tokens directly
- The ATA is owned by the Token Program, not you
- But only you can authorize transfers from it

### Step 3: Mint Tokens

**What this does:** Creates new tokens and sends them to your ATA

```bash
# Mint 1000 tokens to your ATA
spl-token mint <MINT_ADDRESS> 1000
```

**Behind the scenes:**
- Your wallet (as mint authority) signs the transaction
- The Token Program increases the total supply
- 1000 tokens (in base units) are credited to your ATA

### Step 4: Create a Second Wallet

**What this does:** Generates another keypair for testing transfers

```bash
# Create a second wallet
solana-keygen new --outfile ~/second-wallet.json

# Get its address
solana-keygen pubkey ~/second-wallet.json
```

### Step 5: Create ATA for Second Wallet

```bash
# Create ATA for the second wallet
spl-token create-account <MINT_ADDRESS> ~/second-wallet.json
```

### Step 6: Transfer Tokens

**What this does:** Moves tokens from your ATA to another wallet's ATA

```bash
# Transfer 100 tokens to the second wallet
spl-token transfer <MINT_ADDRESS> 100 <SECOND_WALLET_ADDRESS> --fund-recipient
```

**The `--fund-recipient` flag:**
- Creates the recipient's ATA if it doesn't exist
- Funds it with rent-exempt SOL
- Without this, the transfer fails if no ATA exists

### Step 7: Verify Everything

**Check your balance:**
```bash
spl-token balance <MINT_ADDRESS>
```

**List all your token accounts:**
```bash
spl-token accounts
```

## TypeScript Balance Reader

After completing the CLI operations, you'll build a TypeScript script that:

1. Reads token balances from any wallet
2. Properly handles decimals (converts base units to display units)
3. Uses `getAssociatedTokenAddress` to derive ATAs
4. Displays formatted, human-readable balances

See `scripts/check-balances.ts` for the implementation.

## Key Concepts to Remember

### Why Wallets Don't Hold Tokens

In Solana, everything is an account. Your wallet is just a keypair that signs transactions. Tokens live in separate accounts (ATAs) owned by the Token Program. This design enables:

- **Parallel processing**: Different token accounts can be updated simultaneously
- **Composability**: Programs can interact with tokens without knowing your wallet
- **Security**: Token accounts have their own permissions separate from your wallet

### Why ATAs Are "Associated"

The word "associated" means the token account is linked to both:
1. A specific wallet (the owner)
2. A specific mint (the token type)

The address is deterministically derived from these two values, so anyone can calculate it.

### Rent Exemption

Every account on Solana needs SOL "deposited" to exist:
- This SOL is not spent - it's held as collateral
- When you close the account, you get it back
- Current minimum: ~0.002 SOL for token accounts

## AI Verify Loop Checkpoints

Before proceeding at each step, verify:

- [ ] **Step 1**: Mint created on Solana Explorer (shows mint authority, decimals)
- [ ] **Step 2**: ATA created and owned by Token Program
- [ ] **Step 3**: Supply increased correctly, tokens in your ATA
- [ ] **Step 4**: Second wallet generated, different from first
- [ ] **Step 5**: Second wallet's ATA created successfully
- [ ] **Step 6**: Balances updated correctly after transfer
- [ ] **Step 7**: TypeScript script displays correct formatted balances

## Common Mistakes to Avoid

1. **Confusing mint address with token account address**
   - Mint = the factory (one per token type)
   - Token account = holds your balance (one per wallet per token)

2. **Forgetting about decimals**
   - 1000 tokens with 9 decimals = 1000000000 base units
   - Always divide by 10^decimals for display

3. **Transferring to a wallet address instead of ATA**
   - Always transfer to the ATA, not the wallet
   - Use `--fund-recipient` to auto-create ATA

4. **Not verifying on Explorer**
   - Terminal output can lie
   - Always check Solana Explorer for ground truth

## Building in Public Ideas

When you complete this exercise, consider sharing:

- Screenshot of your token on Solana Explorer
- Thread explaining the difference between mints and token accounts
- Before/after: "I thought wallets held tokens, but actually..."
- Your TypeScript balance reader code snippet
- The moment you successfully transferred tokens between wallets

## Next Steps

Once you've completed the CLI operations and verified everything on Explorer:

1. Run the TypeScript balance reader
2. Experiment with different decimal amounts
3. Try minting more tokens
4. Transfer between wallets multiple times
5. Draft a social post about what you learned

## Resources

- [SPL Token Program Documentation](https://spl.solana.com/token)
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Associated Token Account Program](https://spl.solana.com/associated-token-account)

---

Remember: **Always verify on Solana Explorer!** Never trust terminal output alone.

Happy token building! 🚀
