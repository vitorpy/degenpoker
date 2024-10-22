import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Degenpoker} from '../target/types/degenpoker'

describe('degenpoker', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Degenpoker as Program<Degenpoker>

  const degenpokerKeypair = Keypair.generate()

  it('Initialize Degenpoker', async () => {
    await program.methods
      .initialize()
      .accounts({
        degenpoker: degenpokerKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([degenpokerKeypair])
      .rpc()

    const currentCount = await program.account.degenpoker.fetch(degenpokerKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Degenpoker', async () => {
    await program.methods.increment().accounts({ degenpoker: degenpokerKeypair.publicKey }).rpc()

    const currentCount = await program.account.degenpoker.fetch(degenpokerKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Degenpoker Again', async () => {
    await program.methods.increment().accounts({ degenpoker: degenpokerKeypair.publicKey }).rpc()

    const currentCount = await program.account.degenpoker.fetch(degenpokerKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Degenpoker', async () => {
    await program.methods.decrement().accounts({ degenpoker: degenpokerKeypair.publicKey }).rpc()

    const currentCount = await program.account.degenpoker.fetch(degenpokerKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set degenpoker value', async () => {
    await program.methods.set(42).accounts({ degenpoker: degenpokerKeypair.publicKey }).rpc()

    const currentCount = await program.account.degenpoker.fetch(degenpokerKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the degenpoker account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        degenpoker: degenpokerKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.degenpoker.fetchNullable(degenpokerKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
