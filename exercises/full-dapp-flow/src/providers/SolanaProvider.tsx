import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { DEVNET_RPC } from '../constants';

// Default styles for wallet adapter UI
import '@solana/wallet-adapter-react-ui/styles.css';

export function SolanaProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  const endpoint = useMemo(() => DEVNET_RPC, []);

  return (
    // @ts-ignore — @solana/wallet-adapter-react v0.15 FC return type is incompatible with React 18 types when @types/react 19 leaks into the hoist via react-native peer deps. Silent when unused (pinned local install), suppresses in CI.
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {/* @ts-ignore — same root cause for WalletModalProvider. */}
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
