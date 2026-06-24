# Deployment Guide — Proposal Voting dApp

## Prerequisites

- Cloudflare account (free tier is sufficient)
- `wrangler` CLI installed (`npm install -g wrangler` or use `npx wrangler`)
- Node.js 18+ and npm

## Environment Variables

Set these in `.env` (local dev) or Cloudflare Pages dashboard (production):

| Variable | Default | Description |
|---|---|---|
| `VITE_RPC_ENDPOINT` | `https://api.devnet.solana.com` | Solana devnet RPC URL |
| `VITE_PROGRAM_ID` | `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG` | Proposal state machine program ID |
| `VITE_NETWORK` | `devnet` | Target network |

## Method 1: Direct Upload via Wrangler

```bash
# 1. Login to Cloudflare (one-time)
npx wrangler login

# 2. Build and deploy
npm run deploy
# This runs: npm run build && npx wrangler pages deploy dist/ --project-name proposal-dapp

# 3. Wrangler returns a URL like:
#    https://proposal-dapp.pages.dev
```

## Method 2: Git-Integrated CI

1. Push the repo to GitHub
2. Go to Cloudflare Dashboard → Pages → Create a project → Connect Git
3. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Framework preset**: Vite
   - **Environment variables**: Add the 3 variables above
4. Deploy — Cloudflare builds and deploys automatically on every push to `main`

## Verification

After deployment:
1. Open the `*.pages.dev` URL in a browser
2. Connect a Solana wallet (Phantom/Solflare) set to devnet
3. Create a proposal → verify the transaction on [Solana Explorer (devnet)](https://explorer.solana.com/?cluster=devnet)
4. Activate the proposal → verify on Explorer
5. Vote on the proposal → verify on Explorer
6. Close the proposal → verify on Explorer

## Akash Network (Optional Stretch Goal)

After Cloudflare deployment is live, you can optionally deploy to Akash for decentralized hosting:

1. Create a Dockerfile (multi-stage: node build → nginx serve)
2. Create an SDL config (nginx:1.25.3-alpine, 0.5 CPU, 512Mi RAM)
3. Deploy via `provider-services tx deployment create deploy.yaml`

See Akash skill documentation for full SDL templates and CLI commands.
