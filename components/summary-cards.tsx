'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MagicBento, type MagicBentoItem } from '@/components/magic-bento'
import { type FinancialSummary, formatCurrency } from '@/lib/finance'
import { AlertTriangle } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface SummaryCardsProps {
  summary: FinancialSummary
}

function SparklineArea({ data, dataKey, color }: { data: { value: number }[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${dataKey})`}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const hasNegativeMonths = summary.monthlyProjections.some(p => p.status === 'negative')
  const proj = summary.monthlyProjections

  const chartDataIncome = proj.map(p => ({ name: p.monthName, value: p.income }))
  const chartDataAccumulated = proj.map(p => ({ name: p.monthName, value: p.accumulatedBalance }))
  const chartDataSafe = proj.map(p => ({ name: p.monthName, value: summary.safeMonthlySpending }))
  const chartDataAvg = proj.map(p => ({ name: p.monthName, value: summary.monthlyAverage }))

  const bentoItems: MagicBentoItem[] = [
    {
      color: '#060010',
      title: formatCurrency(summary.totalAnnual),
      description: 'Soma projetada de todas as suas rendas ao longo do ano.',
      label: 'Total Anual Previsto',
      chart: (
        <SparklineArea data={chartDataIncome} dataKey="income" color="rgba(132, 0, 255, 0.9)" />
      ),
    },
    {
      color: '#060010',
      title: formatCurrency(summary.monthlyAverage),
      description: 'Média de renda considerando a variabilidade dos meses.',
      label: 'Média Mensal Real',
      chart: (
        <SparklineArea data={chartDataAvg} dataKey="avg" color="rgba(100, 200, 150, 0.9)" />
      ),
    },
    {
      color: '#060010',
      title: formatCurrency(summary.safeMonthlySpending),
      description: 'Valor recomendado para manter gastos mensais com folga.',
      label: 'Gasto Mensal Seguro',
      chart: (
        <SparklineArea data={chartDataSafe} dataKey="safe" color="rgba(255, 180, 50, 0.9)" />
      ),
    },
    {
      color: '#060010',
      title: formatCurrency(summary.annualSavings),
      description: 'Quanto você deve acumular em reservas ao final do ano.',
      label: 'Economia Anual',
      chart: (
        <SparklineArea data={chartDataAccumulated} dataKey="savings" color="rgba(80, 180, 255, 0.9)" />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <MagicBento
          items={bentoItems}
          textAutoHide
          enableStars
          enableSpotlight
          enableBorderGlow
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="132, 0, 255"
          disableAnimations={false}
        />
      </div>

      {hasNegativeMonths && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/15 p-2">
                <AlertTriangle className="size-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-destructive">Atencao: Meses com saldo negativo</p>
                <p className="text-xs text-muted-foreground">
                  Alguns meses possuem renda inferior ao gasto recomendado. A reserva acumulada dos meses positivos cobrira esses periodos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

