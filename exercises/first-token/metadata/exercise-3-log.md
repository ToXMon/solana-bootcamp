# Exercise 3: Your First Token - Execution Log

## Step 2: Create SPL Token Mint ✅
- Command: spl-token create-token --decimals 9
- Mint Address: GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy
- Decimals: 9
- Signature: 5YCvbUzTV8yjdXEiFQgujsSvRqd3psVhWLND4eg5xW32rR3LybEbtfRaPCGMX2FPY9ujtaZaNgBhgJ6dRwrnQR5z
- Explorer: https://explorer.solana.com/address/GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy?cluster=devnet

## Step 3: Create ATA ✅
- ATA: 4HDh6ubpekpgG4qNwjtoq9nGAWMk7KNMJmfQUTAET76n
- Signature: 4Ma5FaLwJ6nEYyizS6hYhwEN3XY2AcYbm6cAf91dUFr8ggSUGqJGUBEWU1kU2vUXG1HrRehMpPQH3dDTuZZ47kuT

## Step 4: Mint 1000 Tokens ✅
- Signature: 5DUzUhzPjKvaHBAJoMohgqnUhQsTTgvHboRsBwPnMnLR2soBmD32qAxpycz1sG5viMHr8bL4RLk4jXX5VYm4Bf45

## Step 5: Create Second Wallet ✅
- Address: 3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X
- Keypair: exercises/first-token/second-wallet.json

## Step 6: Transfer 100 Tokens ✅
- Initial attempt failed: ATA creation for second wallet needed --fee-payer, transfer needed --allow-unfunded-recipient
- Fix: Used combined `spl-token transfer $MINT 100 $SECOND_WALLET --fund-recipient --allow-unfunded-recipient`
- This auto-created recipient ATA (8Fwmf7pVQBk64efnh6QVv8rcueRABwmnm7HjrkzyGsGh) and funded it with rent SOL
- Transfer TX: kJ1bUjJte5rcgwLSD9aLm1CjxqydGvTCiFZxdeECSQREDd3uEivTp8o5ZexUjFxyLzVGJcGA5R2UTcto522A5ds
- Explorer: https://explorer.solana.com/tx/kJ1bUjJte5rcgwLSD9aLm1CjxqydGvTCiFZxdeECSQREDd3uEivTp8o5ZexUjFxyLzVGJcGA5R2UTcto522A5ds?cluster=devnet

## Step 7: Verify Balances ✅
- Main wallet: 900 tokens (raw: 900000000000)
- Second wallet: 100 tokens (raw: 100000000000)
- Decimals confirmed: 9

## Step 8: Save Metadata ✅
- exercises/first-token/metadata/token-metadata.json
- exercises/first-token/metadata/explorer-links.json
- config/tokens.devnet.json

## Step 9: TypeScript Balance Reader ✅
- Installed deps: @solana/web3.js, @solana/spl-token, tsx
- Fixed: ts-node failed with ESM error, switched to tsx
- Fixed: removed placeholder conditional check that blocked execution
- Output verified: Wallet 1 = 900 tokens, Wallet 2 = 100 tokens (decimals handled correctly)

## Step 10: Solana Explorer Screenshots ✅
- social/first-token-mint-explorer.png (mint account)
- social/first-token-balances-explorer.png (main wallet ATA)
- social/first-token-transfer-tx-explorer.png (transfer transaction)

## Issues Encountered & Solutions
1. **ATA creation for second wallet failed**: Error "fee payer is required" when using --owner flag
   - Solution: Skipped separate ATA creation, used --fund-recipient on transfer instead
2. **Transfer to unfunded wallet failed**: Error "recipient address is not funded"
   - Solution: Added --allow-unfunded-recipient flag
3. **ts-node ESM error**: TypeError: Unknown file extension ".ts"
   - Solution: Installed and used tsx instead of ts-node
4. **Balance reader showed "Configuration needed"**: Python replacement changed the conditional check string
   - Solution: Removed the placeholder conditional block
