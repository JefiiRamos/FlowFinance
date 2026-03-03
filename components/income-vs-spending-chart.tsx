'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type FinancialSummary } from '@/lib/finance'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'

interface IncomeVsSpendingChartProps {
  summary: FinancialSummary
}

export function IncomeVsSpendingChart({ summary }: IncomeVsSpendingChartProps) {
  const data = summary.monthlyProjections.map((p) => ({
    name: p.monthName,
    Renda: p.income,
    Gastos: p.recommendedSpending,
  }))

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Renda vs. Gastos</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 270)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'oklch(0.65 0.03 270)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'oklch(0.65 0.03 270)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={28}
              />
              <Bar dataKey="Renda" fill="oklch(0.65 0.18 155)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Gastos" fill="oklch(0.65 0.2 25)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-3 rounded-sm bg-emerald-500/80" />
            <span className="text-[10px] text-muted-foreground">Renda</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-3 rounded-sm bg-red-400/80" />
            <span className="text-[10px] text-muted-foreground">Gastos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
