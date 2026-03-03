'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { type FinancialSummary, formatCurrency } from '@/lib/finance'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ComparisonChartProps {
  summary: FinancialSummary
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs text-muted-foreground">
          {p.dataKey === 'income' ? 'Renda' : 'Gasto Recomendado'}:{' '}
          <span className="font-medium text-foreground">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function ComparisonChart({ summary }: ComparisonChartProps) {
  const data = summary.monthlyProjections.map((p) => ({
    name: p.monthName,
    income: p.income,
    spending: p.recommendedSpending,
    status: p.status,
  }))

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-base">Renda vs Gasto Recomendado</CardTitle>
        <CardDescription>Comparativo mensal entre receita e despesa planejada</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 270)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'oklch(0.65 0.03 270)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.25 0.03 270)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'oklch(0.65 0.03 270)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.25 0.03 270)' }}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {data.map((entry, index) => (
                  <Cell
                    key={`income-${index}`}
                    fill={entry.status === 'positive' ? 'oklch(0.55 0.18 270)' : 'oklch(0.55 0.2 25)'}
                    opacity={0.85}
                  />
                ))}
              </Bar>
              <Bar dataKey="spending" fill="oklch(0.65 0.18 155)" radius={[6, 6, 0, 0]} opacity={0.5} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm bg-primary" />
            <span className="text-xs text-muted-foreground">Renda</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm opacity-50" style={{ background: 'oklch(0.65 0.18 155)' }} />
            <span className="text-xs text-muted-foreground">Gasto Recomendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm bg-destructive" />
            <span className="text-xs text-muted-foreground">Mes Deficitario</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
