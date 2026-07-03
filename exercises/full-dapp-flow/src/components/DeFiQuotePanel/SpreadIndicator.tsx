import { ArrowUp, ArrowDown, Minus, TrendingUp } from 'lucide-react';
import { SpreadResult } from './types';

interface SpreadIndicatorProps {
  spread: SpreadResult | null;
}

/**
 * Classify a spread into a color band. Returns Tailwind classes + a label.
 * Thresholds match DeFi norms: <0.1% tight, <0.5% normal, >=0.5% wide.
 */
function classifySpread(pct: number): {
  colorClasses: string;
  band: 'tight' | 'normal' | 'wide';
} {
  if (pct < 0.1) {
    return { colorClasses: 'text-green-400', band: 'tight' };
  }
  if (pct < 0.5) {
    return { colorClasses: 'text-yellow-400', band: 'normal' };
  }
  return { colorClasses: 'text-red-400', band: 'wide' };
}

/**
 * Spread percentage with color coding + direction indicator.
 * Color is never the sole signal — an arrow icon and direction text
 * accompany every state for screen-reader and color-blind users.
 */
export function SpreadIndicator({ spread }: SpreadIndicatorProps) {
  if (!spread) {
    return (
      <div
        className="flex items-center gap-2 text-sm text-gray-500"
        role="status"
        aria-label="Spread not available"
      >
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
        <span>Spread: —</span>
      </div>
    );
  }

  const { colorClasses, band } = classifySpread(spread.spreadPct);
  const DirectionIcon =
    spread.direction === 'jupiter-higher'
      ? ArrowUp
      : spread.direction === 'pyth-higher'
        ? ArrowDown
        : Minus;
  const directionLabel =
    spread.direction === 'jupiter-higher'
      ? 'Jupiter higher'
      : spread.direction === 'pyth-higher'
        ? 'Pyth higher'
        : 'Equal';

  return (
    <div
      className="flex items-center gap-2 text-sm"
      role="status"
      aria-label={`Spread ${spread.spreadPct.toFixed(3)} percent, ${directionLabel}, ${band}`}
    >
      <TrendingUp className="h-4 w-4 text-gray-400" aria-hidden="true" />
      <span className={`font-semibold ${colorClasses}`}>
        {spread.spreadPct.toFixed(3)}%
      </span>
      <span
        className={`inline-flex items-center gap-0.5 text-xs ${colorClasses}`}
        aria-hidden="true"
      >
        <DirectionIcon className="h-3 w-3" />
        {directionLabel}
      </span>
      <span className="sr-only">, band {band}</span>
    </div>
  );
}
