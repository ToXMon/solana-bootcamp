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
          <div key={i} className="terminal-panel rounded-lg p-4 animate-pulse" aria-hidden="true">
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-surface-2 rounded w-3/5" />
              <div className="h-5 bg-surface-2 rounded-full w-16" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <div className="h-3 bg-surface-2 rounded w-12" />
                <div className="h-3 bg-surface-2 rounded w-8" />
              </div>
              <div className="h-2 bg-surface-2 rounded-full w-full" />
              <div className="flex justify-between">
                <div className="h-3 bg-surface-2 rounded w-10" />
                <div className="h-3 bg-surface-2 rounded w-8" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-7 bg-surface-2 rounded-md w-20" />
              <div className="h-7 bg-surface-2 rounded-md w-16" />
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
        <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-medium text-destructive">Failed to load proposals</h3>
          <p className="text-xs text-muted mt-1 max-w-xs">{error}</p>
        </div>
        <button
          onClick={loadProposals}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-surface-2 text-foreground hover:bg-surface transition-colors ease-expo"
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
        <ClipboardList className="h-14 w-14 text-muted" aria-hidden="true" />
        <div>
          <h3 className="text-base font-semibold text-foreground">No proposals yet</h3>
          <p className="text-sm text-muted mt-1">Create one from the sidebar to get started.</p>
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
                  className="px-3 py-1.5 text-sm bg-surface border border-border rounded-md text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
                  aria-label="Proposal title"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  disabled={creating}
                  autoFocus
                />
                <button
                  onClick={handleCreate}
                  disabled={creating || !createTitle.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition ease-expo"
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
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface-2 text-muted hover:text-foreground transition-colors ease-expo"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:brightness-110 transition ease-expo"
                aria-label="Create new proposal"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Proposal
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted italic">Connect your wallet to create proposals</p>
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
                className="px-3 py-1.5 text-sm bg-surface border border-border rounded-md text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
                aria-label="Proposal title"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                disabled={creating}
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={creating || !createTitle.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition ease-expo"
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
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface-2 text-muted hover:text-foreground transition-colors ease-expo"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:brightness-110 transition ease-expo"
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
          className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/40 rounded-md text-xs text-destructive"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError('')}
            className="text-destructive hover:brightness-125"
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
            className={`terminal-panel rounded-lg p-4 transition-opacity ease-expo ${isPending ? 'opacity-60' : ''}`}
            role="article"
            aria-label={`Proposal: ${proposal.account.title}`}
            aria-busy={isPending}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground pr-2">{proposal.account.title}</h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-warning/15 text-warning border-warning/50">
                {stateLabel}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted mb-3">
              <span className="text-success">Yes: {yesCount}</span>
              <span className="text-destructive">No: {noCount}</span>
            </div>
            <p className="text-xs text-muted italic">Use ProposalCard component for full functionality</p>
          </div>
        );
      })}
    </div>
  );
}
