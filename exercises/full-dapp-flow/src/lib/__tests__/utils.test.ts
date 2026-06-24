import { describe, expect, it } from 'vitest'
import { cn, formatExplorerUrl, truncateAddress } from '../utils'

describe('cn', () => {
  it('merges conditional classes and resolves Tailwind conflicts', () => {
    const className = cn('px-2 text-sm', false && 'hidden', 'px-4', ['font-bold'])

    expect(className).toBe('text-sm px-4 font-bold')
  })
})

describe('truncateAddress', () => {
  it('shortens long Solana addresses with a middle ellipsis', () => {
    const address = '8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG'

    const truncated = truncateAddress(address)

    expect(truncated).toBe('8o5E..YtKFG')
  })

  it('returns short values unchanged', () => {
    expect(truncateAddress('abc123')).toBe('abc123')
  })
})

describe('formatExplorerUrl', () => {
  it('formats devnet account URLs by default', () => {
    const url = formatExplorerUrl('account', 'ExampleAddress')

    expect(url).toBe('https://explorer.solana.com/account/ExampleAddress?cluster=devnet')
  })

  it('formats transaction URLs for a custom cluster', () => {
    const url = formatExplorerUrl('tx', 'ExampleSignature', 'testnet')

    expect(url).toBe('https://explorer.solana.com/tx/ExampleSignature?cluster=testnet')
  })
})
