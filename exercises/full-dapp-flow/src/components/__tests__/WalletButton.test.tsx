import { PublicKey } from '@solana/web3.js'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WalletButton } from '../WalletButton'

const disconnect = vi.fn()
const setVisible = vi.fn()
let walletState = {
  connected: false,
  publicKey: null as PublicKey | null,
  connecting: false,
}

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({ ...walletState, disconnect }),
}))

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({ setVisible }),
}))

describe('WalletButton', () => {
  beforeEach(() => {
    disconnect.mockClear()
    setVisible.mockClear()
    walletState = { connected: false, publicKey: null, connecting: false }
  })

  it('opens the wallet modal when disconnected', () => {
    render(<WalletButton />)

    fireEvent.click(screen.getByRole('button', { name: 'Connect wallet' }))

    expect(setVisible).toHaveBeenCalledWith(true)
    expect(disconnect).not.toHaveBeenCalled()
  })

  it('renders the connected wallet and disconnects via dropdown', () => {
    walletState = {
      connected: true,
      publicKey: new PublicKey('HnzAHTLny7JdWacKbWHmYhs66Yq4cEhUiiPUDvjJLYnx'),
      connecting: false,
    }

    render(<WalletButton />)

    // Open the dropdown
    fireEvent.click(screen.getByRole('button', { name: /Connected wallet.*Open wallet menu/ }))

    // Click Disconnect menu item
    fireEvent.click(screen.getByRole('menuitem', { name: /Disconnect/ }))

    expect(disconnect).toHaveBeenCalledOnce()
    expect(setVisible).not.toHaveBeenCalled()
  })

  it('disables the button while connecting', () => {
    walletState = { connected: false, publicKey: null, connecting: true }

    render(<WalletButton />)

    expect(screen.getByRole('button', { name: 'Connect wallet' })).toBeDisabled()
  })
})
