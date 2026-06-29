import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { ThumbsUp, ThumbsDown, AlertCircle, RefreshCw, ClipboardList, Loader2 } from 'lucide-react';
import { useProgram, fetchAllProposals, activateProposal, closeProposal } from '../lib';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { ExplorerLink } from './ExplorerLink';
import { VoteDialog } from './VoteDialog';
import { StateBadge } from './StateBadge';

interface ProposalAccount {
  creator: PublicKey;
  proposal_id: BN;
  title: string;
  state: { draft: {} | null; active: {} | null; closed: {} | null };
  yes_votes: BN;
  no_votes: BN;
  bump: number;
}

interface Proposal {
  publicKey: PublicKey;
  account: ProposalAccount;
}

type ToastType = 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
}

interface ProposalCardProps {
  refetch?: () => void;
}

type ViewState = 'loading' | 'loaded' | 'empty' | 'error';

export function ProposalCard({ refetch: externalRefetch }: ProposalCardProps) {
  const { publicKey } = useWallet();
  const { program } = useProgram();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [error, setError] = useState<string>('');
  const [pendingTx, setPendingTx] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<{ type: 'activate' | 'close' | 'cancel'; proposal: Proposal } | null>(null);
  const [voteTarget, setVoteTarget] = useState<Proposal | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

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

  useEffect(() => {
    loadProposals();
  }, [loadProposals, publicKey]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getStateLabel = (state: ProposalAccount['state']): 'draft' | 'active' | 'closed' => {
    if (state.draft !== null) return 'draft';
    if (state.active !== null) return 'active';
    return 'closed';
  };

  const handleConfirmAction = async () => {
    if (!dialogAction) return;
    const { type, proposal } = dialogAction;
    const key = proposal.publicKey.toBase58();

    setPendingTx(key);
    setDialogOpen(false);

    try {
      let tx: string;
      if (type === 'activate') {
        tx = await activateProposal(program, proposal.publicKey);
        showToast(`Proposal activated! Tx: ${tx.slice(0, 8)}...`, 'success');
      } else if (type === 'close' || type === 'cancel') {
        tx = await closeProposal(program, proposal.publicKey);
        showToast(`Proposal ${type === 'close' ? 'closed' : 'cancelled'}! Tx: ${tx.slice(0, 8)}...`, 'success');
      }
      await loadProposals();
      externalRefetch?.();
    } catch (err: any) {
      console.error(`Failed to ${type}:`, err);
      showToast(err.message || `Failed to ${type} proposal`, 'error');
    } finally {
      setPendingTx(null);
      setDialogAction(null);
    }
  };

  const openDialog = (type: 'activate' | 'close' | 'cancel', proposal: Proposal) => {
    setDialogAction({ type, proposal });
    setDialogOpen(true);
  };

  const getDialogTitle = () => {
    switch (dialogAction?.type) {
      case 'activate': return 'Activate Proposal';
      case 'close': return 'Close Proposal';
      case 'cancel': return 'Cancel Proposal';
      default: return '';
    }
  };

  const getDialogDescription = () => {
    switch (dialogAction?.type) {
      case 'activate':
        return 'This will activate the proposal, allowing voting to begin. This action cannot be undone.';
      case 'close':
        return 'This will close the proposal and finalize results. Voting will no longer be possible.';
      case 'cancel':
        return 'This will cancel the draft proposal. It will be removed and cannot be recovered.';
      default:
        return '';
    }
  };

  // --- Loading skeleton ---
  if (viewState === 'loading') {
    return (
      <div className="space-y-3" role="status" aria-label="Loading proposals">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="terminal-panel rounded-lg p-4 animate-pulse"
            aria-hidden="true"
          >
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
            </div>
            <div className="flex gap-2">
              <div className="h-9 bg-surface-2 rounded-md w-24" />
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
      <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-medium text-destructive">Failed to load proposals</h3>
          <p className="text-xs text-muted mt-1 max-w-xs">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadProposals}>
          <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
          Retry
        </Button>
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
          <p className="text-sm text-muted mt-1">
            Create one from the sidebar to get started.
          </p>
        </div>
      </div>
    );
  }

  const authority = publicKey?.toBase58();

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-terminal text-sm font-medium transition-all ease-expo ${
            toast.type === 'success'
              ? 'bg-success text-accent-ink'
              : 'bg-destructive text-destructive-foreground'
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      {/* Proposal cards */}
      {proposals.map((proposal) => {
        const state = getStateLabel(proposal.account.state);
        const isCreator = authority != null && proposal.account.creator.toBase58() === authority;
        const isPending = pendingTx === proposal.publicKey.toBase58();
        const yesCount = proposal.account.yes_votes.toNumber();
        const noCount = proposal.account.no_votes.toNumber();

        return (
          <div
            key={proposal.publicKey.toBase58()}
            className={`terminal-panel rounded-lg p-4 space-y-3 transition-opacity ease-expo ${isPending ? 'opacity-60' : ''}`}
            role="article"
            aria-label={`Proposal: ${proposal.account.title}`}
            aria-busy={isPending}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground break-words">
                  {proposal.account.title}
                </h3>
                <p className="text-xs text-muted">
                  Creator:{' '}
                  <ExplorerLink type="account" value={proposal.account.creator.toBase58()} />
                </p>
              </div>
              <StateBadge state={{ [state]: {} } as any} />
            </div>

            {/* Vote counts */}
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-success">
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                {yesCount}
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                {noCount}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {state === 'draft' && isCreator && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openDialog('activate', proposal)}
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    {isPending ? 'Activating...' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDialog('cancel', proposal)}
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    {isPending ? 'Canceling...' : 'Cancel'}
                  </Button>
                </>
              )}
              {state === 'active' && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setVoteTarget(proposal)}
                    disabled={isPending}
                  >
                    Vote
                  </Button>
                  {isCreator && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDialog('close', proposal)}
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      {isPending ? 'Closing...' : 'Close'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setDialogOpen(false); setDialogAction(null); }}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              className={dialogAction?.type === 'activate' ? 'bg-success text-accent-ink hover:brightness-110' : 'bg-destructive text-destructive-foreground hover:brightness-110'}
              onClick={handleConfirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vote Dialog */}
      {voteTarget && (
        <VoteDialog
          proposal={{ title: voteTarget.account.title, pda: voteTarget.publicKey }}
          isOpen={!!voteTarget}
          onClose={() => setVoteTarget(null)}
          onVoted={() => loadProposals()}
        />
      )}
    </div>
  );
}
