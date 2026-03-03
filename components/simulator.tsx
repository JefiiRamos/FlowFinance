'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/finance'
import { SlidersHorizontal, Percent, Target } from 'lucide-react'

interface SimulatorProps {
  safetyMargin: number
  onSafetyMarginChange: (value: number) => void
  reserveGoal: number
  onReserveGoalChange: (value: number) => void
  monthlyAverage: number
  safeMonthlySpending: number
  annualSavings: number
}

export function Simulator({
  safetyMargin,
  onSafetyMarginChange,
  reserveGoal,
  onReserveGoalChange,
  monthlyAverage,
  safeMonthlySpending,
  annualSavings,
}: SimulatorProps) {
  const marginPercent = Math.round(safetyMargin * 100)
  const monthsToReserve = reserveGoal > 0 && annualSavings > 0
    ? Math.ceil(reserveGoal / (annualSavings / 12))
    : reserveGoal > 0 ? Infinity : 0

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-1.5">
            <SlidersHorizontal className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Simulador Financeiro</CardTitle>
            <CardDescription>Ajuste parametros e veja o impacto em tempo real</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Safety Margin Slider */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="size-3.5 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Margem de Seguranca</label>
              </div>
              <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                {marginPercent}%
              </span>
            </div>
            <Slider
              value={[marginPercent]}
              onValueChange={([v]) => onSafetyMarginChange(v / 100)}
              min={50}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>50% (Conservador)</span>
              <span>100% (Sem margem)</span>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Gasto mensal seguro</p>
                <p className="mt-1 text-sm font-semibold text-success">{formatCurrency(safeMonthlySpending)}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Economia mensal</p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {formatCurrency(monthlyAverage - safeMonthlySpending)}
                </p>
              </div>
            </div>
          </div>

          {/* Reserve Goal */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Target className="size-3.5 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Meta de Reserva (R$)</label>
            </div>
            <Input
              type="number"
              value={reserveGoal || ''}
              onChange={(e) => onReserveGoalChange(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 20000"
              min="0"
              step="1000"
            />
            {reserveGoal > 0 && (
              <div className="rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Tempo estimado para meta</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {monthsToReserve === Infinity
                    ? 'Impossivel com margem atual'
                    : `${monthsToReserve} ${monthsToReserve === 1 ? 'mes' : 'meses'}`}
                </p>
                {monthsToReserve !== Infinity && (
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{
                          width: `${Math.min((annualSavings / reserveGoal) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Progresso anual: {formatCurrency(annualSavings)} de {formatCurrency(reserveGoal)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
