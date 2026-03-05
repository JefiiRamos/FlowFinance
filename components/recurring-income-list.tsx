'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { formatCurrency, MONTH_NAMES_FULL } from '@/lib/finance'
import { TrendingUp, Plus, Loader2, Pencil, Trash2 } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { toast } from 'sonner'

interface RecurringIncomeRule {
  id: string
  description: string
  amount: number
  dayOfMonth: number
  startMonth: number
  endMonth: number
}

const MONTH_OPTIONS = MONTH_NAMES_FULL.map((name, index) => ({
  value: index + 1,
  label: name,
}))

export function RecurringIncomeList() {
  const [items, setItems] = useState<RecurringIncomeRule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('Salário')
  const [amount, setAmount] = useState('')
  const [day, setDay] = useState('5')
  const [startMonth, setStartMonth] = useState<string>(String(new Date().getMonth() + 1))
  const [endMonth, setEndMonth] = useState<string>('12')

  const fetchItems = useCallback(async () => {
    const token = getToken()
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch('/api/recurring', { headers })
    if (res.ok) {
      const data = await res.json()
      setItems(data)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  function resetForm() {
    setEditingId(null)
    setName('Salário')
    setAmount('')
    setDay('5')
    setStartMonth(String(new Date().getMonth() + 1))
    setEndMonth('12')
  }

  async function handleSubmit() {
    const desc = name.trim()
    const value = parseFloat(amount.replace(',', '.'))
    const dayNum = parseInt(day, 10)
    const start = parseInt(startMonth, 10)
    const end = parseInt(endMonth, 10)

    if (!desc || isNaN(value) || value <= 0 || isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      toast.error('Preencha descrição, valor e dia (1-31)')
      return
    }
    if (isNaN(start) || isNaN(end) || start < 1 || start > 12 || end < 1 || end > 12) {
      toast.error('Selecione meses válidos')
      return
    }

    const token = getToken()
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`

    const payload = {
      description: desc,
      amount: value,
      dayOfMonth: dayNum,
      startMonth: start,
      endMonth: end,
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/recurring/${editingId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Erro ao atualizar')
        toast.success('Renda recorrente atualizada')
      } else {
        const res = await fetch('/api/recurring', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Erro ao adicionar')
        toast.success('Renda recorrente adicionada')
      }
      resetForm()
      await fetchItems()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  async function handleDelete(id: string) {
    try {
      const token = getToken()
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`/api/recurring/${id}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error('Erro ao remover')
      toast.success('Renda recorrente removida')
      if (editingId === id) resetForm()
      await fetchItems()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover')
    }
  }

  function startEdit(item: RecurringIncomeRule) {
    setEditingId(item.id)
    setName(item.description)
    setAmount(String(item.amount))
    setDay(String(item.dayOfMonth))
    setStartMonth(String(item.startMonth))
    setEndMonth(String(item.endMonth))
  }

  return (
    <Card className="border-white/10 bg-black/30 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="size-4 text-emerald-400" />
          Rendas recorrentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Formulário */}
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-white/10 bg-black/20 p-3">
          <Input
            placeholder="Descrição (ex: Salário)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-[130px] bg-white/5 text-xs"
          />
          <Input
            type="number"
            placeholder="Valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-8 w-[90px] bg-white/5 text-xs"
            min="0"
            step="0.01"
          />
          <Input
            type="number"
            placeholder="Dia"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="h-8 w-[60px] bg-white/5 text-xs"
            min="1"
            max="31"
          />
          <Select value={startMonth} onValueChange={setStartMonth}>
            <SelectTrigger className="h-8 w-[120px] bg-white/5 text-xs">
              <SelectValue placeholder="Início" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  De {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={endMonth} onValueChange={setEndMonth}>
            <SelectTrigger className="h-8 w-[120px] bg-white/5 text-xs">
              <SelectValue placeholder="Fim" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  Até {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8" onClick={() => void handleSubmit()}>
            {editingId ? 'Salvar' : 'Adicionar'}
          </Button>
          {editingId && (
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={resetForm}
            >
              Cancelar edição
            </Button>
          )}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma renda recorrente. Cadastre salário, bolsa, comissões fixas, etc.
          </p>
        ) : (
          <div className="max-h-[220px] space-y-2 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Dia {item.dayOfMonth} · {MONTH_NAMES_FULL[item.startMonth - 1]} até{' '}
                    {MONTH_NAMES_FULL[item.endMonth - 1]}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(item.amount)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => startEdit(item)}
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => void handleDelete(item.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

