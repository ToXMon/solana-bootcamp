// Anchor account discriminators (first 8 bytes of sha256("account:StructName"))
const PROPOSAL_DISCRIMINATOR = Buffer.from([26, 94, 189, 187, 116, 136, 53, 33])
const VOTE_RECORD_DISCRIMINATOR = Buffer.from([112, 9, 123, 165, 234, 9, 157, 167])

export async function fetchAllProposals(program: any) {
  try {
    const connection = program.provider.connection
    // Public devnet RPC rejects getProgramAccounts with memcmp filters.
// Fetch all accounts unfiltered — web3.js v1 returns account.data as a native Buffer
// when no encoding is specified — then filter client-side by discriminator.
    const accounts = await connection.getProgramAccounts(program.programId)
    return accounts
      .filter((acc: any) => {
        const data = Buffer.isBuffer(acc.account.data)
          ? acc.account.data
          : Buffer.from(acc.account.data)
        return data.length >= 8 && data.slice(0, 8).equals(PROPOSAL_DISCRIMINATOR)
      })
      .map((acc: any) => ({
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
    const accounts = await connection.getProgramAccounts(program.programId)
    return accounts
      .filter((acc: any) => {
        const data = Buffer.isBuffer(acc.account.data)
          ? acc.account.data
          : Buffer.from(acc.account.data)
        return data.length >= 8 && data.slice(0, 8).equals(VOTE_RECORD_DISCRIMINATOR)
      })
      .map((acc: any) => ({
        publicKey: acc.pubkey,
        account: program.coder.accounts.decode('VoteRecord', acc.account.data),
      }))
  } catch (err) {
    console.error('fetchAllVoteRecords failed:', err)
    return []
  }
}
