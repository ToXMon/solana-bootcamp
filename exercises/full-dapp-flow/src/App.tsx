import { useState } from 'react'
import { SolanaProvider } from './providers/SolanaProvider'
import { CreateProposalForm, ProposalList, WalletButton } from './components'

function App() {
  const [proposalListKey, setProposalListKey] = useState(0)

  return (
    <SolanaProvider>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-6 mb-8">
            <h1 className="text-3xl font-bold">Proposals</h1>
            <WalletButton />
            <section className="w-full max-w-xl" aria-labelledby="create-proposal-heading">
              <h2 id="create-proposal-heading" className="mb-4 text-xl font-semibold">
                Create a Proposal
              </h2>
              <CreateProposalForm onSuccess={() => setProposalListKey((key) => key + 1)} />
            </section>
          </div>
          <ProposalList key={proposalListKey} />
        </div>
      </div>
    </SolanaProvider>
  )
}

export default App
