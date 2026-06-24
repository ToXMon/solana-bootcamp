import { PublicKey } from '@solana/web3.js'

export const PROGRAM_ID = new PublicKey("8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG")
export const DEVNET_RPC = "https://api.devnet.solana.com"
export const OPTIONS = { commitment: "confirmed" as const, preflightCommitment: "confirmed" as const }
