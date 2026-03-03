import { getToken } from '@/lib/auth'

export type TransactionType = 'income' | 'expense'

export interface ApiTransaction {
  id: string
  type: TransactionType
  amount: number
  date: string
  description: string | null
  createdAt: string
}

export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  date: string
  description?: string
}

const BASE = '/api'

function authHeaders(): HeadersInit {
  const token = getToken()
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`
  return h
}

export async function fetchTransactions(): Promise<ApiTransaction[]> {
  const res = await fetch(`${BASE}/transactions`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erro ao carregar transações')
  return res.json()
}

export async function createTransaction(data: CreateTransactionInput): Promise<ApiTransaction> {
  const res = await fetch(`${BASE}/transactions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Erro ao criar transação')
  }
  return res.json()
}

export async function updateTransaction(
  id: string,
  data: Partial<CreateTransactionInput>
): Promise<ApiTransaction> {
  const res = await fetch(`${BASE}/transactions/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Erro ao atualizar transação')
  }
  return res.json()
}

export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`${BASE}/transactions/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Erro ao deletar transação')
  }
}
