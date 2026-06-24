import { FormEvent, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Loader2 } from 'lucide-react'
import { createProposal } from '../lib/transactions'
import { useProgram } from '../lib/program'

const MAX_TITLE_LENGTH = 64

const PROGRAM_ERROR_MESSAGES: Record<number, string> = {
  6000: 'Only the proposal creator can perform this action',
  6001: 'Proposal is not in Draft state',
  6002: 'Proposal is not in Active state',
  6003: 'Proposal is already closed',
  6004: 'Title too long (max 64 characters)',
}

type CreateProposalFormProps = {
  onSuccess?: () => void
}

type StatusMessage = {
  type: 'success' | 'error'
  message: string
  signature?: string
}

function extractErrorCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined

  const maybeError = error as {
    error?: { errorCode?: { number?: number } }
    code?: number
    logs?: string[]
    message?: string
  }

  if (typeof maybeError.error?.errorCode?.number === 'number') {
    return maybeError.error.errorCode.number
  }

  if (typeof maybeError.code === 'number') {
    return maybeError.code
  }

  const text = [maybeError.message, ...(maybeError.logs ?? [])]
    .filter(Boolean)
    .join('\n')

  const customErrorMatch = text.match(/custom program error: (0x[0-9a-fA-F]+|\d+)/)
  if (customErrorMatch) {
    const rawCode = customErrorMatch[1]
    return rawCode.startsWith('0x') ? parseInt(rawCode, 16) : Number(rawCode)
  }

  const anchorCodeMatch = text.match(/(?:Error Code|error code|code)[:\s]+(\d{4})/)
  if (anchorCodeMatch) {
    return Number(anchorCodeMatch[1])
  }

  return undefined
}

function getErrorMessage(error: unknown): string {
  const code = extractErrorCode(error)
  if (code && PROGRAM_ERROR_MESSAGES[code]) {
    return PROGRAM_ERROR_MESSAGES[code]
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Failed to create proposal'
}

export function CreateProposalForm({ onSuccess }: CreateProposalFormProps) {
  const { connected } = useWallet()
  const { program } = useProgram()
  const [title, setTitle] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [status, setStatus] = useState<StatusMessage | null>(null)

  const trimmedTitle = title.trim()
  const canSubmit = connected && trimmedTitle.length > 0 && !isPending

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) return

    setIsPending(true)
    setStatus(null)

    try {
      const signature = await createProposal(program, trimmedTitle)
      setTitle('')
      setStatus({
        type: 'success',
        message: 'Proposal created successfully',
        signature,
      })
      onSuccess?.()
    } catch (error) {
      setStatus({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setIsPending(false)
    }
  }

  const buttonText = !connected ? 'Connect Wallet First' : isPending ? 'Creating...' : 'Create Proposal'

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-gray-800 bg-gray-950 p-5 shadow-lg shadow-black/20"
      aria-label="Create proposal form"
    >
      <div className="space-y-2">
        <label htmlFor="proposal-title" className="block text-sm font-medium text-gray-200">
          Proposal title
        </label>
        <input
          id="proposal-title"
          type="text"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          onChange={(event) => setTitle(event.target.value.slice(0, MAX_TITLE_LENGTH))}
          placeholder="Enter a proposal title"
          aria-label="Proposal title"
          aria-describedby="proposal-title-count"
          disabled={isPending}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p id="proposal-title-count" className="text-sm text-gray-400">
          {title.length}/{MAX_TITLE_LENGTH}
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        aria-label={!connected ? 'Connect wallet to create proposal' : 'Create proposal'}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
          canSubmit
            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950'
            : 'cursor-not-allowed bg-gray-800 text-gray-400'
        }`}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {buttonText}
      </button>

      {status && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'border-green-900/60 bg-green-950/40 text-green-400'
              : 'border-red-900/60 bg-red-950/40 text-red-400'
          }`}
        >
          <p>{status.message}</p>
          {status.signature && (
            <a
              href={`https://explorer.solana.com/tx/${status.signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block break-all text-green-300 underline underline-offset-4 hover:text-green-200"
              aria-label="View proposal transaction on Solana Explorer"
            >
              View on Solana Explorer: {status.signature}
            </a>
          )}
        </div>
      )}
    </form>
  )
}
