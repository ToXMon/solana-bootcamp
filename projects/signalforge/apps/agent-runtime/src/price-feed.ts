/**
 * Price Feed Module
 * Fetches real-time SOL price from Jupiter Price API v2 (free, no auth)
 */

export interface JupiterPriceResponse {
  data: Record<string, {
    id: string;
    type: string;
    price: string;
    extraInfo?: {
      confidenceLevel?: string;
    };
  }>;
  timeTaken: number;
}

export interface PriceFeedResult {
  priceUsd: number;         // SOL price in USD
  priceScaled: bigint;      // Price * 1e9 for on-chain i64
  confidence: bigint;       // Confidence interval scaled
  timestamp: number;        // Unix seconds
  outAmount: bigint;        // Jupiter out_amount (1 SOL -> USDC in 6 decimals)
}

// SOL mint address
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Jupiter Price API v2 base URL
const JUPITER_PRICE_URL = 'https://api.jup.ag/price/v3';

/**
 * Fetch current SOL/USD price from Jupiter Price API v2
 */
export async function fetchSolPrice(): Promise<PriceFeedResult> {
  const url = `${JUPITER_PRICE_URL}?ids=${SOL_MINT}`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Jupiter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as Record<string, any>;
  const solData = data[SOL_MINT];

  if (!solData || !solData.usdPrice) {
    throw new Error('Jupiter API returned no SOL price data');
  }

  const priceUsd = parseFloat(solData.usdPrice);
  if (isNaN(priceUsd) || priceUsd <= 0) {
    throw new Error(`Invalid SOL price: ${solData.price}`);
  }

  const now = Math.floor(Date.now() / 1000);

  // Scale price to i64 representation (price * 1e9)
  const priceScaled = BigInt(Math.round(priceUsd * 1e9));

  // Confidence: estimate ~0.5% of price as confidence interval
  const confidence = BigInt(Math.round(priceUsd * 0.005 * 1e9));

  // Jupiter out_amount: what 1 SOL gets in USDC (6 decimals)
  // e.g., $150 SOL = 150_000_000 USDC atomic units
  const outAmount = BigInt(Math.round(priceUsd * 1e6));

  return {
    priceUsd,
    priceScaled,
    confidence,
    timestamp: now,
    outAmount,
  };
}
