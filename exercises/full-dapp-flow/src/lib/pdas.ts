import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

export function getProposalCounterPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal_counter")],
    programId
  )
}

export function getProposalPda(
  programId: PublicKey,
  creator: PublicKey,
  proposalId: number
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("proposal"),
      creator.toBuffer(),
      new BN(proposalId).toArrayLike(Buffer, 'le', 8),
    ],
    programId
  )
}

export function getVoteRecordPda(
  programId: PublicKey,
  proposal: PublicKey,
  voter: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("vote"),
      proposal.toBuffer(),
      voter.toBuffer(),
    ],
    programId
  )
}
