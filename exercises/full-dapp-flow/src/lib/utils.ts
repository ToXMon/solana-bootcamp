import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(value: string, leading = 4, trailing = 5) {
  if (value.length <= leading + trailing + 2) return value
  return `${value.slice(0, leading)}..${value.slice(-trailing)}`
}

export function formatExplorerUrl(
  type: 'tx' | 'account',
  value: string,
  cluster = 'devnet'
) {
  return `https://explorer.solana.com/${type}/${value}?cluster=${cluster}`
}
