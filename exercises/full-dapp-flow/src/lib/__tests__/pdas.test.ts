// @vitest-environment node
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { describe, expect, it } from 'vitest'
import { getProposalCounterPda, getProposalPda, getVoteRecordPda } from '../pdas'

const programId = new PublicKey('8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG')
const creator = new PublicKey('HnzAHTLny7JdWacKbWHmYhs66Yq4cEhUiiPUDvjJLYnx')
const voter = new PublicKey('2PaDp8U6xjCt1ygMXnEPkPTvoNzV2bL2m2z3FnE2y4iA')

describe('PDA derivation', () => {
  it('derives the proposal counter PDA from the proposal_counter seed', () => {
    const [pda, bump] = getProposalCounterPda(programId)
    const [expectedPda, expectedBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('proposal_counter')],
      programId
    )

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
    expect(bump).toBe(expectedBump)
  })

  it('derives proposal PDAs with creator and little-endian proposal id seeds', () => {
    const [pda, bump] = getProposalPda(programId, creator, 42)
    const [expectedPda, expectedBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('proposal'), creator.toBuffer(), new BN(42).toArrayLike(Buffer, 'le', 8)],
      programId
    )

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
    expect(bump).toBe(expectedBump)
  })

  it('derives vote record PDAs with proposal and voter seeds', () => {
    const [proposal] = getProposalPda(programId, creator, 1)
    const [pda, bump] = getVoteRecordPda(programId, proposal, voter)
    const [expectedPda, expectedBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('vote'), proposal.toBuffer(), voter.toBuffer()],
      programId
    )

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
    expect(bump).toBe(expectedBump)
  })
})
