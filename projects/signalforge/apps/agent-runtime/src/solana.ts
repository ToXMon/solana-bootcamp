/**
 * Solana Transaction Module
 * Builds and sends transactions using raw @solana/web3.js (no Anchor)
 * Manually encodes instruction data matching Anchor discriminators from IDL
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';

// Program ID
const PROGRAM_ID = new PublicKey('4r3YHQYjCajoDA49R4GC18CFPNLoHBxF1PAe8jmJv5Bf');

// SOL mint (for signal recording)
const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

// --- Instruction Discriminators (from IDL) ---
const DISC_RECORD_PYTH_PRICE = Buffer.from([123, 35, 239, 103, 242, 148, 4, 92]);
const DISC_RECORD_JUPITER_QUOTE = Buffer.from([31, 216, 89, 135, 59, 227, 34, 88]);
const DISC_RECORD_SIGNAL_RECEIPT = Buffer.from([56, 20, 165, 181, 97, 216, 138, 246]);
const DISC_RECORD_PERFORMANCE = Buffer.from([244, 172, 201, 193, 194, 112, 11, 126]);
const DISC_COMPUTE_SPREAD = Buffer.from([29, 169, 252, 90, 12, 53, 139, 92]);

// --- PDA Derivation ---

export function getOraclePda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('price_oracle')],
    PROGRAM_ID
  );
}

export function getStrategyPda(creator: PublicKey, strategyId: number): [PublicKey, number] {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(strategyId, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('strategy'), creator.toBuffer(), buf],
    PROGRAM_ID
  );
}

export function getPerformancePda(strategyKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('performance'), strategyKey.toBuffer()],
    PROGRAM_ID
  );
}

export function getSignalReceiptPda(strategyKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('signal'), strategyKey.toBuffer()],
    PROGRAM_ID
  );
}

export function getSignalCounterPda(strategyKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('signal_counter'), strategyKey.toBuffer()],
    PROGRAM_ID
  );
}

// --- Keypair Reconstruction ---

export function loadKeypair(): Keypair {
  const privateKeyB64 = process.env.SOLANA_PRIVATE_KEY;
  if (!privateKeyB64) {
    throw new Error('SOLANA_PRIVATE_KEY environment variable is required');
  }
  // SOLANA_PRIVATE_KEY is base64-encoded JSON array of secret key bytes
  const decoded = Buffer.from(privateKeyB64, 'base64').toString('utf-8');
  const keyArray: number[] = JSON.parse(decoded);
  return Keypair.fromSecretKey(Uint8Array.from(keyArray));
}

export function getConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl) {
    throw new Error('SOLANA_RPC_URL environment variable is required');
  }
  return new Connection(rpcUrl, 'confirmed');
}

// --- Serialization Helpers ---

function writeI64(buf: Buffer, value: bigint, offset: number): void {
  buf.writeBigInt64LE(value, offset);
}

function writeU64(buf: Buffer, value: bigint, offset: number): void {
  buf.writeBigUInt64LE(value, offset);
}

function writeU32(buf: Buffer, value: number, offset: number): void {
  buf.writeUInt32LE(value, offset);
}

function writeU16(buf: Buffer, value: number, offset: number): void {
  buf.writeUInt16LE(value, offset);
}

// --- Instruction Builders ---

/**
 * record_pyth_price(price: i64, confidence: u64, publish_time: i64)
 * Accounts: [price_oracle (writable PDA), authority (signer)]
 */
export function buildRecordPythPrice(
  authority: PublicKey,
  price: bigint,
  confidence: bigint,
  publishTime: bigint,
): TransactionInstruction {
  const data = Buffer.alloc(32);
  DISC_RECORD_PYTH_PRICE.copy(data, 0);
  writeI64(data, price, 8);
  writeU64(data, confidence, 16);
  writeI64(data, publishTime, 24);

  const [oraclePda] = getOraclePda();

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: oraclePda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
    ],
    data,
  });
}

/**
 * record_jupiter_quote(out_amount: u64, price_impact_bps: i64, slippage_bps: u16)
 * Accounts: [price_oracle (writable PDA), authority (signer)]
 */
export function buildRecordJupiterQuote(
  authority: PublicKey,
  outAmount: bigint,
  priceImpactBps: bigint,
  slippageBps: number,
): TransactionInstruction {
  const data = Buffer.alloc(26);
  DISC_RECORD_JUPITER_QUOTE.copy(data, 0);
  writeU64(data, outAmount, 8);
  writeI64(data, priceImpactBps, 16);
  writeU16(data, slippageBps, 24);

  const [oraclePda] = getOraclePda();

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: oraclePda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
    ],
    data,
  });
}

/**
 * compute_spread()
 * Accounts: [price_oracle (writable PDA)]
 */
export function buildComputeSpread(): TransactionInstruction {
  const data = Buffer.alloc(8);
  DISC_COMPUTE_SPREAD.copy(data, 0);

  const [oraclePda] = getOraclePda();

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: oraclePda, isSigner: false, isWritable: true },
    ],
    data,
  });
}

/**
 * record_signal_receipt(strategy_id: u32, token_mint: Pubkey, direction: enum, entry_price: u64)
 * Accounts: [signal_receipt PDA, signal_counter PDA, strategy PDA, creator (signer), system_program]
 */
export function buildRecordSignalReceipt(
  creator: PublicKey,
  strategyId: number,
  tokenMint: PublicKey,
  direction: 'long' | 'short',
  entryPrice: bigint,
): TransactionInstruction {
  const data = Buffer.alloc(53);
  DISC_RECORD_SIGNAL_RECEIPT.copy(data, 0);
  writeU32(data, strategyId, 8);
  tokenMint.toBuffer().copy(data, 12);
  data.writeUInt8(direction === 'long' ? 0 : 1, 44);
  writeU64(data, entryPrice, 45);

  const [strategyPda] = getStrategyPda(creator, strategyId);
  const [signalReceiptPda] = getSignalReceiptPda(strategyPda);
  const [signalCounterPda] = getSignalCounterPda(strategyPda);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: signalReceiptPda, isSigner: false, isWritable: true },
      { pubkey: signalCounterPda, isSigner: false, isWritable: true },
      { pubkey: strategyPda, isSigner: false, isWritable: true },
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * record_performance_snapshot(
 *   strategy_id: u32, total_pnl: i64, win_rate: u64,
 *   sharpe_ratio: i64, max_drawdown: i64, total_signals: u32, winning_signals: u32
 * )
 * Accounts: [snapshot PDA, strategy PDA, creator (signer+writable), system_program]
 */
export function buildRecordPerformance(
  creator: PublicKey,
  strategyId: number,
  totalPnl: bigint,
  winRate: bigint,
  sharpeRatio: bigint,
  maxDrawdown: bigint,
  totalSignals: number,
  winningSignals: number,
): TransactionInstruction {
  const data = Buffer.alloc(52);
  DISC_RECORD_PERFORMANCE.copy(data, 0);
  writeU32(data, strategyId, 8);
  writeI64(data, totalPnl, 12);
  writeU64(data, winRate, 20);
  writeI64(data, sharpeRatio, 28);
  writeI64(data, maxDrawdown, 36);
  writeU32(data, totalSignals, 44);
  writeU32(data, winningSignals, 48);

  const [strategyPda] = getStrategyPda(creator, strategyId);
  const [perfPda] = getPerformancePda(strategyPda);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: perfPda, isSigner: false, isWritable: true },
      { pubkey: strategyPda, isSigner: false, isWritable: true },
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

// --- Transaction Sending with Retry ---

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendTransaction(
  connection: Connection,
  keypair: Keypair,
  instructions: TransactionInstruction[],
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const tx = new Transaction().add(...instructions);
      tx.feePayer = keypair.publicKey;

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;

      const signature = await sendAndConfirmTransaction(
        connection,
        tx,
        [keypair],
        { commitment: 'confirmed', maxRetries: 2 }
      );

      console.log(`TX confirmed: ${signature}`);
      return signature;
    } catch (error: any) {
      lastError = error;
      console.warn(`TX attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`Transaction failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

// --- High-Level Transaction Wrappers ---

export async function updateOraclePrice(
  connection: Connection,
  keypair: Keypair,
  price: bigint,
  confidence: bigint,
  publishTime: bigint,
  outAmount: bigint,
): Promise<string> {
  const authority = keypair.publicKey;

  const instructions = [
    buildRecordPythPrice(authority, price, confidence, publishTime),
    buildRecordJupiterQuote(authority, outAmount, BigInt(0), 50),
    buildComputeSpread(),
  ];

  return sendTransaction(connection, keypair, instructions);
}

export async function recordSignal(
  connection: Connection,
  keypair: Keypair,
  strategyId: number,
  direction: 'long' | 'short',
  entryPrice: bigint,
): Promise<string> {
  const creator = keypair.publicKey;

  const instructions = [
    buildRecordSignalReceipt(creator, strategyId, SOL_MINT, direction, entryPrice),
  ];

  return sendTransaction(connection, keypair, instructions);
}

export async function recordPerformance(
  connection: Connection,
  keypair: Keypair,
  strategyId: number,
  totalPnl: bigint,
  winRate: bigint,
  sharpeRatio: bigint,
  maxDrawdown: bigint,
  totalSignals: number,
  winningSignals: number,
): Promise<string> {
  const creator = keypair.publicKey;

  const instructions = [
    buildRecordPerformance(
      creator, strategyId, totalPnl, winRate, sharpeRatio, maxDrawdown, totalSignals, winningSignals
    ),
  ];

  return sendTransaction(connection, keypair, instructions);
}

// --- Strategy Account Reader ---

const STRATEGY_DISCRIMINATOR = Buffer.from([69, 55, 73, 162, 246, 33, 0, 85]);

export interface StrategyAccountInfo {
  pubkey: PublicKey;
  creator: PublicKey;
  strategyId: number;
  name: string;
  description: string;
  state: number; // 0=Draft, 1=Active, 2=Closed, 3=Archived
  signalCount: number;
}

function deserializeStrategy(pubkey: PublicKey, data: Buffer): StrategyAccountInfo | null {
  if (data.length < 8 || !data.subarray(0, 8).equals(STRATEGY_DISCRIMINATOR)) {
    return null;
  }

  let offset = 8;

  const creator = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;

  const strategyId = data.readUInt32LE(offset);
  offset += 4;

  const nameLen = data.readUInt32LE(offset);
  offset += 4;
  const name = data.subarray(offset, offset + nameLen).toString('utf-8');
  offset += nameLen;

  const descLen = data.readUInt32LE(offset);
  offset += 4;
  const description = data.subarray(offset, offset + descLen).toString('utf-8');
  offset += descLen;

  const state = data.readUInt8(offset);
  offset += 1;

  const signalCount = data.readUInt32LE(offset);

  return { pubkey, creator, strategyId, name, description, state, signalCount };
}

export async function fetchActiveStrategies(
  connection: Connection,
): Promise<StrategyAccountInfo[]> {
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: Buffer.from(STRATEGY_DISCRIMINATOR).toString('base64'),
          encoding: 'base64',
        },
      },
    ],
  });

  const strategies: StrategyAccountInfo[] = [];

  for (const { pubkey, account } of accounts) {
    const parsed = deserializeStrategy(pubkey, Buffer.from(account.data));
    if (parsed && parsed.state === 1) {
      strategies.push(parsed);
    }
  }

  console.log(`Found ${strategies.length} active strategies out of ${accounts.length} total`);
  return strategies;
}
