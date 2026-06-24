import { useEffect, useRef, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog'
import { Button } from './ui/button'
import { useProgram } from '../lib/program'
import { voteProposal } from '../lib/transactions'

interface VoteDialogProps {
  proposal: { title: string; pda: PublicKey }
  isOpen: boolean
  onClose: () => void
  onVoted: () => void
}

export function VoteDialog({ proposal, isOpen, onClose, onVoted }: VoteDialogProps) {
  const { program } = useProgram()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstVoteRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstVoteRef.current?.focus(), 50)
    }
  }, [isOpen])

  async function handleVote(voteYes: boolean) {
    setPending(true)
    setError(null)
    try {
      const txsig = await voteProposal(program, proposal.pda, voteYes)
      const explorerUrl = `https://explorer.solana.com/tx/${txsig}?cluster=devnet`
      const toast = document.createElement('div')
      toast.className = 'fixed bottom-4 right-4 z-[100] bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg shadow-lg max-w-md text-sm'
      toast.innerHTML = `Vote submitted! View on Explorer: <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer" class="underline text-green-300">${txsig.slice(0, 8)}...${txsig.slice(-4)}</a>`
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 8000)
      onVoted()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Vote transaction failed'
      setError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle id="vote-dialog-title">Cast Vote</DialogTitle>
          <DialogDescription>
            <p id="vote-description" className="text-sm text-gray-400 mt-1">
              {proposal.title}
            </p>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-3 py-2 rounded text-sm" role="alert">
            {error}
          </div>
        )}

        <DialogFooter className="flex items-center gap-2">
          <Button
            ref={firstVoteRef as any}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleVote(true)}
            disabled={pending}
            aria-label="Vote yes on proposal"
          >
            Vote Yes
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleVote(false)}
            disabled={pending}
            aria-label="Vote no on proposal"
          >
            Vote No
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          {pending && (
            <span className="text-sm text-gray-400 flex items-center gap-1.5 ml-2">
              <span className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              Submitting...
            </span>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
