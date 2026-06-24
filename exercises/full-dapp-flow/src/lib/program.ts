import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import idl from '../idl/proposal_state_machine.json'
import { DEVNET_RPC, OPTIONS } from '../constants'

export function useProgram() {
  const wallet = useWallet()
  const connection = new Connection(DEVNET_RPC, OPTIONS)
  const provider = new AnchorProvider(
    connection,
    wallet as any,
    OPTIONS
  )
  const program = new Program(idl as any, provider)
  return { program, programId: program.programId as PublicKey, connection, provider }
}
