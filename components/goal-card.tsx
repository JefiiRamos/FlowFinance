'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/finance'
import { Target, Pencil, Check } from 'lucide-react'

const STORAGE_KEY = 'flowfinance-goal'

function loadGoal(): number {
  if (typeof window === 'undefined') return 0
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v ? parseFloat(v) : 0
  } catch {
    return 0
  }
}

function saveGoal(value: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // ignore
  }
}

interface GoalCardProps {
  balance: number
  monthlySurplus?: number // média de economia mensal (receita - despesa)
}

export function GoalCard({ balance, monthlySurplus = 0 }: GoalCardProps) {
  const [goal, setGoal] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    setGoal(loadGoal())
  }, [])

  function handleSave() {
    const cleaned = inputValue.replace(/[^\d,.]/g, '').replace(',', '.')
    const value = parseFloat(cleaned) || 0
    if (value > 0) {
      setGoal(value)
      saveGoal(value)
    }
    setIsEditing(false)
    setInputValue('')
  }

  function startEdit() {
    setInputValue(goal > 0 ? goal.toString() : '')
    setIsEditing(true)
  }

  const progress = goal > 0 ? Math.min(100, (balance / goal) * 100) : 0
  const remaining = goal > 0 ? Math.max(0, goal - balance) : 0
  const monthsToGoal =
    monthlySurplus > 0 && remaining > 0 ? Math.ceil(remaining / monthlySurplus) : null

  return (
    <Card className="border-white/10 bg-black/30 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Target className="size-4 text-primary" />
          Objetivo
        </CardTitle>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="0"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-7 w-24 text-xs"
              min="0"
              step="100"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button size="icon-sm" variant="ghost" onClick={handleSave} className="h-7 w-7">
              <Check className="size-3.5" />
            </Button>
          </div>
        ) : (
          <Button size="icon-sm" variant="ghost" onClick={startEdit} className="h-7 w-7">
            <Pencil className="size-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-primary">
            {goal > 0 ? formatCurrency(goal) : '—'}
          </span>
          {goal > 0 && (
            <span className="text-xs text-muted-foreground">
              {progress >= 100 ? 'Concluído!' : `${progress.toFixed(0)}%`}
            </span>
          )}
        </div>
        {goal > 0 && (
          <>
            <Progress value={progress} className="h-2" />
            <div className="space-y-1 text-xs text-muted-foreground">
              {progress >= 100 ? (
                <p className="text-emerald-400">Você atingiu seu objetivo!</p>
              ) : (
                <>
                  <p>Faltam {formatCurrency(remaining)} para o objetivo</p>
                  {monthsToGoal != null && monthlySurplus > 0 && (
                    <p>
                      Com economia de ~{formatCurrency(monthlySurplus)}/mês, você chega em ~
                      {monthsToGoal} {monthsToGoal === 1 ? 'mês' : 'meses'}
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
        {goal === 0 && !isEditing && (
          <p className="text-xs text-muted-foreground">Clique no lápis para definir seu objetivo</p>
        )}
      </CardContent>
    </Card>
  )
}
