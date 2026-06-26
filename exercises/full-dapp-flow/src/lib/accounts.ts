// Anchor account discriminators (first 8 bytes of sha256("account:StructName"))
const PROPOSAL_DISCRIMINATOR = Buffer.from([26, 94, 189, 187, 116, 136, 53, 33])
const VOTE_RECORD_DISCRIMINATOR = Buffer.from([112, 9, 123, 165, 234, 9, 157, 167])

export async function fetchAllProposals(program: any) {
  try {
    const connection = program.provider.connection
    // Public devnet RPC (api.devnet.solana.com) rejects getProgramAccounts with
    // memcmp filters (INVALID_PARAMS_WITH_MESSAGE). Fetch all accounts unfiltered
    // and discriminate client-side by the first 8 bytes.
    // Use base64 encoding so account.data is always a predictable string format.
    const accounts = await connection.getProgramAccounts(program.programId, {
      encoding: 'base64',
    })
    return accounts
      .filter((acc: any) => {
        const data = Buffer.from(acc.account.data, 'base64')
        return data.length >= 8 && data.slice(0, 8).equals(PROPOSAL_DISCRIMINATOR)
      })
      .map((acc: any) => ({
        publicKey: acc.pubkey,
        account: program.coder.accounts.decode(
          'Proposal',
          Buffer.from(acc.account.data, 'base64'),
        ),
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
      encoding: 'base64',
    })
    return accounts
      .filter((acc: any) => {
        const data = Buffer.from(acc.account.data, 'base64')
        return data.length >= 8 && data.slice(0, 8).equals(VOTE_RECORD_DISCRIMINATOR)
      })
      .map((acc: any) => ({
        publicKey: acc.pubkey,
        account: program.coder.accounts.decode(
          'VoteRecord',
          Buffer.from(acc.account.data, 'base64'),
        ),
      }))
  } catch (err) {
    console.error('fetchAllVoteRecords failed:', err)
    return []
  }
}
