'use client'

import { type FinancialSummary, formatCurrency } from '@/lib/finance'

interface CashFlowCardsProps {
  summary: FinancialSummary
}

export function CashFlowCards({ summary }: CashFlowCardsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Fluxo por Mês</h3>
      <div className="flex flex-wrap gap-2">
        {summary.monthlyProjections.map((p) => {
          const isPositive = p.balance >= 0
          return (
            <div
              key={p.month}
              className={`rounded-lg px-2 py-1.5 text-xs font-medium ${
                isPositive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {p.monthName}: {isPositive ? '+' : ''}{formatCurrency(p.balance)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
