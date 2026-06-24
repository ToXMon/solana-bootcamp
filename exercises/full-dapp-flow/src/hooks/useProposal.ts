import { PublicKey } from '@solana/web3.js'
import { useProgram } from '../lib/program'
import { PROGRAM_ID } from '../constants'

export function useProposal() {
  const { program } = useProgram()

  async function checkCanVote(proposalPda: PublicKey): Promise<boolean> {
    const walletPublicKey = (program.provider as any).wallet.publicKey as PublicKey
    const seeds = [
      Buffer.from('vote_record'),
      proposalPda.toBuffer(),
      walletPublicKey.toBuffer(),
    ]
    const [voteRecordPda] = PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)

    try {
      await (program.account as any).voteRecord.fetch(voteRecordPda)
      return false
    } catch {
      return true
    }
  }

  return { checkCanVote }
}
