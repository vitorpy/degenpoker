'use client'

import {getDegenpokerProgram, getDegenpokerProgramId} from '@project/anchor'
import {useConnection, useWallet} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey, Transaction, Connection, Commitment} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useDegenpokerProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const { publicKey, sendTransaction } = useWallet()
  const programId = useMemo(() => getDegenpokerProgramId(cluster.network as Cluster), [cluster])
  const program = getDegenpokerProgram(provider)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [transactionSuccess, setTransactionSuccess] = useState<string | null>(null)
  const tempKeypair = useRef<Keypair | null>(null)

  const accounts = useQuery({
    queryKey: ['degenpoker', 'all', { cluster }],
    queryFn: () => program.account.counter.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['degenpoker', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accountsPartial({ counter: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  const submitTransaction = useCallback(async (transaction: Transaction, useTempKeypair: boolean = false, ephemeral: boolean = false, confirmCommitment: Commitment = 'processed'): Promise<string | null> => {
    if (!tempKeypair.current || !publicKey) return null
    setIsSubmitting(true)
    setTransactionError(null)
    setTransactionSuccess(null)
    
    try {
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await connection.getLatestBlockhashAndContext()

      if (!transaction.recentBlockhash) transaction.recentBlockhash = blockhash
      if (!transaction.feePayer) transaction.feePayer = useTempKeypair ? tempKeypair.current.publicKey : publicKey
      if (useTempKeypair) transaction.sign(tempKeypair.current)

      let signature
      if (!ephemeral && !useTempKeypair) {
        signature = await sendTransaction(transaction, connection, { minContextSlot })
      } else {
        signature = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: true })
      }

      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, confirmCommitment)
      console.log(`Transaction confirmed: ${signature}`)
      setTransactionSuccess('Transaction confirmed')
      return signature
    } catch (error) {
      setTransactionError(`Transaction failed: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
    return null
  }, [publicKey, sendTransaction, connection])

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
    submitTransaction,
    isSubmitting,
    transactionError,
    transactionSuccess,
  }
}

export function useDegenpokerProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts, submitTransaction } = useDegenpokerProgram()

  const accountQuery = useQuery({
    queryKey: ['degenpoker', 'fetch', { cluster, account }],
    queryFn: () => program.account.counter.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['degenpoker', 'close', { cluster, account }],
    mutationFn: async () => {
      const transaction = await program.methods.close().accountsPartial({ counter: account }).transaction()
      return submitTransaction(transaction)
    },
    onSuccess: (tx) => {
      if (tx) {
        transactionToast(tx)
        return accounts.refetch()
      }
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['degenpoker', 'decrement', { cluster, account }],
    mutationFn: async () => {
      const transaction = await program.methods.decrement().accountsPartial({ counter: account }).transaction()
      return submitTransaction(transaction)
    },
    onSuccess: (tx) => {
      if (tx) {
        transactionToast(tx)
        return accountQuery.refetch()
      }
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['degenpoker', 'increment', { cluster, account }],
    mutationFn: async () => {
      const transaction = await program.methods.increment().accountsPartial({ counter: account }).transaction()
      return submitTransaction(transaction)
    },
    onSuccess: (tx) => {
      if (tx) {
        transactionToast(tx)
        return accountQuery.refetch()
      }
    },
  })

  const setMutation = useMutation({
    mutationKey: ['degenpoker', 'set', { cluster, account }],
    mutationFn: async (value: number) => {
      const transaction = await program.methods.set(value).accountsPartial({ counter: account }).transaction()
      return submitTransaction(transaction)
    },
    onSuccess: (tx) => {
      if (tx) {
        transactionToast(tx)
        return accountQuery.refetch()
      }
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
