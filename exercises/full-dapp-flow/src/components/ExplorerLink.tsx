interface ExplorerLinkProps {
  type: 'tx' | 'account';
  value: string;
  cluster?: string;
}

export function ExplorerLink({ type, value, cluster = 'devnet' }: ExplorerLinkProps) {
  const href = `https://explorer.solana.com/${type}/${value}?cluster=${cluster}`;
  const truncated = `${value.slice(0, 4)}..${value.slice(-4)}`;
  const label = type === 'tx' ? 'View transaction on Solana Explorer' : 'View account on Solana Explorer';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-blue-400 hover:text-blue-300 underline"
    >
      {truncated}
    </a>
  );
}
