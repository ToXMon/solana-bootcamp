import { PublicKey, SystemProgram } from '@solana/web3.js'
import { PROGRAM_ID } from '../constants'
import { getProposalCounterPda, getProposalPda, getVoteRecordPda } from './pdas'

export async function createProposal(program: any, title: string): Promise<string> {
  const wallet = program.provider.wallet
  const creator = wallet.publicKey

  // Derive counter PDA
  const [counterPda] = getProposalCounterPda(PROGRAM_ID)

  // Read current counter to get next proposal_id
  let proposalId = 0
  try {
    const counter = await program.account.proposalCounter.fetch(counterPda)
    proposalId = counter.count.toNumber()
  } catch {
    // Counter not initialized yet — first proposal, id = 0
  }

  // Derive proposal PDA
  const [proposalPda] = getProposalPda(PROGRAM_ID, creator, proposalId)

  return await program.methods
    .createProposal(title)
    .accountsStrict({
      counter: counterPda,
      proposal: proposalPda,
      creator: creator,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export async function activateProposal(program: any, proposalPda: PublicKey): Promise<string> {
  const wallet = program.provider.wallet
  const creator = wallet.publicKey

  return await program.methods
    .activate()
    .accounts({
      proposal: proposalPda,
      creator: creator,
    })
    .rpc()
}

export async function voteProposal(
  program: any,
  proposalPda: PublicKey,
  voteYes: boolean
): Promise<string> {
  const wallet = program.provider.wallet
  const voter = wallet.publicKey

  // Derive vote record PDA
  const [voteRecordPda] = getVoteRecordPda(PROGRAM_ID, proposalPda, voter)

  return await program.methods
    .vote(voteYes)
    .accounts({
      proposal: proposalPda,
      voteRecord: voteRecordPda,
      voter: voter,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export async function closeProposal(program: any, proposalPda: PublicKey): Promise<string> {
  const wallet = program.provider.wallet
  const creator = wallet.publicKey

  return await program.methods
    .close()
    .accounts({
      proposal: proposalPda,
      creator: creator,
    })
    .rpc()
}
