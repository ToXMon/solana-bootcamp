export async function fetchAllProposals(program: any) {
  const accounts = await program.account.proposal.all()
  return accounts.map((a: any) => ({ publicKey: a.publicKey, account: a.account }))
}

export async function fetchAllVoteRecords(program: any) {
  const accounts = await program.account.voteRecord.all()
  return accounts.map((a: any) => ({ publicKey: a.publicKey, account: a.account }))
}
