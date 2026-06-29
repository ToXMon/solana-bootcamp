import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ChevronDown, Copy, Check, LogOut } from 'lucide-react';

export function WalletButton() {
  const { connected, publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const address = publicKey?.toBase58();
  const truncated = address ? `${address.slice(0, 4)}..${address.slice(-4)}` : '';

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  async function handleCopy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        disabled={connecting}
        className="wallet-adapter-button"
        aria-label="Connect wallet"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="wallet-adapter-button inline-flex items-center gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Connected wallet ${address}. Open wallet menu`}
      >
        <span className="h-2 w-2 rounded-full bg-accent-ink/80" aria-hidden="true" />
        {truncated}
        <ChevronDown
          className={`h-4 w-4 transition-transform ease-expo ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Wallet menu"
          className="absolute left-0 right-auto z-50 mt-2 w-64 rounded-lg border border-border bg-surface shadow-terminal overflow-hidden sm:right-0 sm:left-auto"
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Connected
            </p>
            <p className="mt-1 font-mono text-xs text-foreground break-all">{address}</p>
          </div>
          <button
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-surface-2 transition-colors ease-expo"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 text-muted" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy address'}
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              disconnect();
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors ease-expo"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
