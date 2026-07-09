import express, { Request, Response } from 'express';
import cron from 'node-cron';
import type { CycleResult, PriceData } from './types';
import { fetchSolPrice } from './price-feed';
import {
  fetchActiveStrategies,
  getConnection,
  loadKeypair,
  recordPerformance,
  recordSignal,
  updateOraclePrice,
} from './solana';
import { evaluateStrategy } from './evaluator';

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT || '3000', 10);

// --- Core cycle logic ---

async function runCycle(manual = false): Promise<CycleResult> {
  const result: CycleResult = {
    timestamp: Math.floor(Date.now() / 1000),
    priceUsd: 0,
    strategiesEvaluated: 0,
    signalsGenerated: 0,
    transactionsSent: [],
    errors: [],
  };

  const connection = getConnection();
  const keypair = loadKeypair();

  const price = await fetchSolPrice();
  result.priceUsd = price.priceUsd;

  const priceData: PriceData = {
    pythPrice: Number(price.priceScaled),
    pythConfidence: Number(price.confidence),
    jupiterOutAmount: Number(price.outAmount),
    spread: 0,
    lastUpdated: price.timestamp,
  };

  try {
    const oracleTx = await updateOraclePrice(connection, keypair, price.priceScaled, price.confidence, BigInt(price.timestamp), price.outAmount);
    result.transactionsSent.push(oracleTx);
  } catch (error) {
    result.errors.push(`oracle update failed: ${(error as Error).message}`);
  }

  let strategies: Awaited<ReturnType<typeof fetchActiveStrategies>> = [];
  try {
    strategies = await fetchActiveStrategies(connection);
  } catch (error) {
    result.errors.push(`strategy fetch failed: ${(error as Error).message}`);
  }

  for (const strategy of strategies) {
    result.strategiesEvaluated += 1;
    const signal = evaluateStrategy(strategy.description, strategy.strategyId, priceData);
    if (!signal) continue;

    try {
      const sigTx = await recordSignal(connection, keypair, strategy.strategyId, signal.direction, BigInt(Math.round(signal.entryPrice * 1e9)));
      result.signalsGenerated += 1;
      result.transactionsSent.push(sigTx);
    } catch (error) {
      result.errors.push(`signal ${strategy.strategyId} failed: ${(error as Error).message}`);
      continue;
    }

    try {
      const totalSignals = strategy.signalCount + 1;
      const perfTx = await recordPerformance(
        connection,
        keypair,
        strategy.strategyId,
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
        totalSignals,
        0,
      );
      result.transactionsSent.push(perfTx);
    } catch (error) {
      result.errors.push(`performance ${strategy.strategyId} failed: ${(error as Error).message}`);
    }
  }

  console.log(`SignalForge ${manual ? 'manual' : 'cron'} cycle`, JSON.stringify(result));
  return result;
}

// --- Routes ---

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'signalforge-agent-runtime' });
});

app.post('/run', async (_req: Request, res: Response) => {
  try {
    const result = await runCycle(true);
    res.json(result);
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as Error).message });
  }
});

// --- Cron scheduler ---

cron.schedule('* * * * *', async () => {
  try {
    await runCycle(false);
  } catch (error) {
    console.error('Scheduled cycle failed:', error);
  }
});

console.log('SignalForge agent runtime: cron trigger configured for every 60 seconds');

// --- Start server ---

app.listen(PORT, () => {
  console.log(`SignalForge agent runtime listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  process.exit(0);
});

// Export for testing
export { app, runCycle };
