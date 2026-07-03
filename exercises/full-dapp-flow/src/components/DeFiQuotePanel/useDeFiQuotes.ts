import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DeFiQuoteConfig,
  DeFiQuoteState,
  JupiterQuote,
  JupiterQuoteResponse,
  PythParsedItem,
  PythPrice,
  SpreadResult,
} from './types';

/**
 * Canonical Pyth SOL/USD price feed ID (verified via Hermes price_feeds query).
 * Valid across mainnet/devnet — Pyth Hermes serves mainnet-grade feeds.
 */
export const SOL_USD_FEED_ID =
  'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d';

/** Wrapped SOL mint (Jupiter input). */
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

/** USDC mint (mainnet, Jupiter output). */
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

/** Token decimals: SOL = 9, USDC = 6. */
const SOL_DECIMALS = 9;
const USDC_DECIMALS = 6;

/** 1 SOL in lamports. */
const ONE_SOL_RAW = 1_000_000_000;

/** Default config — matches Exercise 9 CLI thresholds. */
export const DEFAULT_CONFIG: DeFiQuoteConfig = {
  intervalMs: 15_000,
  staleThresholdSeconds: 30,
  pythBaseUrl: 'https://hermes.pyth.network',
  jupiterBaseUrl: 'https://lite-api.jup.ag',
  feedId: SOL_USD_FEED_ID,
  inputMint: SOL_MINT,
  outputMint: USDC_MINT,
  amount: ONE_SOL_RAW,
  slippageBps: 50,
};

const initialState: DeFiQuoteState = {
  pyth: null,
  jupiter: null,
  spread: null,
  status: 'idle',
  error: '',
  lastUpdated: null,
};

/**
 * Apply a Pyth exponent to a raw integer (price * 10^expo → human-readable).
 */
function applyExpo(raw: number, expo: number): number {
  return raw * Math.pow(10, expo);
}

/** Convert raw token units to a human-readable amount. */
function rawToHuman(raw: number, decimals: number): number {
  return raw / Math.pow(10, decimals);
}

/**
 * Fetch the SOL/USD price from Pyth Hermes using the `parsed=true` query
 * (returns JSON directly — no Pyth SDK / binary decoding required).
 *
 * Network: Pyth Hermes serves mainnet-grade price feeds; the same feed ID
 * is canonical across mainnet and devnet deployments.
 */
async function fetchPythPrice(
  config: DeFiQuoteConfig,
  staleThresholdSeconds: number,
): Promise<PythPrice> {
  const url =
    `${config.pythBaseUrl}/v2/updates/price/latest` +
    `?ids[]=${config.feedId}&parsed=true`;

  let resp: Response;
  try {
    resp = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new Error(
      `Pyth request failed: ${err instanceof Error ? err.message : 'network error'}`,
    );
  }

  if (!resp.ok) {
    throw new Error(`Pyth HTTP ${resp.status}: ${resp.statusText}`);
  }

  const body = (await resp.json()) as { parsed?: PythParsedItem[] };
  if (!body.parsed || body.parsed.length === 0) {
    throw new Error(`Pyth returned no parsed price for feed ${config.feedId}`);
  }

  const item = body.parsed[0];
  const rawPrice = Number(item.price.price);
  const rawConf = Number(item.price.conf);
  const expo = item.price.expo;
  const publishTime = item.price.publish_time;

  if (Number.isNaN(rawPrice) || Number.isNaN(rawConf)) {
    throw new Error('Pyth returned non-numeric price/confidence');
  }

  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = Math.max(0, now - publishTime);

  return {
    feedId: item.id,
    price: applyExpo(rawPrice, expo),
    confidence: applyExpo(rawConf, expo),
    expo,
    publishTime,
    ageSeconds,
    isStale: ageSeconds > staleThresholdSeconds,
  };
}

/**
 * Request a SOL→USDC quote from Jupiter (mainnet liquidity).
 * Quote only — no swap is executed.
 */
async function fetchJupiterQuote(config: DeFiQuoteConfig): Promise<JupiterQuote> {
  const url =
    `${config.jupiterBaseUrl}/swap/v1/quote` +
    `?inputMint=${config.inputMint}` +
    `&outputMint=${config.outputMint}` +
    `&amount=${config.amount}` +
    `&slippageBps=${config.slippageBps}`;

  let resp: Response;
  try {
    resp = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new Error(
      `Jupiter request failed: ${err instanceof Error ? err.message : 'network error'}`,
    );
  }

  if (!resp.ok) {
    throw new Error(`Jupiter HTTP ${resp.status}: ${resp.statusText}`);
  }

  const data = (await resp.json()) as JupiterQuoteResponse;
  if (!data.outAmount || !data.inAmount) {
    throw new Error('Jupiter response missing outAmount or inAmount');
  }

  const inputAmountRaw = Number(data.inAmount);
  const outputAmountRaw = Number(data.outAmount);
  if (Number.isNaN(inputAmountRaw) || Number.isNaN(outputAmountRaw)) {
    throw new Error('Jupiter returned non-numeric amounts');
  }

  const inputAmountHuman = rawToHuman(inputAmountRaw, SOL_DECIMALS);
  const outputAmountHuman = rawToHuman(outputAmountRaw, USDC_DECIMALS);
  const impliedPrice = inputAmountHuman === 0 ? 0 : outputAmountHuman / inputAmountHuman;

  return {
    inputMint: data.inputMint,
    outputMint: data.outputMint,
    inputAmountRaw,
    outputAmountRaw,
    inputAmountHuman,
    outputAmountHuman,
    impliedPrice,
    priceImpactPct: Number(data.priceImpactPct) || 0,
    routeLabel: data.routePlan?.[0]?.swapInfo?.label ?? 'unknown',
  };
}

/**
 * Compute the absolute percentage spread between Pyth and Jupiter prices.
 * direction indicates which source is higher.
 */
function computeSpread(pythPrice: number, jupiterPrice: number): SpreadResult {
  if (pythPrice === 0) {
    return { pythPrice, jupiterPrice, spreadPct: 0, direction: 'equal' };
  }
  const spreadPct = (Math.abs(jupiterPrice - pythPrice) / pythPrice) * 100;
  const direction: SpreadResult['direction'] =
    jupiterPrice > pythPrice
      ? 'jupiter-higher'
      : jupiterPrice < pythPrice
        ? 'pyth-higher'
        : 'equal';
  return { pythPrice, jupiterPrice, spreadPct, direction };
}

export interface UseDeFiQuotesResult {
  state: DeFiQuoteState;
  /** Trigger an immediate refresh (resets the interval timer). */
  refresh: () => void;
  /** Whether auto-refresh is currently active. */
  autoRefresh: boolean;
  /** Toggle auto-refresh on/off. */
  toggleAutoRefresh: () => void;
  config: DeFiQuoteConfig;
}

/**
 * Fetch Pyth + Jupiter quotes on a 15s interval.
 *
 * Both sources are fetched in parallel. If one fails, the other's result
 * is still surfaced (partial failure). The error state is set only when
 * both fail; a single failure is recorded but retried on the next tick.
 */
export function useDeFiQuotes(
  configOverrides: Partial<DeFiQuoteConfig> = {},
): UseDeFiQuotesResult {
  // Memoize so `config` (and therefore `fetchAll`) stays referentially stable
  // across renders unless the overrides actually change. Without this the
  // auto-refresh effect would re-subscribe every render.
  const config: DeFiQuoteConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...configOverrides }),
    // configOverrides is expected to be a stable literal from the caller; we
    // shallow-compare via JSON to be safe without pulling in a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(configOverrides)],
  );
  const [state, setState] = useState<DeFiQuoteState>(initialState);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    // Only mark loading on the very first fetch; subsequent refreshes keep
    // the previous data visible to avoid flicker.
    setState((prev) =>
      prev.status === 'idle' ? { ...prev, status: 'loading' } : prev,
    );

    const [pythResult, jupiterResult] = await Promise.allSettled([
      fetchPythPrice(config, config.staleThresholdSeconds),
      fetchJupiterQuote(config),
    ]);

    if (!mountedRef.current) return;

    const pyth = pythResult.status === 'fulfilled' ? pythResult.value : null;
    const jupiter = jupiterResult.status === 'fulfilled' ? jupiterResult.value : null;

    const pythErr =
      pythResult.status === 'rejected'
        ? pythResult.reason instanceof Error
          ? pythResult.reason.message
          : String(pythResult.reason)
        : '';
    const jupiterErr =
      jupiterResult.status === 'rejected'
        ? jupiterResult.reason instanceof Error
          ? jupiterResult.reason.message
          : String(jupiterResult.reason)
        : '';

    // Both failed → error state (retry on next interval).
    if (!pyth && !jupiter) {
      setState({
        ...initialState,
        status: 'error',
        error: `Pyth: ${pythErr || 'unknown'} | Jupiter: ${jupiterErr || 'unknown'}`,
      });
      return;
    }

    // Partial or full success — keep any non-failing error for context.
    const errors: string[] = [];
    if (pythErr) errors.push(`Pyth: ${pythErr}`);
    if (jupiterErr) errors.push(`Jupiter: ${jupiterErr}`);

    const spread =
      pyth && jupiter
        ? computeSpread(pyth.price, jupiter.impliedPrice)
        : null;

    setState({
      pyth,
      jupiter,
      spread,
      status: 'success',
      error: errors.join(' | '),
      lastUpdated: Date.now(),
    });
  }, [config]);

  const refresh = useCallback(() => {
    fetchAll();
    // Restart the interval so manual refresh + auto-refresh don't stack.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchAll, config.intervalMs);
    }
  }, [fetchAll, config.intervalMs]);

  // Initial fetch + mount tracking.
  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAll]);

  // Auto-refresh interval.
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(fetchAll, config.intervalMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, fetchAll, config.intervalMs]);

  const toggleAutoRefresh = useCallback(() => setAutoRefresh((v) => !v), []);

  return { state, refresh, autoRefresh, toggleAutoRefresh, config };
}
