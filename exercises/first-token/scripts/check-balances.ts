/**
 * Token Balance Reader
 * 
 * This script reads token balances from the Solana blockchain
 * and properly handles decimals for human-readable display.
 * 
 * Key Concepts:
 * - ATAs (Associated Token Accounts) hold token balances
 * - Raw amounts are in base units (integers)
 * - Display amounts = raw / 10^decimals
 * - getAssociatedTokenAddress derives the ATA deterministically
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, getMint } from '@solana/spl-token';

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

/**
 * Format a raw token amount for display
 * 
 * Why this matters:
 * - Blockchain stores amounts as integers (no decimals)
 * - 1000 tokens with 9 decimals = 1000000000000 base units
 * - We divide by 10^decimals to get human-readable amounts
 */
function formatTokenAmount(rawAmount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = rawAmount / divisor;
  const fractionalPart = rawAmount % divisor;
  
  // Pad fractional part with leading zeros
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  
  // Trim trailing zeros for cleaner display
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${trimmedFractional}`;
}

/**
 * Get token balance for a wallet
 * 
 * This demonstrates the core concept:
 * 1. Derive the ATA from wallet + mint (deterministic)
 * 2. Fetch the token account from the blockchain
 * 3. Read the raw amount
 * 4. Get mint info for decimals
 * 5. Format for human reading
 */
async function getTokenBalance(
  walletAddress: string,
  mintAddress: string
): Promise<{ raw: bigint; formatted: string; decimals: number } | null> {
  try {
    const walletPubkey = new PublicKey(walletAddress);
    const mintPubkey = new PublicKey(mintAddress);

    // Derive the ATA deterministically
    // This is the magic: same wallet + mint = same ATA address every time
    const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
    
    console.log(`  ATA Address: ${ata.toBase58()}`);

    // Fetch the token account
    try {
      const tokenAccount = await getAccount(connection, ata);
      
      // Get mint info to know decimals
      const mintInfo = await getMint(connection, mintPubkey);
      
      // Format the amount
      const formatted = formatTokenAmount(tokenAccount.amount, mintInfo.decimals);
      
      return {
        raw: tokenAccount.amount,
        formatted,
        decimals: mintInfo.decimals
      };
    } catch (error) {
      // ATA doesn't exist yet (no balance)
      console.log('  Status: No token account found (balance is 0)');
      return null;
    }
  } catch (error) {
    console.error('  Error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Main function - check balances for example wallets
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       Solana Token Balance Reader                      ║');
  console.log('║       Exercise 3: Your First Token                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Example: Replace these with your actual addresses after completing CLI steps
  const EXAMPLE_MINT = 'GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy';
  const EXAMPLE_WALLET_1 = 'HnzAHTLny7JdWacKbWHmYhs66Yq4cEhUiiPUDvjJLYnx';
  const EXAMPLE_WALLET_2 = '3JiDfKBfEo9xqSHr2G4zEtbvGz25LeEZ8fXLsHUZR57X';

  // Addresses configured from metadata/token-metadata.json

  // Display mint info
  console.log(`Mint: ${EXAMPLE_MINT}`);
  console.log(`Network: Devnet\n`);

  // Check balance for wallet 1
  console.log('Wallet 1:');
  console.log(`  Address: ${EXAMPLE_WALLET_1}`);
  const balance1 = await getTokenBalance(EXAMPLE_WALLET_1, EXAMPLE_MINT);
  if (balance1) {
    console.log(`  Raw Amount: ${balance1.raw.toString()}`);
    console.log(`  Formatted: ${balance1.formatted} tokens`);
    console.log(`  Decimals: ${balance1.decimals}`);
  }
  console.log();

  // Check balance for wallet 2
  console.log('Wallet 2:');
  console.log(`  Address: ${EXAMPLE_WALLET_2}`);
  const balance2 = await getTokenBalance(EXAMPLE_WALLET_2, EXAMPLE_MINT);
  if (balance2) {
    console.log(`  Raw Amount: ${balance2.raw.toString()}`);
    console.log(`  Formatted: ${balance2.formatted} tokens`);
    console.log(`  Decimals: ${balance2.decimals}`);
  }
  console.log();

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('Key Takeaways:');
  console.log('  • Your wallet does NOT hold tokens directly');
  console.log('  • Tokens live in Associated Token Accounts (ATAs)');
  console.log('  • ATAs are derived deterministically from wallet + mint');
  console.log('  • Raw amounts are integers; divide by 10^decimals for display');
  console.log('  • No ATA = no balance (ATA is created when you receive tokens)');
  console.log('═══════════════════════════════════════════════════════');
}

// Run the script
main().catch(console.error);
