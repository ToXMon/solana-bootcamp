---
description: Deploy a Solana dApp frontend to mainnet with a server-side RPC proxy (production-grade)
---

# Mainnet Deploy — Solana dApp Frontend

Use this workflow when promoting a Solana dApp frontend from devnet to mainnet. It assumes the app is already built (Vite + React + `@solana/wallet-adapter` + `@coral-xyz/anchor`) and deployed as a static SPA on Cloudflare Workers or Pages.

**Prerequisite reading**: `docs/ideas/mainnet-deployment-guide.md` — explains *why* each step exists. This workflow is the *how*.

## 0. Pre-flight checks

- [ ] Program is deployed to **mainnet** (not devnet) and the program ID is recorded
- [ ] You have a **paid Helius/QuickNode/Triton mainnet key** (free tiers are devnet-only)
- [ ] No API keys or secrets in `src/`, `vite.config.ts`, `wrangler.jsonc`, or any committed file
  - Verify: `grep -rE "api-key=|sk_|cfut_" src/ exercises/` returns nothing
- [ ] `.env` is gitignored: `git check-ignore .env` returns the path
- [ ] `Buffer` polyfill is configured (Vite: `vite-plugin-node-polyfills` with `globals: { Buffer: true }`)

If any check fails, stop and fix before continuing.

## 1. Add the server-side RPC proxy

The browser must **never** see the mainnet RPC key. Add a `/api/rpc` route to your Worker that injects the key server-side.

### 1a. If using Cloudflare Workers (current setup)

Edit the Worker entry (create `worker.ts` if it doesn't exist) to handle both static assets and `/api/rpc`:

```ts
interface Env {
  HELIUS_MAINNET_KEY: string
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/rpc' && request.method === 'POST') {
      const upstream = new Request(
        `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_MAINNET_KEY}`,
        { method: 'POST', headers: { 'content-type': 'application/json' }, body: request.body }
      )
      const resp = await fetch(upstream)
      return new Response(resp.body, {
        status: resp.status,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': url.origin,
        },
      })
    }

    return env.ASSETS.fetch(request)
  },
}
```

Update `wrangler.jsonc` to bind the entry and assets:

```jsonc
{
  "name": "proposal-dapp",
  "main": "worker.ts",
  "compatibility_date": "2025-01-01",
  "assets": { "directory": "./dist" },
  "observability": { "enabled": true }
}
```

### 1b. If using Cloudflare Pages

Create `functions/api/rpc.ts` with the same proxy logic. Pages Functions auto-discover routes from the `functions/` directory.

## 2. Set the RPC key as a secret (never in source)

```bash
npx wrangler secret put HELIUS_MAINNET_KEY
# paste the key when prompted — stored encrypted, not in repo, not in wrangler.jsonc
```

Verify it's set:
```bash
npx wrangler secret list
```

## 3. Point the client at your proxy

In `src/constants.ts`:

```ts
export const MAINNET_RPC = import.meta.env.VITE_RPC_ENDPOINT ?? '/api/rpc'
export const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID!)
export const OPTIONS = { commitment: 'confirmed' as const, preflightCommitment: 'confirmed' as const }
```

Remove any hardcoded devnet RPC URL or devnet key from `src/`.

## 4. Set non-secret env vars for the client build

In `wrangler.jsonc` `[vars]` (non-secret only — secrets go via `wrangler secret put`):

```jsonc
"vars": {
  "VITE_NETWORK": "mainnet",
  "VITE_PROGRAM_ID": "<mainnet-program-id>"
}
```

For Vite, these must be available at **build time** — set them in your local shell before `npm run build`:

```bash
export VITE_NETWORK=mainnet
export VITE_PROGRAM_ID=<mainnet-program-id>
npm run build
```

## 5. Add mainnet transaction hardening

For every transaction in `src/lib/transactions.ts`:

- [ ] Add `ComputeBudgetProgram.setComputeUnitLimit(200_000)` as the first instruction
- [ ] Add `ComputeBudgetProgram.setComputeUnitPrice(<microLamports>)` — query `getPriorityFeeEstimate` via your proxy
- [ ] Call `connection.simulateTransaction(tx)` before `send`; on failure, show a generic error and **do not send**
- [ ] After send, confirm with `connection.confirmTransaction(sig, 'finalized')` for high-value txs

Example:
```ts
import { ComputeBudgetProgram } from '@solana/web3.js'

const ix = [
  ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }),
  await program.methods.createProposal(title).accountsStrict({...}).instruction(),
]
const tx = new Transaction().add(...ix)
const sim = await connection.simulateTransaction(tx)
if (sim.value.err) throw new Error('Transaction would fail. Not sending.')
const sig = await provider.sendAndConfirm(tx)
```

## 6. Tighten CSP and security headers

In `wrangler.jsonc`, add headers via a `_headers` file in `dist/` or via Worker response headers:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' https://explorer.solana.com; frame-ancestors 'none'; object-src 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

Adjust `connect-src` to include any wallet RPC domains your adapter needs (check browser console for blocked requests on first load).

## 7. Turn off `autoConnect` for mainnet

In `src/providers/SolanaProvider.tsx`:

```tsx
<WalletProvider wallets={wallets} autoConnect={false}>
```

Mainnet users should explicitly choose to connect. Auto-connect on first visit is jarring when real money is involved.

## 8. Build, deploy, verify

```bash
# Build with mainnet env vars
export VITE_NETWORK=mainnet
export VITE_PROGRAM_ID=<mainnet-program-id>
npm run build

# Deploy
npx wrangler deploy

# Verify the secret is set
npx wrangler secret list
```

Manual verification:
1. Open the deployed URL in a clean browser (private window)
2. Open DevTools → Network → confirm RPC calls go to `/api/rpc` (not directly to Helius)
3. Open DevTools → Sources → search the JS bundle for your Helius key → **must not be present**
4. Connect Phantom (set to mainnet) → try a read-only action
5. Try a small write tx → confirm on https://explorer.solana.com (mainnet, not `?cluster=devnet`)
6. Check DevTools console for CSP violations or blocked requests

## 9. Set up monitoring

- [ ] Uptime: Cloudflare Analytics (built-in) or UptimeRobot/BetterStack on the deployed URL
- [ ] RPC error rate: log errors from your `/api/rpc` Worker to Cloudflare Logs, alert on >5% error rate
- [ ] Tx success rate: client-side telemetry (posthog, plausible, or custom) logging `signature` + success/fail
- [ ] Weekly check: Cloudflare Workers analytics for abnormal request spikes (sign of key abuse if a leak slipped through)

## 10. Rotate any leaked keys

If any key was pasted in a terminal, chat, or commit during development:
- [ ] Rotate the Helius/QuickNode key in the provider dashboard
- [ ] `npx wrangler secret put HELIUS_MAINNET_KEY` with the new key
- [ ] Rotate the Cloudflare API token if it was ever pasted in a terminal
- [ ] `git log --all -p | grep -E "api-key=|sk_"` to confirm no keys in git history

## 11. Document the mainnet config

Update the project README with:
- Mainnet program ID
- Deployed URL
- Proxy route (`/api/rpc`)
- Secret names (`HELIUS_MAINNET_KEY`)
- Monitoring links

---

## Quick reference: devnet → mainnet diff

| File | Devnet | Mainnet |
|---|---|---|
| `src/constants.ts` | Hardcoded devnet RPC + key | `import.meta.env.VITE_RPC_ENDPOINT ?? '/api/rpc'` |
| `wrangler.jsonc` | Assets only | `main: "worker.ts"` + `[vars]` for `VITE_NETWORK`, `VITE_PROGRAM_ID` |
| `worker.ts` | Doesn't exist | `/api/rpc` proxy with `HELIUS_MAINNET_KEY` secret |
| `SolanaProvider.tsx` | `autoConnect` | `autoConnect={false}` |
| `transactions.ts` | Bare `program.methods...` | Compute budget + simulate + send |
| Secrets | None (devnet key in bundle) | `wrangler secret put HELIUS_MAINNET_KEY` |
| CSP | Loose | Strict (see step 6) |

---

*Workflow created: 2026-06-25*
*Reference: `docs/ideas/mainnet-deployment-guide.md` for the why behind each step*
