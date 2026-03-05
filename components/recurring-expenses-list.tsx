'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/finance'
import { Repeat, Plus, Loader2 } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { toast } from 'sonner'

interface RecurringExpense {
  id: string
  name: string
  amount: number
  dueDay: number
}

export function RecurringExpensesList() {
  const [items, setItems] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newDay, setNewDay] = useState('5')

  const fetchItems = useCallback(async () => {
    const token = getToken()
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    const res = await fetch('/api/recurring-expenses', { headers })
    if (res.ok) {
      const data = await res.json()
      setItems(data)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  async function handleAdd() {
    const name = newName.trim()
    const amount = parseFloat(newAmount.replace(',', '.'))
    const day = parseInt(newDay, 10)
    if (!name || isNaN(amount) || amount <= 0 || isNaN(day) || day < 1 || day > 31) {
      toast.error('Preencha nome, valor e dia (1-31)')
      return
    }
    const token = getToken()
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    const res = await fetch('/api/recurring-expenses', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, amount, dayOfMonth: day }),
    })
    if (!res.ok) {
      toast.error('Erro ao adicionar')
      return
    }
    setNewName('')
    setNewAmount('')
    setNewDay('5')
    setAdding(false)
    await fetchItems()
    toast.success('Despesa recorrente adicionada')
  }

  const currentDay = new Date().getDate()
  const currentMonth = new Date().getMonth() + 1

  return (
    <Card className="border-white/10 bg-black/30 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Repeat className="size-4 text-primary" />
          Despesas recorrentes
        </CardTitle>
        {!adding && (
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" />
            Conta
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-white/10 bg-black/20 p-3">
            <Input
              placeholder="Nome (ex: Aluguel)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-8 w-[120px] bg-white/5 text-xs"
            />
            <Input
              type="number"
              placeholder="Valor"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="h-8 w-[90px] bg-white/5 text-xs"
              min="0"
              step="0.01"
            />
            <Input
              type="number"
              placeholder="Dia venc."
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className="h-8 w-[70px] bg-white/5 text-xs"
              min="1"
              max="31"
            />
            <Button size="sm" className="h-8" onClick={() => void handleAdd()}>
              Adicionar
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 && !adding ? (
          <p className="text-xs text-muted-foreground">Nenhuma conta fixa. Adicione aluguel, luz, etc.</p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {items.map((item) => {
              const isOverdue = item.dueDay < currentDay
              const status = isOverdue ? 'Pendente' : 'A vencer'
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Vencimento: dia {item.dueDay} · {status}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-red-400">{formatCurrency(item.amount)}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
