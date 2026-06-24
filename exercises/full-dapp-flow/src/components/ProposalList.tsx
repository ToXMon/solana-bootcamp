import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { ClipboardList, AlertCircle, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { useProgram, fetchAllProposals, createProposal } from '../lib';

interface Proposal {
  publicKey: PublicKey;
  account: {
    creator: PublicKey;
    proposal_id: any;
    title: string;
    state: any;
    yes_votes: any;
    no_votes: any;
    bump: number;
  };
}

type ViewState = 'loading' | 'loaded' | 'empty' | 'error';

export function ProposalList() {
  const { publicKey, connected } = useWallet();
  const { program } = useProgram();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [error, setError] = useState<string>('');
  const [pendingTx] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const loadProposals = useCallback(async () => {
    setViewState('loading');
    setError('');
    try {
      const fetched = await fetchAllProposals(program);
      setProposals(fetched);
      setViewState(fetched.length === 0 ? 'empty' : 'loaded');
    } catch (err: any) {
      console.error('Failed to fetch proposals:', err);
      setError(err.message || 'Failed to load proposals');
      setViewState('error');
    }
  }, [program]);

  // Fetch on mount and refetch on wallet change
  useEffect(() => {
    loadProposals();
  }, [loadProposals, publicKey]);

  const handleCreate = async () => {
    const title = createTitle.trim();
    if (!title || !publicKey) return;
    setCreating(true);
    try {
      const tx = await createProposal(program, title);
      console.log('Created proposal tx:', tx);
      setCreateTitle('');
      setShowCreate(false);
      await loadProposals();
    } catch (err: any) {
      console.error('Failed to create proposal:', err);
      setError(err.message || 'Failed to create proposal');
    } finally {
      setCreating(false);
    }
  };

  // --- Skeleton loading ---
  if (viewState === 'loading') {
    return (
      <div className="space-y-3" role="status" aria-label="Loading proposals">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-gray-700 rounded w-3/5" />
              <div className="h-5 bg-gray-700 rounded-full w-16" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-700 rounded w-12" />
                <div className="h-3 bg-gray-700 rounded w-8" />
              </div>
              <div className="h-2 bg-gray-700 rounded-full w-full" />
              <div className="flex justify-between">
                <div className="h-3 bg-gray-700 rounded w-10" />
                <div className="h-3 bg-gray-700 rounded w-8" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-7 bg-gray-700 rounded-md w-20" />
              <div className="h-7 bg-gray-700 rounded-md w-16" />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading proposals...</span>
      </div>
    );
  }

  // --- Error state ---
  if (viewState === 'error') {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 py-8 text-center"
      >
        <AlertCircle className="h-10 w-10 text-red-400" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-medium text-red-300">Failed to load proposals</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">{error}</p>
        </div>
        <button
          onClick={loadProposals}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          aria-label="Retry loading proposals"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  // --- Empty state ---
  if (viewState === 'empty') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <ClipboardList className="h-14 w-14 text-gray-600" aria-hidden="true" />
        <div>
          <h3 className="text-base font-semibold text-gray-300">No proposals yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create one to get started!</p>
        </div>
        {connected ? (
          <div className="flex flex-col items-center gap-2">
            {showCreate ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Proposal title..."
                  maxLength={64}
                  className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                  aria-label="Proposal title"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  disabled={creating}
                  autoFocus
                />
                <button
                  onClick={handleCreate}
                  disabled={creating || !createTitle.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Confirm create proposal"
                >
                  {creating ? (
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  ) : (
                    <Plus className="h-3 w-3" aria-hidden="true" />
                  )}
                  Create
                </button>
                <button
                  onClick={() => { setShowCreate(false); setCreateTitle(''); }}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                aria-label="Create new proposal"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Proposal
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">Connect your wallet to create proposals</p>
        )}
      </div>
    );
  }

  // --- Loaded state ---
  return (
    <div className="space-y-3">
      {/* Create button at top when wallet connected */}
      {connected && (
        <div className="flex justify-center pb-2">
          {showCreate ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="Proposal title..."
                maxLength={64}
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                aria-label="Proposal title"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                disabled={creating}
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={creating || !createTitle.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Confirm create proposal"
              >
                {creating ? (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="h-3 w-3" aria-hidden="true" />
                )}
                Create
              </button>
              <button
                onClick={() => { setShowCreate(false); setCreateTitle(''); }}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              aria-label="Create new proposal"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Proposal
            </button>
          )}
        </div>
      )}

      {/* Error banner (non-blocking) */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-800 rounded-md text-xs text-red-300"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-300"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Proposal cards - rendered inline */}
      {proposals.map((proposal) => {
        const state = proposal.account.state;
        const stateLabel = state.draft !== null ? 'Draft' : state.active !== null ? 'Active' : 'Closed';
        const isPending = pendingTx === proposal.publicKey.toBase58();
        const yesCount = proposal.account.yes_votes?.toNumber?.() ?? 0;
        const noCount = proposal.account.no_votes?.toNumber?.() ?? 0;

        return (
          <div
            key={proposal.publicKey.toBase58()}
            className={`bg-gray-900 border border-gray-800 rounded-lg p-4 transition-opacity ${isPending ? 'opacity-60' : ''}`}
            role="article"
            aria-label={`Proposal: ${proposal.account.title}`}
            aria-busy={isPending}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-100 pr-2">{proposal.account.title}</h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                {stateLabel}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <span className="text-green-400">Yes: {yesCount}</span>
              <span className="text-red-400">No: {noCount}</span>
            </div>
            <p className="text-xs text-gray-500 italic">Use ProposalCard component for full functionality</p>
          </div>
        );
      })}
    </div>
  );
}
