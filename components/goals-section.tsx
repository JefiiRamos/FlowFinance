'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/finance'
import { Target, Plus, Trash2 } from 'lucide-react'

const STORAGE_KEY = 'flowfinance-goals'

export interface GoalItem {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
}

function loadGoals(): GoalItem[] {
  if (typeof window === 'undefined') return []
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (!v) return []
    const parsed = JSON.parse(v) as GoalItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveGoals(goals: GoalItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  } catch {
    // ignore
  }
}

interface GoalsSectionProps {
  balance: number
}

export function GoalsSection({ balance }: GoalsSectionProps) {
  const [goals, setGoals] = useState<GoalItem[]>([])
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')

  useEffect(() => {
    setGoals(loadGoals())
  }, [])

  useEffect(() => {
    saveGoals(goals)
  }, [goals])

  function addGoal() {
    const name = newName.trim() || 'Meta'
    const target = parseFloat(newTarget.replace(',', '.')) || 0
    if (target <= 0) return
    setGoals((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, targetAmount: target, currentAmount: 0 },
    ])
    setNewName('')
    setNewTarget('')
    setAdding(false)
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <Card className="border-white/10 bg-black/30 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Target className="size-4 text-primary" />
          Metas financeiras
        </CardTitle>
        {!adding && (
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" />
            Meta
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-white/10 bg-black/20 p-3">
            <Input
              placeholder="Nome (ex: Viagem)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-8 w-[140px] bg-white/5 text-xs"
            />
            <Input
              type="number"
              placeholder="Valor alvo"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="h-8 w-[100px] bg-white/5 text-xs"
              min="0"
              step="100"
            />
            <Button size="sm" className="h-8" onClick={addGoal}>
              Adicionar
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
          </div>
        )}
        {goals.length === 0 && !adding && (
          <p className="text-xs text-muted-foreground">Nenhuma meta. Clique em Meta para criar.</p>
        )}
        {goals.map((g) => {
          // Progresso usa o saldo total (o que você recebeu/já tem), não valor manual
          const currentFromBalance = Math.min(balance, g.targetAmount)
          const progress = g.targetAmount > 0 ? Math.min(100, (currentFromBalance / g.targetAmount) * 100) : 0
          return (
            <div key={g.id} className="rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:bg-black/30">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground text-sm">{g.name}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeGoal(g.id)}>
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <div className="mt-2 flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">
                  {formatCurrency(currentFromBalance)} / {formatCurrency(g.targetAmount)}
                </span>
                <span className={progress >= 100 ? 'text-emerald-400' : 'text-muted-foreground'}>
                  {progress >= 100 ? 'Concluído' : `${progress.toFixed(0)}%`}
                </span>
              </div>
              <Progress value={progress} className="mt-1 h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
