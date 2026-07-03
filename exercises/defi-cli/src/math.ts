/**
 * Decimal conversion and spread calculation helpers.
 *
 * Solana token decimals:
 *   SOL  — 9 decimals  (1 SOL = 1_000_000_000 lamports)
 *   USDC — 6 decimals  (1 USDC = 1_000_000 micro-USDC)
 */

/** Token decimals for mints used in this CLI. */
export const SOL_DECIMALS = 9;
export const USDC_DECIMALS = 6;

/** Wrapped SOL mint (used by Jupiter as input). */
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

/** USDC mint (mainnet, used by Jupiter as output). */
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

/**
 * Convert a raw integer amount to a human-readable token amount.
 *
 *   rawToHuman(1_000_000_000, SOL_DECIMALS)  → 1.0
 *   rawToHuman(1_000_000,     USDC_DECIMALS) → 1.0
 */
export function rawToHuman(raw: number, decimals: number): number {
  return raw / Math.pow(10, decimals);
}

/**
 * Convert a human-readable token amount to raw integer units.
 *
 *   humanToRaw(1.0, SOL_DECIMALS)  → 1_000_000_000
 *   humanToRaw(1.0, USDC_DECIMALS) → 1_000_000
 */
export function humanToRaw(human: number, decimals: number): number {
  return Math.round(human * Math.pow(10, decimals));
}

/**
 * Apply Pyth exponent to a raw price/confidence integer.
 *
 * Pyth stores price as an integer with a negative exponent.
 *   price * 10^expo → human-readable price.
 *
 *   applyExpo(7_506_260_450, -8) → 75.06260450
 *   applyExpo(4_755_737,    -8) → 0.04755737
 */
export function applyExpo(raw: number, expo: number): number {
  return raw * Math.pow(10, expo);
}

/**
 * Compute the absolute percentage spread between two prices.
 *
 *   spreadPct = |jupiter - pyth| / pyth * 100
 *
 * Returns 0 if pyth price is 0 (avoids division by zero).
 */
export function computeSpreadPct(pythPrice: number, jupiterPrice: number): number {
  if (pythPrice === 0) return 0;
  return (Math.abs(jupiterPrice - pythPrice) / pythPrice) * 100;
}

/**
 * Format a USD price with 2 decimal places.
 *   formatUsd(75.0626) → "$75.06"
 */
export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Format a USD confidence interval with variable precision.
 *   formatConf(0.0475) → "$0.05"
 */
export function formatConf(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Format an age in seconds as a human-readable string.
 *   formatAge(2)   → "2s ago"
 *   formatAge(65)  → "1m 5s ago"
 */
export function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s ago`;
}

/**
 * Format a spread percentage with 3 decimal places.
 *   formatSpreadPct(0.054) → "0.054%"
 */
export function formatSpreadPct(pct: number): string {
  return `${pct.toFixed(3)}%`;
}
