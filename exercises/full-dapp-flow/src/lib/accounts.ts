// Anchor account discriminators (first 8 bytes of sha256("account:StructName"))
const PROPOSAL_DISCRIMINATOR = Buffer.from([26, 94, 189, 187, 116, 136, 53, 33])
const VOTE_RECORD_DISCRIMINATOR = Buffer.from([112, 9, 123, 165, 234, 9, 157, 167])

// Helius/Solana RPC requires encoding: 'base64' for getProgramAccounts when
// account data exceeds 128 bytes (base58 limit). web3.js v1 decodes the base64
// internally and returns account.data as a Buffer. We use Buffer.isBuffer to
// detect this — if it's already a Buffer, use it directly; if it's a raw
// [string, 'base64'] tuple (unexpected but defensive), extract and decode.
function toBuffer(data: any): Buffer {
  if (Buffer.isBuffer(data)) return data
  if (Array.isArray(data)) return Buffer.from(data[0], 'base64')
  if (typeof data === 'string') return Buffer.from(data, 'base64')
  return Buffer.from(data)
}

export async function fetchAllProposals(program: any) {
  try {
    const connection = program.provider.connection
    const accounts = await connection.getProgramAccounts(program.programId, {
      encoding: 'base64',
    })
    return accounts
      .filter((acc: any) => {
        const data = toBuffer(acc.account.data)
        return data.length >= 8 && data.slice(0, 8).equals(PROPOSAL_DISCRIMINATOR)
      })
      .map((acc: any) => ({
        publicKey: acc.pubkey,
        account: program.coder.accounts.decode('Proposal', toBuffer(acc.account.data)),
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
        const data = toBuffer(acc.account.data)
        return data.length >= 8 && data.slice(0, 8).equals(VOTE_RECORD_DISCRIMINATOR)
      })
      .map((acc: any) => ({
        publicKey: acc.pubkey,
        account: program.coder.accounts.decode('VoteRecord', toBuffer(acc.account.data)),
      }))
  } catch (err) {
    console.error('fetchAllVoteRecords failed:', err)
    return []
  }
}
