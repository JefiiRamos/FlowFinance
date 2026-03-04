'use client'

import { useMemo, useState, useEffect } from 'react'
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
import { AlertTriangle } from 'lucide-react'

const STORAGE_KEY = 'flowfinance-budget-limits'

function loadLimits(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (!v) return {}
    const parsed = JSON.parse(v) as Record<string, number>
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function saveLimits(limits: Record<string, number>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limits))
  } catch {
    // ignore
  }
}

interface BudgetTableProps {
  transactions: Transaction[]
}

export function BudgetTable({ transactions }: BudgetTableProps) {
  const [limits, setLimits] = useState<Record<string, number>>({})
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    setLimits(loadLimits())
  }, [])

  useEffect(() => {
    saveLimits(limits)
  }, [limits])

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

  function setLimit(category: string, value: number) {
    setLimits((prev) => ({ ...prev, [category]: Math.max(0, value) }))
    setEditingCategory(null)
  }

  return (
    <Card className="border-white/10 bg-black/30 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Orçamento mensal</CardTitle>
        <p className="text-[10px] text-muted-foreground">
          {MONTH_NAMES[currentMonth - 1]} {currentYear} · Defina limites por categoria
        </p>
      </CardHeader>
      <CardContent>
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
              {
                rows.map((r) => (
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
                            onKeyDown={(e) => e.key === 'Enter' && setLimit(r.category, parseFloat(editValue) || 0)}
                          />
                          <Button size="sm" className="h-7 text-xs" onClick={() => setLimit(r.category, parseFloat(editValue) || 0)}>
                            Ok
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => { setEditingCategory(r.category); setEditValue(String(r.limit)) }}
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
                      {r.status === 'warning' && (
                        <span className="text-xs text-amber-400">Próximo do limite</span>
                      )}
                      {r.status === 'ok' && r.limit > 0 && (
                        <span className="text-xs text-emerald-400">Dentro do limite</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
