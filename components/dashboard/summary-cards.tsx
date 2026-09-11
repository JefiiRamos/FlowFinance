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
      label: 'Saldo disponível',
      value: formatCurrency(balance),
      secondary: projectedBalance !== undefined ? `Projeção do mês ${formatCurrency(projectedBalance)}` : 'Posição atual',
      accent: 'bg-primary',
      featured: true,
    },
    {
      label: 'Receitas',
      value: formatCurrency(monthlyIncome),
      secondary: 'Entradas no período',
      accent: 'bg-[#22C55E]',
    },
    {
      label: 'Despesas',
      value: formatCurrency(monthlyExpenses),
      secondary: 'Saídas no período',
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={[
            'relative overflow-hidden rounded-2xl border border-white/8 bg-[#10131A] p-5',
            card.featured ? 'sm:col-span-2 xl:col-span-2 xl:p-6' : 'xl:col-span-1',
          ].join(' ')}
        >
          <div className={`absolute left-0 top-5 h-10 w-0.5 rounded-r-full ${card.accent}`} />

          <div className={card.featured ? 'space-y-4' : 'space-y-3'}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
              {card.label}
            </p>
            <p
              className={[
                'truncate font-semibold tracking-normal text-white',
                card.featured ? 'text-[clamp(2.2rem,4vw,4rem)]' : 'text-[clamp(1.65rem,2vw,2.25rem)]',
              ].join(' ')}
            >
              {card.value}
            </p>
            <p className="truncate text-sm font-medium text-[#A1A7B3]">
              {card.secondary}
            </p>
            {card.featured && (
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Referência principal do mês
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
