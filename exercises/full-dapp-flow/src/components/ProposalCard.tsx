import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { Loader2, ThumbsUp, ThumbsDown, AlertCircle, RefreshCw, ClipboardList } from 'lucide-react';
import { useProgram, fetchAllProposals, activateProposal, closeProposal } from '../lib';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { ExplorerLink } from './ExplorerLink';
import { VoteDialog } from './VoteDialog';

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
          <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
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
            </div>
            <div className="flex gap-2">
              <div className="h-9 bg-gray-700 rounded-md w-24" />
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
        <AlertCircle className="h-10 w-10 text-red-400" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-medium text-red-300">Failed to load proposals</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">{error}</p>
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
        <ClipboardList className="h-14 w-14 text-gray-600" aria-hidden="true" />
        <div>
          <h3 className="text-base font-semibold text-gray-300">No proposals yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create one to get started!</p>
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
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
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

        const stateStyles: Record<string, string> = {
          draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
          active: 'bg-green-500/20 text-green-400 border-green-500/50',
          closed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        };

        return (
          <div
            key={proposal.publicKey.toBase58()}
            className={`bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3 transition-opacity ${isPending ? 'opacity-60' : ''}`}
            role="article"
            aria-label={`Proposal: ${proposal.account.title}`}
            aria-busy={isPending}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-100">
                  {proposal.account.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Creator:{' '}
                  <ExplorerLink type="account" value={proposal.account.creator.toBase58()} />
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${stateStyles[state]}`}
              >
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </span>
            </div>

            {/* Vote counts */}
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-400">
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                {yesCount}
              </span>
              <span className="flex items-center gap-1 text-red-400">
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
                    className="bg-green-600 hover:bg-green-700"
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
                    className="bg-indigo-600 hover:bg-indigo-700"
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
              className={dialogAction?.type === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
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
