import type { PriceData, Signal, StrategyCriteria } from './types';

function criteriaFromDescription(strategyId: number, description: string): StrategyCriteria {
  const lower = description.toLowerCase();
  const tpMatch = lower.match(/take\s*profit\s*(?:at\s*)?(\d+(?:\.\d+)?)\s*%/);
  const slMatch = lower.match(/stop\s*loss\s*(?:at\s*)?(\d+(?:\.\d+)?)\s*%/);
  const rsiMatch = lower.match(/rsi\s*(?:drops?\s*)?(?:below|under|<)\s*(\d+)/);
  const volMatch = lower.match(/volume\s*(?:surges?|spikes?|above)?\s*(\d+(?:\.\d+)?)\s*x/);
  const priceMatch = lower.match(/price\s*(?:change|move|moves?)\s*(?:above|over|>=?)\s*(\d+(?:\.\d+)?)\s*%/);

  return {
    strategyId,
    entryCriteria: {
      ...(rsiMatch ? { rsi: { max: Number(rsiMatch[1]) } } : {}),
      ...(volMatch ? { volumeSurge: { minMultiple: Number(volMatch[1]) } } : {}),
      ...(priceMatch ? { priceChange: { minPct: Number(priceMatch[1]) } } : {}),
    },
    exitCriteria: {
      takeProfitPct: tpMatch ? Number(tpMatch[1]) : 10,
      stopLossPct: slMatch ? Number(slMatch[1]) : 5,
    },
    timeWindowHours: 24,
  } as StrategyCriteria;
}

export function evaluateStrategy(description: string, strategyId: number, price: PriceData): Signal | null {
  const strategy = criteriaFromDescription(strategyId, description);
  const normalizedPrice = price.pythPrice / 1e9;
  const confidencePct = Math.abs(price.pythPrice) > 0
    ? (price.pythConfidence / Math.abs(price.pythPrice)) * 100
    : 100;

  const now = Math.floor(Date.now() / 1000);
  if (now - price.lastUpdated > strategy.timeWindowHours * 3600) return null;

  const reasons: string[] = [];
  let score = 0;
  const criteriaCount = Math.max(Object.keys(strategy.entryCriteria).length, 1);

  if (strategy.entryCriteria.rsi && confidencePct < strategy.entryCriteria.rsi.max) {
    score += 1;
    reasons.push(`confidence proxy ${confidencePct.toFixed(2)} < RSI max ${strategy.entryCriteria.rsi.max}`);
  }

  if (strategy.entryCriteria.volumeSurge) {
    const volumeMultiple = price.jupiterOutAmount / 1e6;
    if (volumeMultiple >= strategy.entryCriteria.volumeSurge.minMultiple) {
      score += 1;
      reasons.push(`Jupiter quote ${volumeMultiple.toFixed(2)}x >= ${strategy.entryCriteria.volumeSurge.minMultiple}x`);
    }
  }

  if (strategy.entryCriteria.priceChange) {
    const spreadPct = Math.abs(price.spread / Math.max(Math.abs(price.pythPrice), 1)) * 100;
    if (spreadPct >= strategy.entryCriteria.priceChange.minPct) {
      score += 1;
      reasons.push(`spread ${spreadPct.toFixed(2)}% >= ${strategy.entryCriteria.priceChange.minPct}%`);
    }
  }

  if (score === 0) return null;

  return {
    direction: 'long',
    entryPrice: normalizedPrice,
    confidence: score / criteriaCount,
    reason: reasons.join('; '),
  };
}
