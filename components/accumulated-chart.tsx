'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { type FinancialSummary, formatCurrency } from '@/lib/finance'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface AccumulatedChartProps {
  summary: FinancialSummary
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.[0]) return null
  const value = payload[0].value
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        Saldo Acumulado:{' '}
        <span className={`font-medium ${value >= 0 ? 'text-success' : 'text-destructive'}`}>
          {formatCurrency(value)}
        </span>
      </p>
    </div>
  )
}

export function AccumulatedChart({ summary }: AccumulatedChartProps) {
  const data = summary.monthlyProjections.map((p) => ({
    name: p.monthName,
    accumulated: p.accumulatedBalance,
  }))

  const hasNegative = data.some((d) => d.accumulated < 0)

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-base">Evolucao financeira</CardTitle>
        <CardDescription>Saldo acumulado por mes ao longo do ano</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
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
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {hasNegative && (
                <ReferenceLine y={0} stroke="oklch(0.55 0.2 25)" strokeDasharray="4 4" />
              )}
              {summary.reserveGoal > 0 && (
                <ReferenceLine
                  y={summary.reserveGoal}
                  stroke="oklch(0.65 0.15 160)"
                  strokeDasharray="6 4"
                  label={{
                    value: 'Meta',
                    position: 'right',
                    fill: 'oklch(0.65 0.15 160)',
                    fontSize: 11,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="accumulated"
                stroke="oklch(0.55 0.18 270)"
                strokeWidth={2.5}
                fill="url(#accGradient)"
                dot={{ r: 4, fill: 'oklch(0.55 0.18 270)', stroke: 'oklch(0.17 0.02 270)', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
