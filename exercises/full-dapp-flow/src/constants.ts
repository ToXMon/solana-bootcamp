import { PublicKey } from '@solana/web3.js'

const DEFAULT_PROGRAM_ID = '8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG'
const DEFAULT_DEVNET_RPC = 'https://api.devnet.solana.com'

const configuredProgramId = import.meta.env.VITE_PROGRAM_ID?.trim() || DEFAULT_PROGRAM_ID
const configuredRpcEndpoint = import.meta.env.VITE_RPC_ENDPOINT?.trim() || DEFAULT_DEVNET_RPC

export const PROGRAM_ID = new PublicKey(configuredProgramId)
export const DEVNET_RPC = configuredRpcEndpoint
export const OPTIONS = { commitment: 'confirmed' as const, preflightCommitment: 'confirmed' as const }
