'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { type FinancialSummary, formatCurrency, MONTH_NAMES_FULL } from '@/lib/finance'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface CashflowTableProps {
  summary: FinancialSummary
}

export function CashflowTable({ summary }: CashflowTableProps) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-base">Fluxo de Caixa Mensal</CardTitle>
        <CardDescription>Projecao detalhada mes a mes com saldo acumulado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Mes</th>
                <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Renda</th>
                <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Gasto</th>
                <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Saldo</th>
                <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {summary.monthlyProjections.map((p) => (
                <tr
                  key={p.month}
                  className="border-b border-border/30 transition-colors duration-150 hover:bg-secondary/20"
                >
                  <td className="py-3 font-medium text-foreground">{MONTH_NAMES_FULL[p.month - 1]}</td>
                  <td className="py-3 text-right font-mono text-foreground">{formatCurrency(p.income)}</td>
                  <td className="py-3 text-right font-mono text-muted-foreground">
                    {formatCurrency(p.recommendedSpending)}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 font-mono font-medium',
                        p.status === 'positive' && 'text-success',
                        p.status === 'negative' && 'text-destructive',
                        p.status === 'neutral' && 'text-muted-foreground',
                      )}
                    >
                      {p.status === 'positive' && <ArrowUpRight className="size-3.5" />}
                      {p.status === 'negative' && <ArrowDownRight className="size-3.5" />}
                      {p.status === 'neutral' && <Minus className="size-3.5" />}
                      {formatCurrency(p.balance)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={cn(
                        'font-mono font-medium',
                        p.accumulatedBalance >= 0 ? 'text-success' : 'text-destructive',
                      )}
                    >
                      {formatCurrency(p.accumulatedBalance)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
