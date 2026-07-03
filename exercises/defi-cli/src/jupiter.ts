/**
 * Jupiter quote fetcher — uses the Jupiter lite-api Quote endpoint.
 *
 * The old quote-api.jup.ag endpoint is deprecated and no longer resolves.
 * Current endpoint: https://lite-api.jup.ag/swap/v1/quote
 *
 * Network: Jupiter quotes use mainnet liquidity pools.
 *   Do NOT use devnet liquidity for price comparison.
 *
 * Quote only — no swap is executed.
 */

import { JupiterQuote, JupiterQuoteResponse } from './types';
import {
  SOL_MINT,
  USDC_MINT,
  SOL_DECIMALS,
  USDC_DECIMALS,
  rawToHuman,
} from './math';

/** Default Jupiter lite-api base URL. */
const DEFAULT_JUPITER_URL = 'https://lite-api.jup.ag';

/** 1 SOL in lamports (raw units). */
const ONE_SOL_RAW = 1_000_000_000;

/** Default slippage in basis points (50 bps = 0.5%). */
const DEFAULT_SLIPPAGE_BPS = 50;

/**
 * Request a SOL→USDC quote from Jupiter (mainnet liquidity).
 *
 * @param inputMint   Input token mint (default: wrapped SOL)
 * @param outputMint  Output token mint (default: USDC)
 * @param amount      Input amount in raw units (default: 1 SOL = 1e9 lamports)
 * @param slippageBps Slippage tolerance in basis points (default: 50)
 * @returns           Normalized JupiterQuote with implied price
 * @throws            Error if the API call fails or the response is malformed.
 */
export async function fetchJupiterQuote(
  inputMint: string = SOL_MINT,
  outputMint: string = USDC_MINT,
  amount: number = ONE_SOL_RAW,
  slippageBps: number = DEFAULT_SLIPPAGE_BPS,
  jupiterUrl: string = process.env.JUPITER_API_URL || DEFAULT_JUPITER_URL,
): Promise<JupiterQuote> {
  const url =
    `${jupiterUrl}/swap/v1/quote?` +
    `inputMint=${inputMint}` +
    `&outputMint=${outputMint}` +
    `&amount=${amount}` +
    `&slippageBps=${slippageBps}`;

  let resp: Response;
  try {
    resp = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
  } catch (err: any) {
    throw new Error(
      `Jupiter quote request failed: ${err?.message ?? 'network error'}`,
    );
  }

  if (!resp.ok) {
    throw new Error(
      `Jupiter quote returned HTTP ${resp.status}: ${resp.statusText}`,
    );
  }

  const data = (await resp.json()) as JupiterQuoteResponse;

  if (!data.outAmount || !data.inAmount) {
    throw new Error(
      'Jupiter quote response missing outAmount or inAmount. ' +
        'The API schema may have changed — verify the current endpoint format.',
    );
  }

  const inputAmountRaw = Number(data.inAmount);
  const outputAmountRaw = Number(data.outAmount);

  if (Number.isNaN(inputAmountRaw) || Number.isNaN(outputAmountRaw)) {
    throw new Error(
      `Jupiter returned non-numeric amounts: ` +
        `inAmount="${data.inAmount}", outAmount="${data.outAmount}"`,
    );
  }

  const inputAmountHuman = rawToHuman(inputAmountRaw, SOL_DECIMALS);
  const outputAmountHuman = rawToHuman(outputAmountRaw, USDC_DECIMALS);

  // implied_price = USDC_out / SOL_in
  // Both are human-readable after decimal conversion.
  const impliedPrice = outputAmountHuman / inputAmountHuman;

  const routeLabel =
    data.routePlan?.[0]?.swapInfo?.label ?? 'unknown';

  return {
    inputMint: data.inputMint,
    outputMint: data.outputMint,
    inputAmountRaw,
    outputAmountRaw,
    inputAmountHuman,
    outputAmountHuman,
    impliedPrice,
    priceImpactPct: Number(data.priceImpactPct) || 0,
    routeLabel,
  };
}
