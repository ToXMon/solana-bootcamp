/**
 * Token Creator Script
 * 
 * This script creates an SPL token mint, associated token accounts,
 * and mints tokens programmatically using TypeScript.
 * 
 * This demonstrates the core concepts:
 * 1. Creating a token mint with specified decimals
 * 2. Creating Associated Token Accounts (ATAs)
 * 3. Minting tokens to an ATA
 * 4. Transferring tokens between wallets
 */

import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  getMint,
  getAccount,
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const NETWORK = 'devnet';
const DECIMALS = 9;
const INITIAL_MINT_AMOUNT = 1000;
const TRANSFER_AMOUNT = 100;

// File paths
const METADATA_PATH = path.join(__dirname, '..', 'metadata', 'token-metadata.json');
const SECOND_WALLET_PATH = path.join(__dirname, '..', 'metadata', 'second-wallet.json');

/**
 * Load wallet from file
 */
function loadWallet(keypairPath: string): Keypair {
  const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

/**
 * Save metadata to JSON file
 */
function saveMetadata(data: object) {
  fs.writeFileSync(METADATA_PATH, JSON.stringify(data, null, 2));
  console.log(`📄 Metadata saved to: ${METADATA_PATH}`);
}

/**
 * Save second wallet keypair
 */
function saveSecondWallet(keypair: Keypair) {
  const secretKey = Array.from(keypair.secretKey);
  fs.writeFileSync(SECOND_WALLET_PATH, JSON.stringify(secretKey, null, 2));
  console.log(`🔑 Second wallet saved to: ${SECOND_WALLET_PATH}`);
}

/**
 * Main token creation flow
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       SPL Token Creator                                ║');
  console.log('║       Exercise 3: Your First Token                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Load primary wallet
  const walletPath = process.env.HOME + '/.config/solana/id.json';
  if (!fs.existsSync(walletPath)) {
    console.error('❌ Wallet not found at:', walletPath);
    console.log('Please create a wallet first: solana-keygen new');
    process.exit(1);
  }

  const payer = loadWallet(walletPath);
  console.log('👛 Primary wallet:', payer.publicKey.toBase58());

  // Connect to devnet
  console.log('🔗 Connecting to Solana devnet...\n');
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`💰 Balance: ${balance / 1e9} SOL`);

  if (balance < 0.01 * 1e9) {
    console.log('⚠️  Low balance! Get more devnet SOL:');
    console.log('   solana airdrop 2\n');
  }

  // Step 1: Create Mint
  console.log('Step 1: Creating token mint...');
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,  // mint authority
    null,             // freeze authority (null = no freeze)
    DECIMALS
  );
  console.log(`✅ Mint created: ${mint.toBase58()}`);
  console.log(`   Decimals: ${DECIMALS}`);

  // Step 2: Create ATA for primary wallet
  console.log('\nStep 2: Creating Associated Token Account...');
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log(`✅ ATA created: ${ata.address.toBase58()}`);

  // Step 3: Mint tokens
  console.log(`\nStep 3: Minting ${INITIAL_MINT_AMOUNT} tokens...`);
  const mintAmount = INITIAL_MINT_AMOUNT * (10 ** DECIMALS);
  await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    payer,
    mintAmount
  );
  console.log(`✅ Minted ${INITIAL_MINT_AMOUNT} tokens`);

  // Step 4: Create second wallet
  console.log('\nStep 4: Creating second wallet for testing...');
  const secondWallet = Keypair.generate();
  console.log(`✅ Second wallet: ${secondWallet.publicKey.toBase58()}`);
  saveSecondWallet(secondWallet);

  // Step 5: Create ATA for second wallet
  console.log('\nStep 5: Creating ATA for second wallet...');
  const secondAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    secondWallet.publicKey
  );
  console.log(`✅ Second ATA created: ${secondAta.address.toBase58()}`);

  // Step 6: Transfer tokens
  console.log(`\nStep 6: Transferring ${TRANSFER_AMOUNT} tokens...`);
  const transferAmount = TRANSFER_AMOUNT * (10 ** DECIMALS);
  await transfer(
    connection,
    payer,
    ata.address,
    secondAta.address,
    payer,
    transferAmount
  );
  console.log(`✅ Transferred ${TRANSFER_AMOUNT} tokens`);

  // Save metadata
  saveMetadata({
    network: NETWORK,
    mint: mint.toBase58(),
    decimals: DECIMALS,
    primaryWallet: payer.publicKey.toBase58(),
    primaryAta: ata.address.toBase58(),
    secondWallet: secondWallet.publicKey.toBase58(),
    secondAta: secondAta.address.toBase58(),
    initialMint: INITIAL_MINT_AMOUNT,
    transferAmount: TRANSFER_AMOUNT,
    createdAt: new Date().toISOString()
  });

  // Final summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                TOKEN CREATION COMPLETE                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n🔗 Verify on Solana Explorer:');
  console.log(`   Mint: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
  console.log(`   Wallet 1: https://explorer.solana.com/address/${payer.publicKey.toBase58()}?cluster=devnet`);
  console.log(`   Wallet 2: https://explorer.solana.com/address/${secondWallet.publicKey.toBase58()}?cluster=devnet`);
  console.log('\n📊 Balances:');
  console.log(`   Wallet 1: ${INITIAL_MINT_AMOUNT - TRANSFER_AMOUNT} tokens`);
  console.log(`   Wallet 2: ${TRANSFER_AMOUNT} tokens`);
  console.log('\n⚠️  IMPORTANT: Save these addresses! They are in metadata/token-metadata.json');
}

main().catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
