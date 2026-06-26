import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

// Anchor account discriminators (first 8 bytes of sha256("account:StructName"))
const PROPOSAL_DISCRIMINATOR = Buffer.from([26, 94, 189, 187, 116, 136, 53, 33])
const VOTE_RECORD_DISCRIMINATOR = Buffer.from([112, 9, 123, 165, 234, 9, 157, 167])

// The IDL has spec 0.1.0 (old format) but @coral-xyz/anchor 0.30.1's coder
// expects spec 1.0.0. program.coder.accounts.decode('Proposal', ...) throws
// 'Account not found: Proposal' for every account. We bypass the coder entirely
// and decode the Borsh-serialized data manually using the exact Rust struct layout.

function toBuffer(data: any): Buffer {
  if (Buffer.isBuffer(data)) return data
  if (Array.isArray(data)) return Buffer.from(data[0], 'base64')
  if (typeof data === 'string') return Buffer.from(data, 'base64')
  return Buffer.from(data)
}

// Proposal struct layout (after 8-byte discriminator):
//   creator:      Pubkey  (32 bytes)
//   proposal_id:  u64     (8 bytes LE)
//   title:        String  (4-byte LE length + N bytes UTF-8)
//   state:        enum    (1 byte: 0=Draft, 1=Active, 2=Closed)
//   yes_votes:    u64     (8 bytes LE)
//   no_votes:     u64     (8 bytes LE)
//   bump:         u8      (1 byte)
function decodeProposal(data: Buffer) {
  let offset = 8 // skip discriminator
  const creator = new PublicKey(data.subarray(offset, offset + 32)); offset += 32
  const proposal_id = new BN(data.subarray(offset, offset + 8), 'le'); offset += 8
  const titleLen = data.readUInt32LE(offset); offset += 4
  const title = data.subarray(offset, offset + titleLen).toString('utf8'); offset += titleLen
  const stateByte = data.readUInt8(offset); offset += 1
  const state = stateByte === 0 ? { draft: {} } : stateByte === 1 ? { active: {} } : { closed: {} }
  const yes_votes = new BN(data.subarray(offset, offset + 8), 'le'); offset += 8
  const no_votes = new BN(data.subarray(offset, offset + 8), 'le'); offset += 8
  const bump = data.readUInt8(offset)
  return { creator, proposal_id, title, state, yes_votes, no_votes, bump }
}

// VoteRecord struct layout (after 8-byte discriminator):
//   proposal:  Pubkey  (32 bytes)
//   voter:     Pubkey  (32 bytes)
//   vote_yes:  bool    (1 byte)
//   bump:      u8      (1 byte)
function decodeVoteRecord(data: Buffer) {
  let offset = 8
  const proposal = new PublicKey(data.subarray(offset, offset + 32)); offset += 32
  const voter = new PublicKey(data.subarray(offset, offset + 32)); offset += 32
  const vote_yes = data.readUInt8(offset) !== 0; offset += 1
  const bump = data.readUInt8(offset)
  return { proposal, voter, vote_yes, bump }
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
        return data.length >= 8 && data.subarray(0, 8).equals(PROPOSAL_DISCRIMINATOR)
      })
      .map((acc: any) => ({
        publicKey: acc.pubkey,
        account: decodeProposal(toBuffer(acc.account.data)),
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
        return data.length >= 8 && data.subarray(0, 8).equals(VOTE_RECORD_DISCRIMINATOR)
      })
      .map((acc: any) => ({
        publicKey: acc.pubkey,
        account: decodeVoteRecord(toBuffer(acc.account.data)),
      }))
  } catch (err) {
    console.error('fetchAllVoteRecords failed:', err)
    return []
  }
}
