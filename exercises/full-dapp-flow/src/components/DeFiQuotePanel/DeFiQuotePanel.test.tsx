import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeFiQuotePanel } from './DeFiQuotePanel';

/**
 * Component tests for DeFiQuotePanel.
 *
 * Network is fully mocked — no real Pyth/Jupiter calls.
 * Auto-refresh is neutralized with a very long interval (1_000_000 ms)
 * that will never fire during a test run, so we use REAL timers and
 * waitFor/findBy queries to settle the initial async fetch.
 */

const FEED_ID = 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d';

function pythResponse(publishOffsetSec = 0) {
  return {
    parsed: [
      {
        id: FEED_ID,
        price: {
          price: '8053300000',
          conf: '4203498',
          expo: -8,
          publish_time: Math.floor(Date.now() / 1000) - publishOffsetSec,
        },
        ema_price: {
          price: '8078759800',
          conf: '4941324',
          expo: -8,
          publish_time: Math.floor(Date.now() / 1000) - publishOffsetSec,
        },
        metadata: { slot: 1, proof_available_time: 0, prev_publish_time: 0 },
      },
    ],
  };
}

const JUPITER_RESPONSE = {
  inputMint: 'So11111111111111111111111111111111111111112',
  inAmount: '1000000000',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  outAmount: '80573691',
  otherAmountThreshold: '80170823',
  swapMode: 'ExactIn',
  slippageBps: 50,
  priceImpactPct: '0',
  contextSlot: 1,
  timeTaken: 1,
  routePlan: [
    { swapInfo: { ammKey: 'x', label: 'Quantum', inputMint: 'x', outputMint: 'x', inAmount: 'x', outAmount: 'x' }, percent: 100, bps: null },
  ],
};

function mockResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
  };
}

function stubFetch(impl: (url: string) => unknown | Promise<unknown>) {
  const fn = vi.fn(async (url: string) => {
    const body = await impl(url);
    if (body instanceof Error) throw body;
    return mockResponse(body);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DeFiQuotePanel', () => {
  it('renders the loading skeleton on initial mount', () => {
    // Never-resolving fetch keeps us in the loading state.
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<DeFiQuotePanel config={{ intervalMs: 1_000_000 }} />);

    expect(screen.getByRole('status', { name: /loading quotes/i })).toBeInTheDocument();
    expect(screen.getByText(/loading pyth and jupiter quotes/i)).toBeInTheDocument();
  });

  it('renders both prices, the spread, and the always-on disclaimers on success', async () => {
    stubFetch((url) => {
      if (url.includes('hermes.pyth.network')) return pythResponse();
      if (url.includes('lite-api.jup.ag')) return JUPITER_RESPONSE;
      throw new Error(`unexpected url: ${url}`);
    });

    render(<DeFiQuotePanel config={{ intervalMs: 1_000_000, staleThresholdSeconds: 30 }} />);

    // Pyth card
    expect(await screen.findByRole('group', { name: /pyth sol\/usd price/i })).toBeInTheDocument();
    expect(screen.getByText('$80.53')).toBeInTheDocument();

    // Jupiter card
    expect(screen.getByRole('group', { name: /jupiter sol to usdc quote/i })).toBeInTheDocument();
    expect(screen.getByText('Route:')).toBeInTheDocument();
    expect(screen.getByText('Quantum')).toBeInTheDocument();

    // Spread indicator
    expect(screen.getByRole('status', { name: /spread/i })).toBeInTheDocument();

    // Always-visible disclaimers
    expect(screen.getByText(/quote only — no swap executed/i)).toBeInTheDocument();
    expect(
      screen.getByRole('status', {
        name: /cross-network comparison: pyth devnet feed vs jupiter mainnet/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows the error state with retry note when both sources fail', async () => {
    stubFetch(() => {
      throw new Error('network down');
    });

    render(<DeFiQuotePanel config={{ intervalMs: 1_000_000 }} />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/failed to load quotes/i)).toBeInTheDocument();
    expect(screen.getByText(/will retry on the next interval/i)).toBeInTheDocument();
  });

  it('keeps the quote-only disclaimer visible even during loading', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<DeFiQuotePanel config={{ intervalMs: 1_000_000 }} />);

    expect(screen.getByText(/quote only — no swap executed/i)).toBeInTheDocument();
  });

  it('exposes an accessible auto-refresh switch toggle that flips on click', async () => {
    stubFetch((url) => {
      if (url.includes('hermes.pyth.network')) return pythResponse();
      return JUPITER_RESPONSE;
    });

    render(<DeFiQuotePanel config={{ intervalMs: 1_000_000 }} />);

    const toggle = await screen.findByRole('switch', { name: /auto-refresh every/i });
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
  });

  it('flags a stale Pyth price when publish_time is older than the threshold', async () => {
    stubFetch((url) => {
      if (url.includes('hermes.pyth.network')) return pythResponse(120); // 2 min old
      return JUPITER_RESPONSE;
    });

    render(<DeFiQuotePanel config={{ intervalMs: 1_000_000, staleThresholdSeconds: 30 }} />);

    expect(await screen.findByRole('status', { name: /price is stale/i })).toBeInTheDocument();
    expect(screen.getByText('Stale')).toBeInTheDocument();
  });
});
