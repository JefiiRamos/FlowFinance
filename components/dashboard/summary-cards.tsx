'use client'

import { formatCurrency } from '@/lib/finance'
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  TrendingUpDown,
} from 'lucide-react'

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
  const cards = [
    {
      label: 'Saldo Total',
      value: balance,
      icon: PiggyBank,
      accent: 'bg-violet-500/15 text-violet-400',
    },
    {
      label: 'Receitas',
      value: monthlyIncome,
      icon: TrendingUp,
      accent: 'bg-emerald-500/15 text-emerald-400',
    },
    {
      label: 'Despesas',
      value: monthlyExpenses,
      icon: TrendingDown,
      accent: 'bg-red-500/15 text-red-400',
    },
    {
      label: 'Economia',
      value: `${Math.abs(savingsPercent).toFixed(1)}%`,
      icon: Percent,
      accent:
        savingsPercent >= 0
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-red-500/15 text-red-400',
    },
  ]

  if (projectedBalance !== undefined) {
    cards.push({
      label: 'Projeção',
      value: projectedBalance,
      icon: TrendingUpDown,
      accent: 'bg-cyan-500/15 text-cyan-400',
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon

        const isPercent = card.label === 'Economia'

        return (
          <div
            key={card.label}
            className="
              group
              rounded-3xl
              border
              border-white/5
              bg-[#111827]
              p-5
              transition-all
              duration-300
              hover:border-violet-500/20
              hover:bg-[#151d2b]
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {card.label}
                </p>

                <h3 className="mt-3 text-3xl font-bold text-white">
                  {isPercent
                    ? card.value
                    : formatCurrency(card.value as number)}
                </h3>
              </div>

              <div
                className={`
                  rounded-2xl
                  p-3
                  ${card.accent}
                `}
              >
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}