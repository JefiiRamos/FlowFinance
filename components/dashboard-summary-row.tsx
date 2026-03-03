'use client'

import { formatCurrency } from '@/lib/finance'

interface DashboardSummaryRowProps {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export function DashboardSummaryRow({ totalIncome, totalExpenses, balance }: DashboardSummaryRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
          <p className="text-[10px] text-muted-foreground">Total Recebido</p>
          <p className="text-sm font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
          <p className="text-[10px] text-muted-foreground">Total Gasto</p>
          <p className="text-sm font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
          <p className="text-[10px] text-muted-foreground">Saldo Atual</p>
          <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
          <p className="text-[10px] text-muted-foreground">Status</p>
          <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {balance >= 0 ? 'Ok' : 'Negativo'}
          </p>
        </div>
      </div>
    </div>
  )
}
