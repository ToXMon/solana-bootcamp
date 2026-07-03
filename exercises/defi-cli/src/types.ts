/**
 * Shared types for the DeFi spread CLI.
 */

/**
 * Parsed Pyth price from the Hermes API (parsed=true response).
 *
 * All numeric fields arrive as strings because the Hermes API
 * serializes them as JSON strings to preserve full precision.
 * expo is a regular number.
 */
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

/**
 * Normalized Pyth price after decimal conversion.
 * price and conf are in human-readable USD.
 */
export interface PythPrice {
  feedId: string;
  price: number;
  confidence: number;
  expo: number;
  publishTime: number; // unix seconds
  ageSeconds: number;
  isStale: boolean;
}

/**
 * Jupiter Quote API v1 response (lite-api.jup.ag/swap/v1/quote).
 * Only the fields we use are typed here.
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

/**
 * Normalized Jupiter quote after decimal conversion.
 * impliedPrice is the effective USD price per SOL.
 */
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
 * Final spread computation result.
 */
export interface SpreadResult {
  pythPrice: number;
  jupiterPrice: number;
  spreadPct: number; // absolute percentage difference
}
