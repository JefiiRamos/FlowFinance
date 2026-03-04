'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { type Transaction, formatCurrency } from '@/lib/finance'
import { CATEGORIES } from '@/lib/constants'

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#eab308', '#8b5cf6', '#06b6d4', '#ec4899', '#6b7280']

interface ExpensesPieChartProps {
  transactions: Transaction[]
}

export function ExpensesPieChart({ transactions }: ExpensesPieChartProps) {
  const data = useMemo(() => {
    const byCategory: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      const cat = t.category ?? 'Outros'
      byCategory[cat] = (byCategory[cat] ?? 0) + t.amount
    }
    const order = CATEGORIES.map((c) => c.id)
    return order
      .filter((id) => (byCategory[id] ?? 0) > 0)
      .map((id, i) => ({
        name: id,
        value: byCategory[id] ?? 0,
        color: COLORS[i % COLORS.length],
      }))
  }, [transactions])

  if (data.length === 0) {
    return (
      <Card className="border-white/10 bg-black/30 backdrop-blur">
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Gastos por categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Nenhum gasto no periodo
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-white/10 bg-black/30 backdrop-blur">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Gastos por categoria</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value" nameKey="name">
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend formatter={(name) => name} wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
