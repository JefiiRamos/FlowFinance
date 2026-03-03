'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { type FinancialSummary, formatCurrency } from '@/lib/finance'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface IncomeChartProps {
  summary: FinancialSummary
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs text-muted-foreground">
          {p.dataKey === 'income' ? 'Renda' : 'Gasto Seguro'}:{' '}
          <span className="font-medium text-foreground">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function IncomeChart({ summary }: IncomeChartProps) {
  const data = summary.monthlyProjections.map((p) => ({
    name: p.monthName,
    income: p.income,
    recommended: p.recommendedSpending,
  }))

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-base">Renda Mensal Projetada</CardTitle>
        <CardDescription>Comparacao entre renda e gasto seguro mensal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 270)" />
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
              <ReferenceLine
                y={summary.monthlyAverage}
                stroke="oklch(0.65 0.15 160)"
                strokeDasharray="6 4"
                label={{
                  value: 'Media',
                  position: 'right',
                  fill: 'oklch(0.65 0.15 160)',
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="oklch(0.55 0.18 270)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'oklch(0.55 0.18 270)', stroke: 'oklch(0.17 0.02 270)', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'oklch(0.55 0.18 270)', stroke: 'oklch(0.98 0.005 270)', strokeWidth: 2 }}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Line
                type="monotone"
                dataKey="recommended"
                stroke="oklch(0.65 0.18 155)"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Renda</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-5 rounded-full bg-success" style={{ background: 'oklch(0.65 0.18 155)' }} />
            <span className="text-xs text-muted-foreground">Gasto Seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-5 rounded-full" style={{ background: 'oklch(0.65 0.15 160)', borderStyle: 'dashed' }} />
            <span className="text-xs text-muted-foreground">Media</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
