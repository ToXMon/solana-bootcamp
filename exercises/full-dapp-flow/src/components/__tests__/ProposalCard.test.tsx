import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProposalCard } from '../ProposalCard'

const { mockProgram, fetchAllProposals, walletPublicKeyRef } = vi.hoisted(() => ({
  mockProgram: { programId: 'test-program' },
  fetchAllProposals: vi.fn(),
  walletPublicKeyRef: { current: null as PublicKey | null },
}))

const creator = new PublicKey('HnzAHTLny7JdWacKbWHmYhs66Yq4cEhUiiPUDvjJLYnx')
const nonCreator = new PublicKey('2PaDp8U6xjCt1ygMXnEPkPTvoNzV2bL2m2z3FnE2y4iA')
const proposalKey = new PublicKey('7wKeFgf3LY3Hjd3LD74JpvMuso2jwq6a6TtQysMsivCD')

// Initialize the ref with creator by default
walletPublicKeyRef.current = creator

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({ publicKey: walletPublicKeyRef.current }),
}))

vi.mock('../../lib', () => ({
  useProgram: () => ({ program: mockProgram }),
  fetchAllProposals: (...args: unknown[]) => fetchAllProposals(...args),
  activateProposal: vi.fn(),
  closeProposal: vi.fn(),
}))

function proposal(state: 'draft' | 'active' | 'closed') {
  return {
    publicKey: proposalKey,
    account: {
      creator,
      proposal_id: new BN(1),
      title: `${state} proposal`,
      state: {
        draft: state === 'draft' ? {} : null,
        active: state === 'active' ? {} : null,
        closed: state === 'closed' ? {} : null,
      },
      yes_votes: new BN(7),
      no_votes: new BN(3),
      bump: 254,
    },
  }
}

describe('ProposalCard', () => {
  beforeEach(() => {
    walletPublicKeyRef.current = creator
    fetchAllProposals.mockReset()
  })

  it('renders proposal title, state, vote counts, and draft creator actions', async () => {
    fetchAllProposals.mockResolvedValue([proposal('draft')])

    render(<ProposalCard />)

    expect(await screen.findByRole('article', { name: 'Proposal: draft proposal' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'draft proposal' })).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders close action only for active proposals owned by the connected wallet', async () => {
    fetchAllProposals.mockResolvedValue([proposal('active')])

    render(<ProposalCard />)

    // Wait for proposals to load and render
    await waitFor(() => expect(screen.getByRole('article', { name: 'Proposal: active proposal' })).toBeInTheDocument())
    // Active proposals owned by creator should have a Close button
    const buttons = screen.getAllByRole('button')
    expect(buttons.some(b => b.textContent?.includes('Close'))).toBe(true)
    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument()
  })

  it('hides creator-only actions for non-creators', async () => {
    walletPublicKeyRef.current = nonCreator
    fetchAllProposals.mockResolvedValue([proposal('draft')])

    render(<ProposalCard />)

    await waitFor(() => expect(screen.getByRole('article', { name: 'Proposal: draft proposal' })).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })
})
