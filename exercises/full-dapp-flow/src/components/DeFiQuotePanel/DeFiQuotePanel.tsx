import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useDeFiQuotes } from './useDeFiQuotes';
import { PriceCard } from './PriceCard';
import { SpreadIndicator } from './SpreadIndicator';
import { RefreshControl } from './RefreshControl';
import type { DeFiQuoteConfig } from './types';

interface DeFiQuotePanelProps {
  /** Optional config overrides (useful for tests). */
  config?: Partial<DeFiQuoteConfig>;
}

/** Format the interval label from ms (e.g. 15000 → "15s"). */
function intervalLabel(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${s}s`;
}

/**
 * DeFi Quote Panel — live Pyth SOL/USD vs Jupiter SOL→USDC price comparison.
 *
 * Auto-refreshes every 15s with a manual refresh button and pause toggle.
 * Quote only — no swap is executed. Pyth reads a devnet feed; Jupiter uses
 * mainnet liquidity, so a cross-network warning is always shown.
 */
export function DeFiQuotePanel({ config }: DeFiQuotePanelProps) {
  const { state, refresh, autoRefresh, toggleAutoRefresh, config: resolvedConfig } =
    useDeFiQuotes(config ?? {});

  const isLoading = state.status === 'loading' || state.status === 'idle';
  const isError = state.status === 'error';

  return (
    <section
      className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4"
      aria-labelledby="defi-quote-heading"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 id="defi-quote-heading" className="text-lg font-semibold text-gray-100">
          SOL Price Comparison
        </h2>
        <RefreshControl
          isLoading={isLoading}
          autoRefresh={autoRefresh}
          onRefresh={refresh}
          onToggleAutoRefresh={toggleAutoRefresh}
          intervalLabel={intervalLabel(resolvedConfig.intervalMs)}
        />
      </div>

      {/* Cross-network warning badge */}
      <div
        className="inline-flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-2.5 py-1"
        role="status"
        aria-label="Cross-network comparison: Pyth devnet feed vs Jupiter mainnet liquidity"
      >
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        Cross-network: Pyth devnet feed vs Jupiter mainnet
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="status" aria-label="Loading quotes">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-700 rounded w-20" />
                <div className="h-3 bg-gray-700 rounded w-12" />
              </div>
              <div className="h-7 bg-gray-700 rounded w-24" />
              <div className="h-3 bg-gray-700 rounded w-28" />
              <div className="h-3 bg-gray-700 rounded w-20" />
            </div>
          ))}
          <span className="sr-only">Loading Pyth and Jupiter quotes...</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-medium text-red-300">Failed to load quotes</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md break-words">{state.error}</p>
          </div>
          <p className="text-xs text-gray-600">Will retry on the next interval.</p>
        </div>
      )}

      {/* Success / partial state */}
      {state.status === 'success' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.pyth ? (
              <PriceCard source="pyth" price={state.pyth} />
            ) : (
              <PartialError label="Pyth unavailable" detail="See error below" />
            )}
            {state.jupiter ? (
              <PriceCard source="jupiter" quote={state.jupiter} />
            ) : (
              <PartialError label="Jupiter unavailable" detail="See error below" />
            )}
          </div>

          {/* Spread + last updated */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-700">
            <SpreadIndicator spread={state.spread} />
            {state.lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {new Date(state.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Partial-failure context */}
          {state.error && (
            <p className="text-xs text-yellow-500/80 flex items-center gap-1.5">
              <Info className="h-3 w-3" aria-hidden="true" />
              {state.error}
            </p>
          )}
        </>
      )}

      {/* Always-visible quote-only disclaimer */}
      <p
        className="text-xs text-gray-500 flex items-center gap-1.5 pt-2 border-t border-gray-700"
        role="note"
      >
        <Info className="h-3 w-3" aria-hidden="true" />
        Quote only — no swap executed
      </p>
    </section>
  );
}

/** Small fallback card shown when one source fails but the other succeeds. */
function PartialError({ label, detail }: { label: string; detail: string }) {
  return (
    <div
      className="bg-gray-800 border border-red-500/40 rounded-lg p-4 space-y-2"
      role="status"
      aria-label={label}
    >
      <div className="flex items-center gap-1.5 text-xs text-red-400">
        <AlertCircle className="h-3 w-3" aria-hidden="true" />
        {label}
      </div>
      <p className="text-xs text-gray-500">{detail}</p>
    </div>
  );
}
