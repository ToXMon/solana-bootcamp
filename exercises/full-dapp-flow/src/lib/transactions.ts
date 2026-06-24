import { PublicKey } from '@solana/web3.js'

export async function createProposal(program: any, title: string): Promise<string> {
  return await program.methods.createProposal(title).rpc()
}

export async function activateProposal(program: any, proposalPda: PublicKey): Promise<string> {
  return await program.methods.activate().accounts({ proposal: proposalPda }).rpc()
}

export async function voteProposal(
  program: any,
  proposalPda: PublicKey,
  voteYes: boolean
): Promise<string> {
  return await program.methods.vote(voteYes).accounts({ proposal: proposalPda }).rpc()
}

export async function closeProposal(program: any, proposalPda: PublicKey): Promise<string> {
  return await program.methods.close().accounts({ proposal: proposalPda }).rpc()
}
