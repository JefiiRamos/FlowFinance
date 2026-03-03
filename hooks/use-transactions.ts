'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type ApiTransaction,
  type CreateTransactionInput,
} from '@/lib/api/transactions'
import type { Transaction } from '@/lib/finance'

function toFrontend(t: ApiTransaction): Transaction {
  const d = new Date(t.date)
  return {
    id: t.id,
    type: t.type,
    description: t.description ?? '',
    amount: t.amount,
    date: d.toISOString().slice(0, 10),
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await fetch('/api/recurring/seed', { method: 'POST' }).catch(() => {})
      await fetch('/api/recurring/sync', { method: 'POST' }).catch(() => {})
      const data = await fetchTransactions()
      setTransactions(data.map(toFrontend))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addTransaction = useCallback(async (data: CreateTransactionInput) => {
    await createTransaction(data)
    await refetch()
  }, [refetch])

  const editTransaction = useCallback(async (id: string, data: Partial<CreateTransactionInput>) => {
    await updateTransaction(id, data)
    await refetch()
  }, [refetch])

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id)
    await refetch()
  }, [refetch])

  return {
    transactions,
    isLoading,
    error,
    refetch,
    addTransaction,
    editTransaction,
    removeTransaction,
  }
}
