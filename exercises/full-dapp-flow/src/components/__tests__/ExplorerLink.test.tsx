import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExplorerLink } from '../ExplorerLink'

describe('ExplorerLink', () => {
  it('renders a devnet account link with truncated text', () => {
    render(<ExplorerLink type="account" value="8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG" />)

    const link = screen.getByRole('link', { name: 'View account on Solana Explorer' })
    expect(link).toHaveAttribute('href', 'https://explorer.solana.com/account/8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG?cluster=devnet')
    expect(link).toHaveTextContent('8o5E..tKFG')
  })

  it('renders a transaction link for the requested cluster', () => {
    render(<ExplorerLink type="tx" value="ExampleSignature123456" cluster="testnet" />)

    expect(screen.getByRole('link', { name: 'View transaction on Solana Explorer' })).toHaveAttribute(
      'href',
      'https://explorer.solana.com/tx/ExampleSignature123456?cluster=testnet'
    )
  })
})
