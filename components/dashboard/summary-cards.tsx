'use client'

import { formatCurrency } from '@/lib/finance'
import { TrendingUp, TrendingDown, PiggyBank, Percent, TrendingUpDown } from 'lucide-react'

interface SummaryCardsProps {
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  savingsPercent: number
  projectedBalance?: number
}

export function SummaryCards({
  balance,
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
  savingsPercent,
  projectedBalance,
}: SummaryCardsProps) {
  const cards: { label: string; value: string | number; icon: typeof PiggyBank; color: string; bg: string; glow: string }[] = [
    { label: 'Saldo total', value: balance, icon: PiggyBank, color: 'text-foreground', bg: 'from-violet-500/20 via-fuchsia-500/10 to-cyan-500/20', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]' },
    { label: 'Receitas do mes', value: monthlyIncome, icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', glow: '' },
    { label: 'Gastos do mes', value: monthlyExpenses, icon: TrendingDown, color: 'text-red-400', bg: 'from-red-500/20 to-red-500/5', glow: '' },
    { label: 'Economia', value: `${Math.abs(savingsPercent).toFixed(1)}%`, icon: Percent, color: savingsPercent >= 0 ? 'text-emerald-400' : 'text-red-400', bg: savingsPercent >= 0 ? 'from-emerald-500/20 to-emerald-500/5' : 'from-red-500/20 to-red-500/5', glow: '' },
  ]
  if (projectedBalance !== undefined) {
    cards.push({ label: 'Projecao fim do mes', value: projectedBalance, icon: TrendingUpDown, color: projectedBalance >= 0 ? 'text-cyan-400' : 'text-amber-400', bg: 'from-cyan-500/20 to-violet-500/20', glow: '' })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, i) => {
        const Icon = card.icon
        const isPercent = card.label === 'Economia'
        return (
          <div
            key={card.label}
            className={`animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-white/10 bg-gradient-to-br ${card.bg} p-4 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 ${card.glow}`}
            style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <p className={`mt-1 text-xl font-bold ${card.color}`}>
                  {isPercent ? card.value : formatCurrency(card.value as number)}
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
