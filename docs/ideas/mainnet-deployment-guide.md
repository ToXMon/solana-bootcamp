# Mainnet Deployment Guide — Solana dApp Frontend

## Why this document exists

The proposal-voting dApp was deployed to Cloudflare Workers as a static SPA for the bootcamp. Two issues surfaced during that deployment that are *fine for devnet/bootcamp* but **must be fixed before mainnet**:

1. **`Buffer` polyfill missing** — app rendered blank in Safari/Brave because `@solana/web3.js` / `@coral-xyz/anchor` use Node's `Buffer` and Vite doesn't polyfill it by default. Chrome only worked because the Phantom extension injects `window.Buffer` into every page.
2. **RPC API keys must not be baked into the public JS bundle** — any endpoint configured with `VITE_RPC_ENDPOINT` is shipped in the static bundle. Anyone can extract a browser-exposed key and exhaust your quota or, if it ever has mainnet write access, drain funds.

This guide covers the production/mainnet fixes, with emphasis on the **server-side RPC proxy** pattern (the thing the bootcamp explicitly flagged as "unlikely to be necessary for devnet but required for mainnet").

---

## What changes between devnet/bootcamp and mainnet/production

| Dimension | Devnet (current) | Mainnet (production) |
|---|---|---|
| RPC endpoint | Public `api.devnet.solana.com` or Helius devnet free tier | Paid Helius/QuickNode/Triton mainnet endpoint — **never public mainnet** (rate-limited, no CORS, no SLA) |
| RPC API key | Prefer no key or a browser-restricted devnet key only | **Must not** ship in client bundle — proxy through a server |
| `Buffer` polyfill | Required (fixed via `vite-plugin-node-polyfills`) | Same — still required |
| Wallet network | Phantom/Solflare set to devnet | Phantom/Solflare set to mainnet (user-controlled, not your code) |
| Program ID | Devnet program ID | Mainnet program ID (different — redeploy program to mainnet first) |
| Commitment | `"confirmed"` is fine | `"confirmed"` for UI, `"finalized"` for high-value tx confirmations |
| Slippage / compute budget | Not relevant on devnet | Set explicitly per transaction (see below) |
| Error messages | Verbose OK | Generic — never leak RPC error details to end users |
| Monitoring | None | Uptime + RPC error rate + tx success rate alerts |
| Rate limiting | None | Per-IP rate limit on your proxy to prevent abuse of your paid RPC quota |
| CSP | Loose | Strict — `default-src 'self'; connect-src` limited to your proxy + wallet RPC domains |
| Secrets in repo | No committed RPC keys; optional browser-exposed devnet endpoint via env | **No keys in repo** — all secrets in server env vars |

---

## The server-side RPC proxy (the key mainnet pattern)

### The problem

A static SPA has no server. To talk to Solana RPC, the browser calls `https://devnet.helius-rpc.com/?api-key=KEY` directly. The key is in the JS bundle. On mainnet:

- Anyone extracts the key → uses your paid RPC quota → you get a huge bill
- If the key ever has delegated authority (some providers support this), worse
- You can't rotate the key without rebuilding + redeploying the whole frontend
- You can't enforce per-user rate limits or abuse protection

### The solution

Put a **thin server in front of your RPC provider**. The browser calls *your* server; your server adds the API key and forwards to Helius/QuickNode. The key never reaches the browser.

```
Browser  →  POST /api/rpc  →  Your Worker/Function  →  POST https://mainnet.helius-rpc.com/?api-key=SECRET
                                  (adds key, rate-limits, logs)
```

### Minimal implementation: Cloudflare Worker (recommended for this stack)

Since the dApp is already on Cloudflare Workers, add a `/api/rpc` route in the same Worker. The Worker has server-side env vars (called **secrets** in Cloudflare) that are *not* exposed to the client bundle.

```ts
// worker.ts — handles both static assets and /api/rpc
interface Env {
  HELIUS_MAINNET_KEY: string  // set via `wrangler secret put HELIUS_MAINNET_KEY`
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // RPC proxy endpoint
    if (url.pathname === '/api/rpc' && request.method === 'POST') {
      // 1. Per-IP rate limit (use Cloudflare's native rate limiting rules
      //    in dashboard, or Durable Objects / KV for custom logic)
      // 2. Optional: auth check (require wallet signature header)
      // 3. Forward to Helius with secret key
      const upstream = new Request(
        `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_MAINNET_KEY}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: request.body,
        }
      )
      const resp = await fetch(upstream)
      // Return with permissive CORS (same origin only in prod)
      return new Response(resp.body, {
        status: resp.status,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': url.origin, // same-origin only
        },
      })
    }

    // Static asset fallback (existing behavior)
    return env.ASSETS.fetch(request)
  },
}
```

Set the secret out-of-band (never in `wrangler.jsonc` or source):

```bash
npx wrangler secret put HELIUS_MAINNET_KEY
# paste key when prompted — stored encrypted, not in repo
```

### Client-side change

In `src/constants.ts`, point the RPC at your own origin:

```ts
export const DEVNET_RPC = import.meta.env.VITE_RPC_ENDPOINT ?? '/api/rpc'
```

`@solana/wallet-adapter-react`'s `ConnectionProvider` treats this as a normal RPC URL. The browser never sees the Helius key.

### Alternative implementations (same pattern)

- **Cloudflare Pages Functions** — if you deployed via Pages instead of Workers, put the same code in `functions/api/rpc.ts`. Same secret mechanism.
- **Vercel Edge Functions** — `export const config = { runtime: 'edge' }` in `pages/api/rpc.ts`. Env vars set in Vercel dashboard.
- **Traditional server (Express/Fastify)** — same proxy logic, `HELIOU_MAINNET_KEY` in `.env` on the server (never committed). Use `helmet` for CSP headers, `express-rate-limit` for per-IP limits.
- **No server at all (not recommended for mainnet)** — some RPC providers issue "domain-restricted" keys that only work from a specific origin. This is weaker than a proxy (no rate limiting, no logging, no rotation without provider support) but acceptable for low-stakes mainnet apps.

---

## Production checklist (run through this before mainnet deploy)

### Secrets & keys
- [ ] No API keys in `src/`, `vite.config.ts`, `wrangler.jsonc`, or any committed file
- [ ] `grep -rE "api-key=|sk_|cfut_" src/` returns nothing
- [ ] Helius/QuickNode key set via `wrangler secret put` (or equivalent)
- [ ] Cloudflare API token rotated if it was ever pasted in a terminal/chat
- [ ] `.env` is in `.gitignore` (verify: `git check-ignore .env` returns the path)

### RPC & network
- [ ] Frontend calls `/api/rpc` (your proxy), not a provider URL directly
- [ ] Proxy adds API key server-side; client bundle has no key
- [ ] Proxy enforces per-IP rate limit (Cloudflare Rate Limiting Rules or custom)
- [ ] Proxy sets `access-control-allow-origin` to your origin only (not `*`)
- [ ] Mainnet program ID loaded from env var, not hardcoded devnet ID
- [ ] Commitment set to `"confirmed"` for UI reads, `"finalized"` for tx confirmation before showing success

### Transactions (mainnet-specific)
- [ ] Compute budget instruction added to every tx (e.g. `ComputeBudgetProgram.setComputeUnitLimit(200_000)`) — mainnet prioritizes by compute units
- [ ] Priority fee instruction added when network is congested (`setComputeUnitPrice(microLamports)`) — query recent priority fees from your proxy
- [ ] Slippage set explicitly on swaps (not relevant for this proposal-voting app, but required for any token/swap dApp)
- [ ] Transaction simulation before send (`connection.simulateTransaction`) — fail fast with a user-friendly error instead of wasting fees

### Security
- [ ] Strict CSP: `default-src 'self'; script-src 'self'; connect-src 'self' https://*.wallet-adapter.com https://your-proxy.origin; frame-ancestors 'none'`
- [ ] No `innerHTML` with user input (use `innerText` / React's `{value}`)
- [ ] Generic error messages to users; full errors logged server-side only
- [ ] `rel="noopener noreferrer"` on any `target="_blank"` links
- [ ] HTTPS only (Cloudflare does this automatically)

### Monitoring
- [ ] Uptime monitor on the deployed URL (Cloudflare Analytics, UptimeRobot, BetterStack)
- [ ] RPC error rate alert (>5% errors → page someone)
- [ ] Tx success rate tracked (log `signature` + status from your proxy or client telemetry)
- [ ] Cloudflare Workers analytics checked weekly for abnormal request spikes (sign of key abuse if you missed a leak)

### Wallet UX
- [ ] Detect mainnet vs devnet mismatch — if user's Phantom is on devnet but app expects mainnet (or vice versa), show a banner. Check via `connection.getEpochInfo()` and compare against expected cluster.
- [ ] Auto-connect disabled on first visit (let user opt in) — `autoConnect` in `WalletProvider` is fine for devnet, can be jarring on mainnet
- [ ] Every transaction shows estimated fee + a confirmation step before sending
- [ ] Every confirmed tx links to Solana Explorer (mainnet, not devnet)

---

## Mainnet deployment workflow (step-by-step)

1. **Deploy program to mainnet** (separate workflow, not covered here — uses Anchor `anchor deploy --provider.mainnet` with a funded mainnet keypair)
2. **Get a paid Helius/QuickNode mainnet key** — free tier is devnet-only; mainnet needs a paid plan
3. **Set the mainnet program ID** in `src/constants.ts` via `VITE_PROGRAM_ID` env var (don't hardcode)
4. **Implement the `/api/rpc` proxy** in your Worker (code above)
5. **Set the Helius key as a secret**: `npx wrangler secret put HELIUS_MAINNET_KEY`
6. **Set client env vars** in `wrangler.jsonc` `[vars]` section (non-secret values only): `VITE_NETWORK=mainnet`, `VITE_PROGRAM_ID=<mainnet-id>`
7. **Build and deploy**: `npm run build && npx wrangler deploy`
8. **Verify**: open the deployed URL, connect Phantom (mainnet), try a read-only action (fetch proposals). If it works, try a small write tx and confirm on Solana Explorer (mainnet).
9. **Set up monitoring** (uptime + RPC error rate)
10. **Rotate any keys** that were pasted in terminals/chats during development

---

## Common mainnet pitfalls (things that work on devnet and break on mainnet)

- **Public mainnet RPC (`api.mainnet.solana.com`)** — rate-limited to ~40 req/min globally. Use a paid provider.
- **No priority fee** — tx sits in the mempool forever during congestion. Always set `setComputeUnitPrice`.
- **Hardcoded devnet program ID** — tx fails with "program not found" on mainnet. Load from env.
- **`autoConnect` on** — user's wallet pops up immediately on page load, scary on mainnet. Turn off for production.
- **Verbose error messages** — leaking `Program failed to interpret: ...` helps attackers debug. Show generic "Transaction failed. Please try again." and log details server-side.
- **No tx simulation** — user pays a fee for a tx that was always going to fail. Simulate first.
- **CSP too loose** — allows arbitrary script injection. Strict CSP is free, just do it.
- **Key in bundle** — works, until someone scrapes it and runs up your bill. Always proxy.

---

## Skills / references to consult for mainnet work

- **`solana-frontend`** skill — wallet-adapter + Anchor patterns, production config
- **`frontend-ui-engineering`** skill — accessibility, error states, loading states (matters more on mainnet where txs are slower and fail more)
- **Cloudflare Workers docs** — `wrangler secret`, Rate Limiting Rules, CSP headers via `wrangler.jsonc`
- **Helius docs** — mainnet endpoint, priority fee API (`getPriorityFeeEstimate`), webhook notifications
- **Solana Cookbook** — compute budget, priority fees, tx simulation
- **`@solana/wallet-adapter` docs** — `autoConnect` behavior, mobile wallet adapter, deep links

---

## What we actually did for the bootcamp deploy (for reference)

- Static SPA on Cloudflare Workers (via `wrangler.jsonc` assets binding)
- `Buffer` polyfill via `vite-plugin-node-polyfills` (fix for Safari/Brave blank page)
- Helius devnet key hardcoded in `src/constants.ts` fallback (acceptable for devnet, **not for mainnet**)
- No server-side proxy (devnet only — mainnet needs the proxy above)
- No rate limiting, no monitoring, no priority fees (all fine for devnet, all required for mainnet)

The gap between this and mainnet is: **one Worker route (`/api/rpc`), one secret, one env var, and the production checklist above.**

---

*Document created: 2026-06-25*
*Context: Bootcamp Exercise 7 — proposal-voting dApp deployed to Cloudflare Workers*
*Trigger: Deployment surfaced Buffer polyfill gap (Safari/Brave) and RPC rate limit (429 on public devnet). Both fixed for devnet; this doc covers the mainnet-grade fixes.*
