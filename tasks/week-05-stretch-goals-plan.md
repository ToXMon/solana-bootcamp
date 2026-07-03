# Week 5 Stretch Goals — Implementation Plan

## Overview

Three optional stretch exercises that extend the core Week 5 deliverables into production-relevant territory:

1. **Escrow Partial Fills** — Extend the trustless escrow to support partial swaps with overflow-safe arithmetic
2. **DeFi Quote Panel** — Add a live Pyth + Jupiter price panel to the Week 4 React frontend
3. **Compressed NFT Cost Comparison** — Compare the cost of minting 100 regular vs 100 compressed NFTs

## Current State

| Exercise | State | Key Files |
|---|---|---|
| Escrow (Exercise 8) | ✅ 8/8 tests, devnet deployed | `exercises/escrow-program/programs/escrow-program/src/` |
| DeFi CLI (Exercise 9) | ✅ Live price output | `exercises/defi-cli/src/` |
| NFT Collection (Exercise 10) | ✅ Collection + 3 members | `exercises/nft-collection/src/` |
| Full Dapp (Exercise 7) | ✅ React + wallet adapter | `exercises/full-dapp-flow/src/` |

---

## Stretch Goal 1: Escrow Partial Fills

### Problem

The current escrow is all-or-nothing: the taker must send the full `receive` amount of Token B in one `take` call. Real-world OTC desks and AMMs support partial fills — a taker swaps a portion of the offered Token A for a proportional portion of the requested Token B, and the escrow stays open for additional takers.

### Design

#### State Changes

Current `Escrow` struct:

```rust
pub struct Escrow {
    pub seed: u64,
    pub maker: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub receive: u64,
    pub bump: u8,
}
```

Proposed extended struct:

```rust
pub struct Escrow {
    pub seed: u64,
    pub maker: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub receive: u64,       // Total Token B requested (unchanged)
    pub offer_amount: u64,  // NEW: Total Token A offered (was implicit = vault balance at make time)
    pub filled_b: u64,      // NEW: Cumulative Token B received so far
    pub bump: u8,
}
```

**Why `offer_amount` is needed**: With partial fills, the vault balance decreases over time. We need to know the original offer to compute proportional exchange rates for each partial fill.

#### Instruction Changes

| Instruction | Current | Partial-Fill Version |
|---|---|---|
| `make` | Store `receive`, transfer `amount` to vault | Store `receive` + `offer_amount`, transfer `amount` to vault |
| `take` | Full swap: send `receive` of Token B, receive all Token A, close escrow | Partial swap: taker sends `amount_b` of Token B, receives proportional Token A, escrow stays open if unfilled |
| `cancel` | Refund all Token A, close escrow | Refund remaining Token A, close escrow (only if maker or unfilled) |

#### Partial Fill Math

```
Given:
  offer_amount = total Token A offered
  receive = total Token B requested
  filled_b = Token B already received
  amount_b = taker's partial Token B contribution

Remaining B = receive - filled_b
  → require!(amount_b <= remaining_b, ExceedsRemaining)

Token A to release = (amount_b * offer_amount) / receive
  → checked_mul + checked_div
  → Rounding: round DOWN (favor maker — taker gets slightly less per partial fill, maker gets slightly better rate)

New filled_b = filled_b + amount_b
  → checked_add

If new filled_b == receive:
  → Close escrow + vault (fully filled)
Else:
  → Keep escrow open, update filled_b
```

#### Overflow-Safe Arithmetic

All arithmetic uses checked operations:

```rust
let remaining_b = ctx.accounts.escrow.receive
    .checked_sub(ctx.accounts.escrow.filled_b)
    .ok_or(EscrowError::ArithmeticOverflow)?;

let release_a = amount_b
    .checked_mul(ctx.accounts.escrow.offer_amount)
    .ok_or(EscrowError::ArithmeticOverflow)?
    .checked_div(ctx.accounts.escrow.receive)
    .ok_or(EscrowError::ArithmeticOverflow)?;

ctx.accounts.escrow.filled_b = ctx.accounts.escrow.filled_b
    .checked_add(amount_b)
    .ok_or(EscrowError::ArithmeticOverflow)?;
```

#### Rounding-Aware State Updates

- **Token A release**: Round DOWN → taker receives slightly less per partial fill
- **Remaining Token A in vault**: `offer_amount - sum(release_a)` → tracks exactly what's left
- **Filled B**: Exact accumulation, no rounding needed
- **Final fill**: When `filled_b == receive`, release all remaining vault balance (handles dust from rounding)

### Test Matrix (6 new cases)

| # | Test Case | What It Proves |
|---|---|---|
| 9 | Partial fill (50%) then full fill (50%) | Two partial fills complete the swap, balances reconcile |
| 10 | Three partial fills (33/33/34%) | Multiple takers fill proportionally, dust handled on final fill |
| 11 | Partial fill then cancel | Maker reclaims remaining Token A, filled_b persists in closed state |
| 12 | Partial fill exceeding remaining | `ExceedsRemaining` error fires |
| 13 | Overflow attempt (large amount_b * offer_amount) | `ArithmeticOverflow` error fires |
| 14 | Balance reconciliation across partials | Total Token A released + remaining vault = original offer_amount |

### Files to Change

| File | Change |
|---|---|
| `programs/escrow-program/src/state.rs` | Add `offer_amount`, `filled_b` fields |
| `programs/escrow-program/src/lib.rs` | Update `make` to store `offer_amount`, update `take` for partial logic |
| `programs/escrow-program/src/errors.rs` | Add `ExceedsRemaining`, `ArithmeticOverflow` errors |
| `programs/escrow-program/src/instructions/make.rs` | Store `offer_amount` param |
| `programs/escrow-program/src/instructions/take.rs` | Accept `amount_b` param, compute proportional release, conditional close |
| `programs/escrow-program/src/instructions/cancel.rs` | No change (already closes, but refund = remaining vault balance) |
| `tests/escrow-program.ts` | Add 6 new test cases, update existing 8 for new `offer_amount` param |

### Acceptance Criteria

- [ ] `make` accepts and stores `offer_amount`
- [ ] `take` accepts `amount_b` and computes proportional Token A release
- [ ] Overflow-safe arithmetic on all multiplication/division/addition
- [ ] Rounding favors maker (taker gets floor of proportional amount)
- [ ] Final fill releases all remaining vault balance (dust cleanup)
- [ ] `cancel` refunds remaining Token A after partial fills
- [ ] All 14 tests pass (8 existing + 6 new)
- [ ] Balance reconciliation holds: sum(release_a) + remaining_vault = offer_amount

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Rounding dust accumulates | Medium | Final fill releases entire remaining vault balance |
| Existing tests break | Low | `offer_amount` is new param — update test `make` calls |
| Devnet redeploy needed | Low | Same program ID, upgrade with `anchor deploy` |
| State migration | Medium | Old escrow accounts have different layout — either close all first or use `realloc` migration instruction |

### Recommended Approach

**Do not migrate existing devnet escrow accounts.** Close them first (via `cancel`), deploy the new program, then create fresh escrows with partial-fill support.

---

## Stretch Goal 2: DeFi Quote Panel

### Problem

The Exercise 9 DeFi CLI runs in the terminal. The stretch goal is to bring the same Pyth + Jupiter price comparison into the Week 4 React frontend as a live, auto-refreshing panel.

### Design

#### Component Structure

```
src/components/
  DeFiQuotePanel/
    DeFiQuotePanel.tsx       # Main panel container
    PriceCard.tsx            # Single price display (Pyth or Jupiter)
    SpreadIndicator.tsx      # Spread % with color coding
    RefreshControl.tsx        # Manual refresh button + auto-refresh toggle
    useDeFiQuotes.ts          # Custom hook: fetch Pyth + Jupiter quotes
    types.ts                  # Shared types
    DeFiQuotePanel.test.tsx   # Component tests
```

#### Data Flow

```
DeFiQuotePanel
  └── useDeFiQuotes hook (auto-refresh every 15s)
        ├── fetchPythPrice() → Hermes API → SOL/USD price + confidence + publish_time
        ├── fetchJupiterQuote() → Jupiter API → SOL/USDC quote amount
        └── computeSpread() → (jupiter - pyth) / pyth * 100
  └── PriceCard (Pyth)
  └── PriceCard (Jupiter)
  └── SpreadIndicator
  └── RefreshControl
```

#### API Integration

**Pyth Hermes** (devnet feed):

```typescript
const PYTH_URL = 'https://hermes.pyth.network/v2/updates/price/latest';
const SOL_USD_FEED_ID = 'ef0d8b6fca5c0b1e6d2b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9';
// Fetch via POST with { encoded: true, ids: [feedId] }
```

**Jupiter Quote** (mainnet):

```typescript
const JUPITER_URL = 'https://lite-api.jup.ag/swap/v1/quote';
// Params: inputMint=So11111111111111111111111111111111111111112
//         outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
//         amount=1000000000 (1 SOL)
//         slippageBps=50
```

**Network note**: Pyth fetches from devnet feed, Jupiter fetches from mainnet. This is a known cross-network comparison — the panel should display a warning badge explaining the network difference.

#### UI Design

```
┌─────────────────────────────────────────┐
│  SOL Price Comparison     [↻ Auto 15s]  │
├──────────────────┬──────────────────────┤
│  Pyth (devnet)   │  Jupiter (mainnet)   │
│  $78.47          │  $78.50              │
│  ± $0.04         │  1 SOL → USDC        │
│  Updated 2s ago  │  Route: ZeroFi       │
├──────────────────┴──────────────────────┤
│  Spread: +0.032%  ⚠ Cross-network      │
│  Quote only — no swap executed          │
└─────────────────────────────────────────┘
```

#### Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Polling interval | 15 seconds | Balance between freshness and API rate limits |
| Manual refresh | Yes | User can trigger immediate fetch |
| Auto-refresh toggle | Yes | User can pause to study a specific quote |
| Staleness warning | >30s | Matches Exercise 9 CLI threshold |
| Error handling | Show error state, retry on next interval | Don't crash the panel on API failure |
| Network warning badge | Yes | Cross-network comparison is a known caveat |

### Files to Create/Change

| File | Action |
|---|---|
| `src/components/DeFiQuotePanel/DeFiQuotePanel.tsx` | Create — main panel |
| `src/components/DeFiQuotePanel/PriceCard.tsx` | Create — price display card |
| `src/components/DeFiQuotePanel/SpreadIndicator.tsx` | Create — spread display |
| `src/components/DeFiQuotePanel/RefreshControl.tsx` | Create — refresh controls |
| `src/components/DeFiQuotePanel/useDeFiQuotes.ts` | Create — data fetching hook |
| `src/components/DeFiQuotePanel/types.ts` | Create — shared types |
| `src/components/DeFiQuotePanel/DeFiQuotePanel.test.tsx` | Create — component tests |
| `src/components/DeFiQuotePanel/index.ts` | Create — barrel export |
| `src/App.tsx` | Modify — add `<DeFiQuotePanel />` below proposal list |
| `src/components/index.ts` | Modify — export DeFiQuotePanel |

### Acceptance Criteria

- [ ] Panel renders Pyth SOL/USD price with confidence interval
- [ ] Panel renders Jupiter SOL→USDC quote
- [ ] Spread percentage calculated and displayed
- [ ] Auto-refresh every 15 seconds with toggle to pause
- [ ] Manual refresh button works
- [ ] Staleness warning appears if price >30s old
- [ ] Cross-network warning badge visible
- [ ] "Quote only — no swap executed" label always visible
- [ ] Error state handled gracefully (show error, retry on next interval)
| [ ] `npm run build` passes
| [ ] Component tests pass

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| CORS issues with Jupiter API | High | Test in browser; may need a proxy or serverless function |
| Pyth Hermes CORS | Medium | Hermes API typically allows CORS; test in browser |
| Rate limiting | Medium | 15s interval + manual toggle to pause |
| Existing frontend breaks | Low | New component is additive, no changes to existing proposal flow |

---

## Stretch Goal 3: Compressed NFT Cost Comparison

### Problem

Minting 100 regular NFTs costs significantly more than 100 compressed NFTs because each regular NFT requires a separate mint account (rent-exempt) plus metadata account. Compressed NFTs use Merkle trees to store ownership in a single tree account, dramatically reducing per-NFT cost.

### Design

This is primarily a **research + calculation + reporting** exercise, not a full implementation. The deliverable is a comparison document with:

1. **Theoretical cost breakdown** for both approaches
2. **Devnet proof** — mint a small batch (5-10) of each type to verify costs
3. **Extrapolation** to 100 NFTs
4. **Tradeoff analysis** (cost vs flexibility vs composability)

#### Cost Model

**Regular NFTs (Metaplex Token Metadata):**

| Cost Component | Per NFT | For 100 NFTs |
|---|---|---|
| Mint account rent | ~0.00156 SOL (2032 bytes) | 0.156 SOL |
| Metadata account rent | ~0.00347 SOL (679 bytes max) | 0.347 SOL |
| Token account rent | ~0.00205 SOL (165 bytes) | 0.205 SOL |
| Transaction fee | 0.000005 SOL | 0.0005 SOL |
| **Total (estimated)** | ~0.007 SOL | **~0.708 SOL** |

**Compressed NFTs (Bubblegum + Merkle Tree):**

| Cost Component | One-time | Per NFT | For 100 NFTs |
|---|---|---|---|
| Merkle tree account | ~0.0012 SOL (depends on tree size) | — | 0.0012 SOL |
| Tree config account | ~0.00156 SOL | — | 0.00156 SOL |
| Mint to tree CPI | — | ~0.000005 SOL (tx fee only) | 0.0005 SOL |
| **Total (estimated)** | 0.00276 SOL | 0.000005 SOL | **~0.0033 SOL** |

**Estimated savings: ~99.5%**

#### Implementation Plan

**Phase 1: Regular NFT Batch (devnet)**
- Use existing Umi + Metaplex setup from Exercise 10
- Mint 5 regular NFTs in a loop
- Record transaction signatures and costs
- Calculate per-NFT cost from actual rent + fees

**Phase 2: Compressed NFT Batch (devnet)**
- Install `@metaplex-foundation/mpl-bubblegum` package
- Create a Merkle tree (max depth + max buffer size for 100 NFTs)
- Mint 5 compressed NFTs to the tree
- Record transaction signatures and costs
- Calculate per-NFT cost

**Phase 3: Cost Report**
- Extrapolate devnet costs to 100 NFTs
- Document tradeoffs:
  - Regular NFTs: Transferable, composable with existing dApps, full metadata on-chain
  - Compressed NFTs: Cheaper, but require tree proofs for transfer, less composability
- Save report to `docs/compressed-nft-cost-comparison.md`

#### Bubblegum Tree Parameters

For 100 NFTs:

```typescript
// Tree parameters
maxDepth: 14,        // 2^14 = 16,384 leaves (enough for 100)
maxBufferSize: 64,   // Standard buffer size
canopyDepth: 14,     // Full canopy for easy proof verification
```

### Files to Create

| File | Purpose |
|---|---|
| `exercises/nft-cost-comparison/scripts/mint-regular-batch.ts` | Mint 5 regular NFTs, record costs |
| `exercises/nft-cost-comparison/scripts/mint-compressed-batch.ts` | Mint 5 compressed NFTs, record costs |
| `exercises/nft-cost-comparison/scripts/calculate-costs.ts` | Parse tx signatures, compute rent + fees |
| `exercises/nft-cost-comparison/package.json` | Deps: @metaplex-foundation/umi, mpl-bubblegum, @solana/web3.js |
| `docs/compressed-nft-cost-comparison.md` | Final comparison report |

### Acceptance Criteria

- [ ] 5 regular NFTs minted on devnet with tx signatures recorded
- [ ] Merkle tree created on devnet with correct parameters
- [ ] 5 compressed NFTs minted to tree on devnet with tx signatures recorded
- [ ] Per-NFT cost calculated for both approaches from actual on-chain data
- [ ] Extrapolation to 100 NFTs documented
- [ ] Cost comparison report saved to `docs/compressed-nft-cost-comparison.md`
- [ ] Tradeoff analysis included (cost vs flexibility vs composability)

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Bubblegum package version mismatch with Umi 0.9.2 | High | Pin `@metaplex-foundation/mpl-bubblegum` to compatible version |
| Merkle tree creation fails on devnet | Medium | Check Bubblegum program deployment on devnet |
| Cost calculation from tx signatures is complex | Medium | Use `solana transaction <sig> --output json` to parse fees |
| Devnet SOL for minting | Low | Only 5 NFTs each, minimal cost |

---

## Execution Order

| Phase | Stretch Goal | Dependencies | Estimated Effort |
|---|---|---|---|
| Phase A | Stretch 1 (Escrow Partial Fills) | Exercise 8 complete ✅ | 1 session (design + test + deploy) |
| Phase B | Stretch 2 (DeFi Quote Panel) | Exercise 9 complete ✅, Exercise 7 frontend ✅ | 1 session (components + integration) |
| Phase C | Stretch 3 (Compressed NFTs) | Exercise 10 complete ✅ | 1 session (scripts + report) |

**Phases A, B, and C are independent and can be done in any order.**

### Recommended Priority

1. **Stretch 2 (DeFi Quote Panel)** — Highest learning value: brings DeFi data into a real frontend, tests CORS/API patterns
2. **Stretch 1 (Escrow Partial Fills)** — Deepens Anchor program design: overflow math, state evolution, rounding strategy
3. **Stretch 3 (Compressed NFTs)** — Broadest ecosystem knowledge: Bubblegum, Merkle trees, cost optimization

---

## Summary

| Stretch | Core Skill | Deliverable |
|---|---|---|
| 1 — Escrow Partial Fills | Anchor program design | Extended escrow with 14/14 tests |
| 2 — DeFi Quote Panel | React + API integration | Live price panel in Week 4 frontend |
| 3 — Compressed NFTs | Bubblegum + Merkle trees | Cost comparison report with devnet proof |
