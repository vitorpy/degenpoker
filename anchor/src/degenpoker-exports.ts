// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import DegenpokerIDL from '../target/idl/degenpoker.json'
import type { Degenpoker } from '../target/types/degenpoker'

// Re-export the generated IDL and type
export { Degenpoker, DegenpokerIDL }

// The programId is imported from the program IDL.
export const DEGENPOKER_PROGRAM_ID = new PublicKey(DegenpokerIDL.address)

// This is a helper function to get the Degenpoker Anchor program.
export function getDegenpokerProgram(provider: AnchorProvider) {
  return new Program(DegenpokerIDL as Degenpoker, provider)
}

// This is a helper function to get the program ID for the Degenpoker program depending on the cluster.
export function getDegenpokerProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Degenpoker program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return DEGENPOKER_PROGRAM_ID
  }
}
