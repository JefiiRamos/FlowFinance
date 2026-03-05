'use client'

import { formatCurrency } from '@/lib/finance'
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react'

interface SummaryCardsProps {
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  savingsPercent: number
}

export function SummaryCards({
  balance,
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
  savingsPercent,
}: SummaryCardsProps) {
  const cards = [
    { label: 'Saldo total', value: balance, icon: PiggyBank, color: 'text-foreground', bg: 'from-primary/20 to-primary/5' },
    { label: 'Receitas do mes', value: monthlyIncome, icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5' },
    { label: 'Gastos do mes', value: monthlyExpenses, icon: TrendingDown, color: 'text-red-400', bg: 'from-red-500/20 to-red-500/5' },
    { label: 'Economia do mes', value: monthlySavings, icon: PiggyBank, color: monthlySavings >= 0 ? 'text-emerald-400' : 'text-red-400', bg: monthlySavings >= 0 ? 'from-emerald-500/20 to-emerald-500/5' : 'from-red-500/20 to-red-500/5' },
    { label: 'Taxa de economia', value: `${Math.abs(savingsPercent).toFixed(1)}%`, icon: Percent, color: savingsPercent >= 0 ? 'text-emerald-400' : 'text-red-400', bg: savingsPercent >= 0 ? 'from-emerald-500/20 to-emerald-500/5' : 'from-red-500/20 to-red-500/5' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.bg} p-4 backdrop-blur-sm`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <p className={`mt-1 text-xl font-bold ${card.color}`}>
                  {card.label === 'Taxa de economia' ? card.value : formatCurrency(card.value)}
                </p>
              </div>
              <div className={`rounded-xl bg-white/10 p-2 ${card.color}`}>
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
