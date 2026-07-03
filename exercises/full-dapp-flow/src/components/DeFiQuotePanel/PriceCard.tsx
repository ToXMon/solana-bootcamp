import { AlertTriangle, Clock, Activity } from 'lucide-react';
import { JupiterQuote, PythPrice } from './types';

/** Format a USD price with 2 decimals. */
function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** Format an age in seconds as "2s ago" / "1m 5s ago". */
function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s ago`;
}

interface PriceCardPythProps {
  source: 'pyth';
  price: PythPrice;
}

interface PriceCardJupiterProps {
  source: 'jupiter';
  quote: JupiterQuote;
}

type PriceCardProps = PriceCardPythProps | PriceCardJupiterProps;

/**
 * Single price display card for either Pyth (with confidence + staleness)
 * or Jupiter (with route + SOL→USDC label).
 */
export function PriceCard(props: PriceCardProps) {
  if (props.source === 'pyth') {
    return <PythCard price={props.price} />;
  }
  return <JupiterCard quote={props.quote} />;
}

function PythCard({ price }: { price: PythPrice }) {
  const staleWarning = price.isStale ? (
    <span
      className="inline-flex items-center gap-1 text-xs text-yellow-400"
      role="status"
      aria-label={`Price is stale: ${price.ageSeconds} seconds old`}
    >
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      Stale
    </span>
  ) : null;

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2"
      role="group"
      aria-label="Pyth SOL/USD price"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Pyth (Hermes)</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wide">devnet feed</span>
      </div>
      <div className="text-2xl font-bold text-gray-100">
        {formatUsd(price.price)}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Activity className="h-3 w-3" aria-hidden="true" />
        ± {formatUsd(price.confidence)}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {formatAge(price.ageSeconds)}
        </span>
        {staleWarning}
      </div>
    </div>
  );
}

function JupiterCard({ quote }: { quote: JupiterQuote }) {
  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2"
      role="group"
      aria-label="Jupiter SOL to USDC quote"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Jupiter (Quote)</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wide">mainnet</span>
      </div>
      <div className="text-2xl font-bold text-gray-100">
        {formatUsd(quote.impliedPrice)}
      </div>
      <div className="text-xs text-gray-400">
        {quote.inputAmountHuman} SOL → {quote.outputAmountHuman.toFixed(2)} USDC
      </div>
      <div className="text-xs text-gray-500">
        Route: <span className="text-gray-400">{quote.routeLabel}</span>
        {quote.priceImpactPct > 0 && (
          <span className="ml-2 text-gray-600">
            impact {quote.priceImpactPct.toFixed(3)}%
          </span>
        )}
      </div>
    </div>
  );
}
