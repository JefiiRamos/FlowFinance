'use client'

import { formatCurrency } from '@/lib/finance'

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
      label: 'Saldo',
      value: formatCurrency(balance),
      secondary: projectedBalance !== undefined ? `Projecao ${formatCurrency(projectedBalance)}` : 'Posicao atual',
      accent: 'bg-primary',
    },
    {
      label: 'Receitas',
      value: formatCurrency(monthlyIncome),
      secondary: 'Entradas no periodo',
      accent: 'bg-[#22C55E]',
    },
    {
      label: 'Despesas',
      value: formatCurrency(monthlyExpenses),
      secondary: 'Saidas no periodo',
      accent: 'bg-[#EF4444]',
    },
    {
      label: 'Economia',
      value: formatCurrency(monthlySavings),
      secondary: `${Math.abs(savingsPercent).toFixed(1)}% ${savingsPercent >= 0 ? 'guardado' : 'acima'}`,
      accent: savingsPercent >= 0 ? 'bg-[#22C55E]' : 'bg-[#F59E0B]',
    },
  ]

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]"
        >
          <div className={`absolute left-0 top-5 h-10 w-0.5 rounded-r-full ${card.accent}`} />

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
              {card.label}
            </p>
            <p className="truncate text-[clamp(1.8rem,2vw,2.4rem)] font-semibold tracking-normal text-white">
              {card.value}
            </p>
            <p className="truncate text-sm font-medium text-[#A1A7B3]">
              {card.secondary}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
