// Anchor account discriminators (first 8 bytes of sha256("account:StructName"))
const PROPOSAL_DISCRIMINATOR = Buffer.from([26, 94, 189, 187, 116, 136, 53, 33])
const VOTE_RECORD_DISCRIMINATOR = Buffer.from([112, 9, 123, 165, 234, 9, 157, 167])

export async function fetchAllProposals(program: any) {
  try {
    const connection = program.provider.connection
    const accounts = await connection.getProgramAccounts(program.programId, {
      filters: [
        { memcmp: { offset: 0, bytes: PROPOSAL_DISCRIMINATOR.toString('base64') } }
      ],
    })
    return accounts.map((acc: any) => ({
      publicKey: acc.pubkey,
      account: program.coder.accounts.decode('Proposal', acc.account.data),
    }))
  } catch (err) {
    console.error('fetchAllProposals failed:', err)
    return []
  }
}

export async function fetchAllVoteRecords(program: any) {
  try {
    const connection = program.provider.connection
    const accounts = await connection.getProgramAccounts(program.programId, {
      filters: [
        { memcmp: { offset: 0, bytes: VOTE_RECORD_DISCRIMINATOR.toString('base64') } }
      ],
    })
    return accounts.map((acc: any) => ({
      publicKey: acc.pubkey,
      account: program.coder.accounts.decode('VoteRecord', acc.account.data),
    }))
  } catch (err) {
    console.error('fetchAllVoteRecords failed:', err)
    return []
  }
}
