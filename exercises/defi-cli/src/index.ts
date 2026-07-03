/**
 * Exercise 9 — DeFi Basics: Pyth + Jupiter Spread CLI
 *
 * Fetches SOL/USD from Pyth (Hermes API), requests a SOL→USDC quote
 * from Jupiter (mainnet), computes the implied Jupiter price, and
 * prints the spread between the two sources.
 *
 * Quote only — no swap is executed.
 *
 * Network split (deliberate):
 *   Pyth    → Hermes API (serves canonical price feeds)
 *   Jupiter → mainnet liquidity (lite-api.jup.ag)
 *
 * Usage:
 *   npx tsx src/index.ts
 */

import { fetchPythPrice, SOL_USD_FEED_ID } from './pyth';
import { fetchJupiterQuote } from './jupiter';
import {
  computeSpreadPct,
  formatUsd,
  formatConf,
  formatAge,
  formatSpreadPct,
} from './math';

/** Pad a label to a fixed width for aligned output. */
function pad(label: string, width: number = 20): string {
  return label.padEnd(width);
}

async function main(): Promise<void> {
  console.log('═'.repeat(56));
  console.log('  DeFi Spread CLI — Pyth (devnet feed) vs Jupiter (mainnet)');
  console.log('═'.repeat(56));
  console.log();

  // ── 1. Fetch Pyth SOL/USD price ──────────────────────────────
  let pyth;
  try {
    pyth = await fetchPythPrice(SOL_USD_FEED_ID);
  } catch (err: any) {
    console.error(`[Pyth] Error: ${err.message}`);
    console.error(`       Feed ID: ${SOL_USD_FEED_ID}`);
    process.exit(1);
  }

  console.log(`${pad('SOL/USD (Pyth):')}    ${formatUsd(pyth.price)} +/- ${formatConf(pyth.confidence)}`);
  console.log(`${pad('Last updated:')}       ${formatAge(pyth.ageSeconds)}`);

  if (pyth.isStale) {
    console.log();
    console.log(`  ⚠️  STALE WARNING: Pyth price is ${pyth.ageSeconds}s old (threshold: 30s)`);
  }
  console.log();

  // ── 2. Request Jupiter SOL→USDC quote (mainnet) ──────────────
  let jupiter;
  try {
    jupiter = await fetchJupiterQuote();
  } catch (err: any) {
    console.error(`[Jupiter] Error: ${err.message}`);
    console.error('         Could not fetch mainnet quote. Check network connectivity.');
    process.exit(1);
  }

  console.log(`${pad('SOL/USDC (Jupiter):')} ${formatUsd(jupiter.impliedPrice)} (for ${jupiter.inputAmountHuman} SOL)`);
  console.log(`${pad('Route:')}              ${jupiter.routeLabel} (mainnet)`);
  console.log();

  // ── 3. Compute spread ────────────────────────────────────────
  const spreadPct = computeSpreadPct(pyth.price, jupiter.impliedPrice);

  console.log(`${pad('Spread:')}             ${formatSpreadPct(spreadPct)}`);
  console.log();
  console.log('─'.repeat(56));
  console.log('  No swap executed — quote only');
  console.log('─'.repeat(56));
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
