/**
 * Shared types for the DeFi Quote Panel.
 *
 * Mirrors the normalized shapes from Exercise 9 (defi-cli) so the same
 * parsing logic can be reused in the browser.
 */

/** Raw Pyth price fields from the Hermes `parsed=true` response. */
export interface PythPriceRaw {
  price: string;
  conf: string;
  expo: number;
  publish_time: number;
}

export interface PythParsedItem {
  id: string;
  price: PythPriceRaw;
  ema_price: PythPriceRaw;
  metadata: {
    slot: number;
    proof_available_time: number;
    prev_publish_time: number;
  };
}

/** Normalized Pyth price after decimal conversion. */
export interface PythPrice {
  feedId: string;
  price: number; // human-readable USD
  confidence: number; // human-readable USD
  expo: number;
  publishTime: number; // unix seconds
  ageSeconds: number;
  isStale: boolean;
}

/** Normalized Jupiter quote after decimal conversion. */
export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inputAmountRaw: number; // lamports
  outputAmountRaw: number; // USDC micro-units
  inputAmountHuman: number; // SOL
  outputAmountHuman: number; // USDC
  impliedPrice: number; // USD per SOL
  priceImpactPct: number;
  routeLabel: string;
}

/**
 * Jupiter Quote API v1 response (lite-api.jup.ag/swap/v1/quote).
 * Only the fields we consume are typed here.
 */
export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  contextSlot: number;
  timeTaken: number;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
    };
    percent: number;
    bps: number | null;
  }>;
}

/** Combined spread result. */
export interface SpreadResult {
  pythPrice: number;
  jupiterPrice: number;
  spreadPct: number; // absolute percentage difference
  direction: 'pyth-higher' | 'jupiter-higher' | 'equal';
}

/** Aggregated quote state surfaced by the hook. */
export interface DeFiQuoteState {
  pyth: PythPrice | null;
  jupiter: JupiterQuote | null;
  spread: SpreadResult | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string;
  lastUpdated: number | null; // unix ms
}

/** Config for the hook (overridable for tests). */
export interface DeFiQuoteConfig {
  /** Auto-refresh interval in ms. */
  intervalMs: number;
  /** Staleness threshold in seconds for Pyth publish_time. */
  staleThresholdSeconds: number;
  /** Pyth Hermes base URL. */
  pythBaseUrl: string;
  /** Jupiter lite-api base URL. */
  jupiterBaseUrl: string;
  /** Pyth feed ID (SOL/USD). */
  feedId: string;
  /** Input mint (wrapped SOL). */
  inputMint: string;
  /** Output mint (USDC mainnet). */
  outputMint: string;
  /** Input amount in raw units (1 SOL = 1e9 lamports). */
  amount: number;
  /** Slippage tolerance in basis points. */
  slippageBps: number;
}
