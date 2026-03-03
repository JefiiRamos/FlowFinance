'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type FinancialSummary } from '@/lib/finance'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface IncomeChartCompactProps {
  summary: FinancialSummary
}

export function IncomeChartCompact({ summary }: IncomeChartCompactProps) {
  const data = summary.monthlyProjections.map((p) => ({
    name: p.monthName,
    income: p.income,
    recommended: p.recommendedSpending,
  }))

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Projeção de Renda</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
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
              <Line
                type="monotone"
                dataKey="income"
                stroke="oklch(0.55 0.18 270)"
                strokeWidth={2}
                dot={{ r: 2, fill: 'oklch(0.55 0.18 270)' }}
                animationDuration={800}
              />
              <Line
                type="monotone"
                dataKey="recommended"
                stroke="oklch(0.65 0.18 155)"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
