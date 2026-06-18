# SPL Token CLI Quick Reference

## Essential Commands

### 1. Create a Token Mint
```bash
spl-token create-token --decimals 9
```
**Output:** Mint address (save this!)

### 2. Create Associated Token Account (ATA)
```bash
spl-token create-account <MINT_ADDRESS>
```

### 3. Mint Tokens
```bash
spl-token mint <MINT_ADDRESS> <AMOUNT>
# Example: spl-token mint 7nY7H... 1000
```

### 4. Check Balance
```bash
spl-token balance <MINT_ADDRESS>
```

### 5. List All Token Accounts
```bash
spl-token accounts
```

### 6. Transfer Tokens
```bash
spl-token transfer <MINT_ADDRESS> <AMOUNT> <RECIPIENT_WALLET> --fund-recipient
# Example: spl-token transfer 7nY7H... 100 9xQ3b... --fund-recipient
```

### 7. Create Second Wallet (for testing)
```bash
solana-keygen new --outfile ~/second-wallet.json
solana-keygen pubkey ~/second-wallet.json
```

## Key Concepts

| Term | Explanation |
|------|-------------|
| **Mint** | The "factory" that defines your token (decimals, supply, authority) |
| **ATA** | Associated Token Account - where tokens actually live |
| **Decimals** | Precision (9 = like SOL, 6 = like USDC) |
| **Base Units** | Raw integer amounts (1000 tokens with 9 decimals = 1000000000000) |
| **Rent Exemption** | SOL deposited to keep accounts alive (~0.002 SOL per account) |

## Verification Checklist

After each step, verify on Solana Explorer:
- [ ] Mint created: https://explorer.solana.com/address/<MINT>?cluster=devnet
- [ ] ATA created and owned by Token Program
- [ ] Supply matches minted amount
- [ ] Transfer completed successfully

## Common Flags

| Flag | Purpose |
|------|---------|
| `--decimals 9` | Set token precision (default: 9) |
| `--fund-recipient` | Auto-create recipient's ATA and fund it |
| `--owner <KEYPAIR>` | Specify different wallet owner |
| `--fee-payer <KEYPAIR>` | Specify who pays transaction fees |

## File Locations

- Primary wallet: `~/.config/solana/id.json`
- Second wallet: `~/second-wallet.json` (you create this)
- Token metadata: `metadata/token-metadata.json` (script saves this)

## TypeScript Scripts

```bash
# Navigate to scripts directory
cd exercises/first-token/scripts

# Install dependencies
npm install

# Create token using TypeScript
npx ts-node create-token.ts

# Check balances
npx ts-node check-balances.ts
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Insufficient funds" | Run `solana airdrop 2` for more devnet SOL |
| "Account not found" | The ATA doesn't exist yet; create it first |
| "Invalid mint" | Double-check the mint address |
| "Recipient has no ATA" | Use `--fund-recipient` flag |

## Next Steps

1. ✅ Create mint
2. ✅ Create your ATA
3. ✅ Mint tokens
4. ✅ Create second wallet
5. ✅ Create second ATA
6. ✅ Transfer tokens
7. ✅ Verify on Explorer
8. ✅ Run TypeScript balance reader
9. 🎉 Draft social post about your first token!
