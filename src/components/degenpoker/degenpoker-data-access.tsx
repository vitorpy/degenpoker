'use client'

import {getDegenpokerProgram, getDegenpokerProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useDegenpokerProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getDegenpokerProgramId(cluster.network as Cluster), [cluster])
  const program = getDegenpokerProgram(provider)

  const accounts = useQuery({
    queryKey: ['degenpoker', 'all', { cluster }],
    queryFn: () => program.account.degenpoker.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['degenpoker', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ degenpoker: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useDegenpokerProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useDegenpokerProgram()

  const accountQuery = useQuery({
    queryKey: ['degenpoker', 'fetch', { cluster, account }],
    queryFn: () => program.account.degenpoker.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['degenpoker', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ degenpoker: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['degenpoker', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ degenpoker: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['degenpoker', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ degenpoker: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['degenpoker', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ degenpoker: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
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
