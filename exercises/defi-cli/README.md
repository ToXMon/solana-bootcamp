# Exercise 9 — DeFi Basics: Pyth + Jupiter Spread CLI

A standalone TypeScript CLI that fetches SOL/USD from Pyth, requests a
SOL→USDC quote from Jupiter, and computes the spread between the two
price sources.

**Quote only — no swap is executed.**

## Network Split

| Source  | Network  | Purpose                          |
|---------|----------|----------------------------------|
| Pyth    | Hermes   | Canonical SOL/USD price feed     |
| Jupiter | Mainnet  | SOL→USDC swap quote (real liquidity) |

Pyth price feeds are served via the Hermes HTTP API, which returns the
canonical price data. Jupiter quotes use **mainnet liquidity** only —
devnet liquidity would produce nonsense prices.

## Prerequisites

- **Node.js 22+** (uses built-in `fetch`)
- **npm** (for dependency installation)

## Setup

```bash
cd exercises/defi-cli
npm install
```

## Run

```bash
npx tsx src/index.ts
```

### Example Output

```
══════════════════════════════════════════════════════════
  DeFi Spread CLI — Pyth (devnet feed) vs Jupiter (mainnet)
══════════════════════════════════════════════════════════

SOL/USD (Pyth):       $75.06 +/- $0.05
Last updated:         2s ago

SOL/USDC (Jupiter):   $75.07 (for 1 SOL)
Route:                GoonFi V2 (mainnet)

Spread:               0.005%

────────────────────────────────────────────────────────────────
  No swap executed — quote only
────────────────────────────────────────────────────────────────
```

If the Pyth price is older than 30 seconds, a staleness warning is
printed:

```
  ⚠️  STALE WARNING: Pyth price is 45s old (threshold: 30s)
```

## Type Check

```bash
npm run check
```

## Configuration

All defaults work out of the box. Optional overrides via `.env` (copy
`.env.example` to `.env`):

| Variable              | Default                          | Purpose                          |
|-----------------------|----------------------------------|----------------------------------|
| `PYTH_HERMES_URL`     | `https://hermes.pyth.network`    | Pyth Hermes API base URL         |
| `JUPITER_API_URL`     | `https://lite-api.jup.ag`        | Jupiter Quote API base URL       |
| `SOLANA_DEVNET_RPC`   | `https://api.devnet.solana.com`  | Optional on-chain verification   |

## How It Works

### Pyth Price (Hermes API)

1. Requests the latest price update from Hermes:
   `GET /v2/updates/price/latest?ids[]=<FEED_ID>&parsed=true`
2. Hermes returns a JSON `parsed` array with:
   - `price` — raw integer price
   - `conf` — raw integer confidence interval
   - `expo` — negative exponent (e.g. `-8`)
   - `publish_time` — unix timestamp
3. Human-readable price = `price × 10^expo`
4. Staleness check: `now - publish_time > 30s`

**Pyth SOL/USD Feed ID:**
`ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`

### Jupiter Quote (Mainnet)

1. Requests a SOL→USDC quote:
   `GET /swap/v1/quote?inputMint=...&outputMint=...&amount=1000000000&slippageBps=50`
2. Jupiter returns `outAmount` (USDC raw units, 6 decimals)
3. Implied price = `outAmount / 10^6 / (inAmount / 10^9)`

### Spread Calculation

```
spread_pct = |jupiter_price - pyth_price| / pyth_price × 100
```

## File Structure

```
exercises/defi-cli/
  package.json          — dependencies and scripts
  tsconfig.json         — TypeScript configuration
  README.md             — this file
  src/
    index.ts            — main CLI entry point
    pyth.ts             — Pyth Hermes fetcher + price parsing
    jupiter.ts          — Jupiter quote fetcher
    math.ts             — decimal conversion + spread calculation
    types.ts            — shared TypeScript types
  .env.example          — optional configuration overrides
  .gitignore
```

## Pitfalls Handled

| Pitfall                  | Fix                                                   |
|--------------------------|-------------------------------------------------------|
| Wrong Pyth feed ID       | Verified canonical SOL/USD feed ID from Hermes API    |
| Raw units not converted  | SOL 9 decimals, USDC 6 decimals in all math           |
| Outdated Jupiter endpoint| Uses current `lite-api.jup.ag` (not deprecated v6)    |
| Devnet liquidity quotes  | Jupiter quote uses mainnet only                       |

## Dependencies

| Package              | Version  | Purpose                          |
|----------------------|----------|----------------------------------|
| `@solana/web3.js`    | 1.95.4   | Solana RPC (for optional use)    |
| `tsx`                | 4.22.4   | TypeScript script runner         |
| `typescript`         | 5.7.2    | Type checking                    |
| `@types/node`        | 22.10.0  | Node.js type definitions         |

No HTTP client library needed — Node 22 built-in `fetch` handles all
requests.
