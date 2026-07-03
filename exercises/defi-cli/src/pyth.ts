/**
 * Pyth price fetcher — uses the Hermes HTTP API with parsed=true.
 *
 * Hermes returns a JSON object with a `parsed` array containing
 * the price, confidence, exponent, and publish time for each feed.
 *
 * We use native fetch (built into Node 22) — no SDK required.
 *
 * Network: Pyth Hermes serves mainnet-grade price feeds.
 *   The feed ID below is the canonical SOL/USD Pyth feed, valid
 *   across mainnet and devnet deployments.
 */

import { PythParsedItem, PythPrice } from './types';
import { applyExpo } from './math';

/** Canonical Pyth SOL/USD price feed ID. */
export const SOL_USD_FEED_ID =
  'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d';

/** Default Hermes base URL. */
const DEFAULT_HERMES_URL = 'https://hermes.pyth.network';

/** Staleness threshold in seconds. */
const STALE_THRESHOLD_SECONDS = 30;

/**
 * Fetch the latest SOL/USD price from Pyth Hermes.
 *
 * @param feedId  Pyth price feed ID (hex string, no 0x prefix)
 * @returns       Normalized PythPrice with human-readable price/confidence
 * @throws        Error if the feed is not found, the response is malformed,
 *                or the HTTP request fails.
 */
export async function fetchPythPrice(
  feedId: string = SOL_USD_FEED_ID,
  hermesUrl: string = process.env.PYTH_HERMES_URL || DEFAULT_HERMES_URL,
): Promise<PythPrice> {
  const url = `${hermesUrl}/v2/updates/price/latest?ids[]=${feedId}&parsed=true`;

  let resp: Response;
  try {
    resp = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
  } catch (err: any) {
    throw new Error(
      `Pyth Hermes request failed: ${err?.message ?? 'network error'}`,
    );
  }

  if (!resp.ok) {
    throw new Error(
      `Pyth Hermes returned HTTP ${resp.status}: ${resp.statusText}`,
    );
  }

  const body = (await resp.json()) as { parsed?: PythParsedItem[] };

  if (!body.parsed || body.parsed.length === 0) {
    throw new Error(
      `Pyth Hermes returned no parsed price for feed ${feedId}. ` +
        'Check that the feed ID is correct.',
    );
  }

  const item = body.parsed[0];
  if (item.id !== feedId) {
    throw new Error(
      `Pyth feed ID mismatch: expected ${feedId}, got ${item.id}`,
    );
  }

  const rawPrice = Number(item.price.price);
  const rawConf = Number(item.price.conf);
  const expo = item.price.expo;
  const publishTime = item.price.publish_time;

  if (Number.isNaN(rawPrice) || Number.isNaN(rawConf)) {
    throw new Error(
      `Pyth returned non-numeric price/confidence: ` +
        `price="${item.price.price}", conf="${item.price.conf}"`,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = now - publishTime;

  return {
    feedId: item.id,
    price: applyExpo(rawPrice, expo),
    confidence: applyExpo(rawConf, expo),
    expo,
    publishTime,
    ageSeconds,
    isStale: ageSeconds > STALE_THRESHOLD_SECONDS,
  };
}
