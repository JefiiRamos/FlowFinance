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

export async function fetchTransactions(): Promise<ApiTransaction[]> {
  const res = await fetch(`${BASE}/transactions`)
  if (!res.ok) throw new Error('Erro ao carregar transações')
  return res.json()
}

export async function createTransaction(data: CreateTransactionInput): Promise<ApiTransaction> {
  const res = await fetch(`${BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Erro ao atualizar transação')
  }
  return res.json()
}

export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`${BASE}/transactions/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Erro ao deletar transação')
  }
}
