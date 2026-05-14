'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type Transaction, formatCurrency, MONTH_NAMES } from '@/lib/finance'
import { CATEGORIES } from '@/lib/constants'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { toast } from 'sonner'

function authHeaders(): HeadersInit {
  const token = getToken()
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`
  return h
}

interface BudgetTableProps {
  transactions: Transaction[]
}

export function BudgetTable({ transactions }: BudgetTableProps) {
  const [limits, setLimits] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const fetchLimits = useCallback(async () => {
    const res = await fetch('/api/budget-limits', { headers: authHeaders() })
    if (!res.ok) {
      setLimits({})
      return
    }
    const data = (await res.json()) as Record<string, number>
    setLimits(typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {})
  }, [])

  useEffect(() => {
    setLoading(true)
    void fetchLimits().finally(() => setLoading(false))
  }, [fetchLimits])

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const byCategory = useMemo(() => {
    const spent: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      const d = new Date(t.date)
      if (d.getFullYear() !== currentYear || d.getMonth() + 1 !== currentMonth) continue
      const cat = t.category ?? 'Outros'
      spent[cat] = (spent[cat] ?? 0) + t.amount
    }
    return spent
  }, [transactions, currentYear, currentMonth])

  const rows = useMemo(() => {
    return CATEGORIES.map((c) => {
      const limit = limits[c.id] ?? 0
      const spent = byCategory[c.id] ?? 0
      const status = limit <= 0 ? 'neutral' : spent > limit ? 'over' : spent >= limit * 0.9 ? 'warning' : 'ok'
      return { category: c.id, limit, spent, status }
    })
  }, [limits, byCategory])

  async function setLimit(category: string, value: number) {
    const v = Math.max(0, value)
    const next: Record<string, number> = { ...limits }
    if (v <= 0) delete next[category]
    else next[category] = v

    const res = await fetch('/api/budget-limits', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ limits: next }),
    })
    if (!res.ok) {
      toast.error('Não foi possível salvar o limite')
      return
    }
    setLimits(next)
    setEditingCategory(null)
  }

  return (
    <Card className="border-white/10 bg-black/30 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Orçamento mensal</CardTitle>
        <p className="text-[10px] text-muted-foreground">
          {MONTH_NAMES[currentMonth - 1]} {currentYear} · Defina limites por categoria (salvo na conta)
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Categoria</TableHead>
                  <TableHead className="text-muted-foreground">Limite</TableHead>
                  <TableHead className="text-muted-foreground">Gasto atual</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.category} className="border-white/10">
                    <TableCell className="font-medium text-foreground text-xs">{r.category}</TableCell>
                    <TableCell>
                      {editingCategory === r.category ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-7 w-24 text-xs"
                            min="0"
                            step="50"
                            onKeyDown={(e) =>
                              e.key === 'Enter' && void setLimit(r.category, parseFloat(editValue) || 0)
                            }
                          />
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => void setLimit(r.category, parseFloat(editValue) || 0)}
                          >
                            Ok
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditingCategory(r.category)
                            setEditValue(String(r.limit))
                          }}
                        >
                          {r.limit > 0 ? formatCurrency(r.limit) : 'Definir'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{formatCurrency(r.spent)}</TableCell>
                    <TableCell>
                      {r.status === 'over' && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400">
                          <AlertTriangle className="size-3.5" />
                          Acima do limite
                        </span>
                      )}
                      {r.status === 'warning' && <span className="text-xs text-amber-400">Próximo do limite</span>}
                      {r.status === 'ok' && r.limit > 0 && (
                        <span className="text-xs text-emerald-400">Dentro do limite</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
