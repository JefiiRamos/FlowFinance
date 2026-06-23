'use client'

import { useMemo, useEffect, useState, useCallback } from 'react'
import { formatCurrency } from '@/lib/finance'
import {
  getTopSpendingCategory,
  getAverageMonthlyExpenses,
  type Transaction,
} from '@/lib/finance'
import { getToken } from '@/lib/auth'
import { AlertTriangle, Brain, Sparkles } from 'lucide-react'

interface FinancialIntelligenceProps {
  transactions: Transaction[]
  monthlyExpenses: number
  monthlyIncome: number
  balance: number
  projectedBalance?: number
}

interface AIInsights {
  projecao: string
  recomendacao: string
  risco: string | null
  dica: string
}

export function FinancialIntelligence({
  transactions,
  monthlyExpenses,
  monthlyIncome,
  balance,
  projectedBalance,
}: FinancialIntelligenceProps) {
  const topCategory = useMemo(() => getTopSpendingCategory(transactions), [transactions])
  const avgMonthly = useMemo(() => getAverageMonthlyExpenses(transactions), [transactions])
  const overspending = useMemo(() => {
    if (monthlyIncome <= 0) return null
    const ratio = monthlyExpenses / monthlyIncome
    if (ratio > 0.9) return { level: 'high' as const, msg: 'Gastos muito altos em relacao a receita' }
    if (ratio > 0.7) return { level: 'medium' as const, msg: 'Atencao: gastos proximos do limite' }
    return null
  }, [monthlyExpenses, monthlyIncome])
  const forecast = useMemo(() => {
    if (monthlyIncome <= 0) return null
    const savings = monthlyIncome - monthlyExpenses
    const trend = savings > 0 ? 'positiva' : 'negativa'
    const suggestion = savings > 0
      ? 'Mantenha o ritmo de economia'
      : 'Considere reduzir gastos em categorias nao essenciais'
    return { trend, suggestion }
  }, [monthlyIncome, monthlyExpenses])

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Brain className="size-4 text-cyan-400" />
        Inteligencia financeira
      </h3>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-1">
        {topCategory && (
          <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 backdrop-blur-sm duration-300">
            <p className="text-xs text-muted-foreground">Categoria que mais consome</p>
            <p className="mt-1 font-semibold text-cyan-400">{topCategory.category}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(topCategory.amount)}</p>
          </div>
        )}
        <div className="animate-in fade-in slide-in-from-bottom-2 w-full rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 backdrop-blur-sm duration-300 delay-75">
          <p className="text-xs text-muted-foreground">Media de gastos mensal</p>
          <p className="mt-1 font-semibold text-violet-400">{formatCurrency(avgMonthly)}</p>
        </div>
        {overspending && (
          <div className={`animate-in fade-in slide-in-from-bottom-2 rounded-xl border p-4 backdrop-blur-sm duration-300 delay-150 ${
            overspending.level === 'high'
              ? 'border-red-500/30 bg-red-500/10'
              : 'border-amber-500/30 bg-amber-500/10'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`size-4 ${overspending.level === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
              <p className="text-xs font-medium">Alerta</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{overspending.msg}</p>
          </div>
        )}
        {forecast && (
          <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-sm duration-300 delay-200">
            <p className="text-xs text-muted-foreground">Previsao</p>
            <p className={`mt-1 font-semibold ${forecast.trend === 'positiva' ? 'text-emerald-400' : 'text-amber-400'}`}>
              Tendencia {forecast.trend}
            </p>
            <p className="text-xs text-muted-foreground">{forecast.suggestion}</p>
          </div>
        )}
      </div>
    </div>
  )
}
