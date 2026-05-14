'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/finance'
import { Target, Plus, Trash2, Loader2 } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { toast } from 'sonner'

export interface GoalItem {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
}

function authHeaders(): HeadersInit {
  const token = getToken()
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`
  return h
}

interface GoalsSectionProps {
  balance: number
}

export function GoalsSection({ balance }: GoalsSectionProps) {
  const [goals, setGoals] = useState<GoalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')

  const fetchGoals = useCallback(async () => {
    const res = await fetch('/api/goals', { headers: authHeaders() })
    if (!res.ok) {
      setGoals([])
      return
    }
    const data = (await res.json()) as GoalItem[]
    setGoals(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    setLoading(true)
    void fetchGoals().finally(() => setLoading(false))
  }, [fetchGoals])

  async function addGoal() {
    const name = newName.trim() || 'Meta'
    const target = parseFloat(newTarget.replace(',', '.')) || 0
    if (target <= 0) return
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, targetAmount: target, currentAmount: 0 }),
    })
    if (!res.ok) {
      toast.error('Não foi possível salvar a meta')
      return
    }
    setNewName('')
    setNewTarget('')
    setAdding(false)
    await fetchGoals()
    toast.success('Meta criada')
  }

  async function removeGoal(id: string) {
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (!res.ok) {
      toast.error('Não foi possível remover')
      return
    }
    await fetchGoals()
    toast.success('Meta removida')
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
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
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
                <Button size="sm" className="h-8" onClick={() => void addGoal()}>
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
              const currentFromBalance = Math.min(balance, g.targetAmount)
              const progress = g.targetAmount > 0 ? Math.min(100, (currentFromBalance / g.targetAmount) * 100) : 0
              return (
                <div
                  key={g.id}
                  className="rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:bg-black/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground text-sm">{g.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => void removeGoal(g.id)}
                    >
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
