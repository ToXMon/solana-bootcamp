/**
 * Environment variables (set via process.env at runtime)
 */
declare namespace NodeJS {
  interface ProcessEnv {
    SOLANA_RPC_URL: string;
    SOLANA_PRIVATE_KEY: string; // base64-encoded JSON array of secret key bytes
    PROGRAM_ID: string;
  }
}

/**
 * Price data from Jupiter API and on-chain oracle
 */
export interface PriceData {
  pythPrice: number;        // Price in lamport-scaled i64 (price * 1e9)
  pythConfidence: number;   // Confidence interval
  jupiterOutAmount: number; // Jupiter quote output amount
  spread: number;           // Spread between sources
  lastUpdated: number;      // Unix timestamp
}

/**
 * Signal emitted by evaluation logic
 */
export interface Signal {
  direction: 'long' | 'short';
  entryPrice: number;
  confidence: number;
  reason: string;
}

/**
 * On-chain strategy registry account (deserialized)
 */
export interface StrategyAccount {
  creator: Uint8Array;   // 32 bytes pubkey
  strategyId: number;    // u32
  name: string;
  description: string;
  state: number;         // 0=Draft, 1=Active, 2=Closed, 3=Archived
  signalCount: number;   // u32
  isPublic: boolean;
  createdAt: number;     // i64 timestamp
  bump: number;          // u8
}

/**
 * Minimal strategy criteria for evaluation
 */
export interface StrategyCriteria {
  strategyId: number;
  strategyPubkey: Uint8Array;
  creatorPubkey: Uint8Array;
  entryCriteria: {
    priceChange?: { minPct: number };
    volumeSurge?: { minMultiple: number };
    rsi?: { max: number };
  };
  exitCriteria: {
    takeProfitPct: number;
    stopLossPct: number;
  };
  timeWindowHours: number;
}

/**
 * Cycle result for logging
 */
export interface CycleResult {
  timestamp: number;
  priceUsd: number;
  strategiesEvaluated: number;
  signalsGenerated: number;
  transactionsSent: string[];
  errors: string[];
}
