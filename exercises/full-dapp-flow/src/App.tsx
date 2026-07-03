import { useState } from 'react'
import { SolanaProvider } from './providers/SolanaProvider'
import { CreateProposalForm, DeFiQuotePanel, ProposalCard, WalletButton } from './components'

function App() {
  const [proposalListKey, setProposalListKey] = useState(0)

  return (
    <SolanaProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-12">
          <header className="relative z-50 flex flex-col gap-6 mb-10 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                solana/devnet
              </p>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                Proposal Terminal
              </h1>
              <p className="text-sm text-muted max-w-md">
                Create, activate, and vote on proposals on the Solana proposal state machine.
              </p>
            </div>
            <WalletButton />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
            <main className="space-y-4 min-w-0">
              <div className="flex items-baseline justify-between">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  Proposals
                </h2>
              </div>
              <ProposalCard
                key={proposalListKey}
                refetch={() => setProposalListKey((key) => key + 1)}
              />
            </main>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <section
                className="terminal-panel rounded-xl p-5 space-y-4"
                aria-labelledby="create-proposal-heading"
              >
                <div className="flex items-center justify-between">
                  <h2
                    id="create-proposal-heading"
                    className="font-mono text-xs uppercase tracking-[0.2em] text-muted"
                  >
                    New Proposal
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">
                    draft
                  </span>
                </div>
                <CreateProposalForm
                  onSuccess={() => setProposalListKey((key) => key + 1)}
                />
              </section>
            </aside>
          </div>

          <section className="mt-10" aria-labelledby="defi-panel-heading">
            <h2 id="defi-panel-heading" className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-4">
              DeFi Price Comparison
            </h2>
            <DeFiQuotePanel />
          </section>
        </div>
      </div>
    </SolanaProvider>
  )
}

export default App
