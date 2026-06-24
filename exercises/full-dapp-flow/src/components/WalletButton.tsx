import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useCallback } from 'react';

export function WalletButton() {
  const { connected, publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = useCallback(() => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  }, [connected, disconnect, setVisible]);

  const truncated = publicKey?.toBase58().slice(0, 4) + '..' + publicKey?.toBase58().slice(-4);

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="wallet-adapter-button truncate"
    >
      {connecting ? 'Connecting...' : connected ? truncated : 'Connect Wallet'}
    </button>
  );
}
