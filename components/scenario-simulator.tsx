'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Save,
  Copy,
  RotateCcw,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  PiggyBank,
  Smartphone,
  Plane,
  TrendingUpDown,
  CreditCard,
  FileDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/finance'
import {
  computeBaseFromTransactions,
  runSimulation,
  ADJUSTMENT_TYPE_LABELS,
  DURATION_LABELS,
  type ScenarioAdjustment,
  type AdjustmentType,
  type SimulatorBase,
  type SimulatorResult,
} from '@/lib/simulator'
import { CATEGORIES } from '@/lib/constants'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import type { Transaction } from '@/lib/finance'

const PERIOD_OPTIONS = [
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' },
  { value: 24, label: '24 meses' },
]

const DURATION_MAP: Record<string, number> = { '1': 1, '3': 3, '6': 6, '12': 12, continuo: 999 }

// Base atual cards
function BaseAtualCards({ base }: { base: SimulatorBase }) {
  const cards = [
    {
      label: 'Receita média mensal',
      value: base.avgMonthlyIncome,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/20 to-emerald-500/5',
    },
    {
      label: 'Gasto médio mensal',
      value: base.avgMonthlyExpenses,
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'from-red-500/20 to-red-500/5',
    },
    {
      label: 'Saldo atual',
      value: base.currentBalance,
      icon: Wallet,
      color: 'text-cyan-400',
      bg: 'from-cyan-500/20 to-cyan-500/5',
    },
    {
      label: 'Economia mensal (R$)',
      value: base.avgMonthlySavings,
      icon: PiggyBank,
      color: base.avgMonthlySavings >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: base.avgMonthlySavings >= 0 ? 'from-emerald-500/20 to-emerald-500/5' : 'from-red-500/20 to-red-500/5',
    },
    {
      label: 'Economia (%)',
      value: `${base.avgSavingsPercent.toFixed(1)}%`,
      icon: Percent,
      color: base.avgSavingsPercent >= 0 ? 'text-violet-400' : 'text-red-400',
      bg: 'from-violet-500/20 to-violet-500/5',
    },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base atual</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.label}
              className={`rounded-xl border border-white/10 bg-gradient-to-br ${c.bg} p-3 backdrop-blur-xl transition-all hover:border-white/20`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium text-muted-foreground">{c.label}</p>
                  <p className={`text-base font-bold ${c.color}`}>
                    {typeof c.value === 'string' ? c.value : formatCurrency(c.value)}
                  </p>
                </div>
                <div className={`rounded-lg bg-white/10 p-1.5 ${c.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {!base.hasEnoughData && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <AlertTriangle className="size-4 shrink-0" />
          Sem dados suficientes para média mensal. Use os valores como estimativa.
        </div>
      )}
    </div>
  )
}

// Adjustment form modal
function AdjustmentModal({
  open,
  onClose,
  onAdd,
  editing,
  onSaveEdit,
}: {
  open: boolean
  onClose: () => void
  onAdd: (adj: Omit<ScenarioAdjustment, 'id' | 'order'>) => void
  editing: ScenarioAdjustment | null
  onSaveEdit: (adj: ScenarioAdjustment) => void
}) {
  const [type, setType] = useState<AdjustmentType>('aumentar_receita')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [category, setCategory] = useState('Outros')
  const [startWhen, setStartWhen] = useState<'mes_atual' | 'proximo_mes'>('mes_atual')
  const [duration, setDuration] = useState<'1' | '3' | '6' | '12' | 'continuo'>('continuo')
  const [numInstallments, setNumInstallments] = useState('12')
  const [valuePerInstallment, setValuePerInstallment] = useState('')

  const reset = useCallback(() => {
    setType('aumentar_receita')
    setDescription('')
    setValue('')
    setCategory('Outros')
    setStartWhen('mes_atual')
    setDuration('continuo')
    setNumInstallments('12')
    setValuePerInstallment('')
  }, [])

  useEffect(() => {
    if (open) {
      if (editing) {
        setType(editing.type)
        setDescription(editing.description)
        setValue(String(editing.value))
        setCategory(editing.category ?? 'Outros')
        setStartWhen(editing.startWhen)
        setDuration(editing.duration)
        setNumInstallments(String(editing.numInstallments ?? 12))
        setValuePerInstallment(editing.valuePerInstallment ? String(editing.valuePerInstallment) : '')
      } else {
        reset()
      }
    }
  }, [open, editing, reset])

  const handleSubmit = () => {
    const v = parseFloat(value.replace(',', '.')) || 0
    if (!description.trim()) {
      toast.error('Preencha a descrição')
      return
    }
    if (v <= 0) {
      toast.error('Informe um valor válido')
      return
    }
    const n = parseInt(numInstallments, 10) || 1
    const vp = valuePerInstallment ? parseFloat(valuePerInstallment.replace(',', '.')) : v / n

    const baseAdj = {
      type,
      description: description.trim(),
      value: type === 'parcelamento' ? vp * n : v,
      category,
      startWhen,
      startMonthOffset: startWhen === 'mes_atual' ? 0 : 1,
      duration,
      durationMonths: DURATION_MAP[duration] ?? 999,
      numInstallments: type === 'parcelamento' ? n : undefined,
      valuePerInstallment: type === 'parcelamento' ? vp : undefined,
      active: true,
    }

    if (editing) {
      onSaveEdit({ ...editing, ...baseAdj })
      toast.success('Ajuste atualizado')
    } else {
      onAdd(baseAdj)
      toast.success('Ajuste adicionado')
    }
    onClose()
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); reset() } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-black/80 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar ajuste' : 'Adicionar ajuste'}</DialogTitle>
          <DialogDescription>Configure o tipo e os valores do ajuste</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Tipo de ajuste</Label>
            <Select value={type} onValueChange={(v) => setType(v as AdjustmentType)}>
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ADJUSTMENT_TYPE_LABELS) as [AdjustmentType, string][]).map(([k, l]) => (
                  <SelectItem key={k} value={k}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Freelance, Netflix..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/20"
            />
          </div>
          <div className="grid gap-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-white/5 border-white/20"
              min="0"
              step="0.01"
            />
          </div>
          {type === 'parcelamento' && (
            <>
              <div className="grid gap-2">
                <Label>Número de parcelas</Label>
                <Input
                  type="number"
                  value={numInstallments}
                  onChange={(e) => setNumInstallments(e.target.value)}
                  min="1"
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor por parcela (R$) – opcional</Label>
                <Input
                  type="number"
                  placeholder="Deixe vazio para calcular do total"
                  value={valuePerInstallment}
                  onChange={(e) => setValuePerInstallment(e.target.value)}
                  className="bg-white/5 border-white/20"
                  min="0"
                />
              </div>
            </>
          )}
          <div className="grid gap-2">
            <Label>Categoria (opcional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Quando começa</Label>
            <Select value={startWhen} onValueChange={(v: 'mes_atual' | 'proximo_mes') => setStartWhen(v)}>
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes_atual">Mês atual</SelectItem>
                <SelectItem value="proximo_mes">Próximo mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Duração</Label>
            <Select value={duration} onValueChange={(v: '1' | '3' | '6' | '12' | 'continuo') => setDuration(v)}>
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DURATION_LABELS) as [string, string][]).map(([k, l]) => (
                  <SelectItem key={k} value={k}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>{editing ? 'Salvar' : 'Adicionar ajuste'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Adjustment chips
function AdjustmentChips({
  adjustments,
  onToggle,
  onEdit,
  onRemove,
  onReorder,
}: {
  adjustments: ScenarioAdjustment[]
  onToggle: (id: string, active: boolean) => void
  onEdit: (adj: ScenarioAdjustment) => void
  onRemove: (id: string) => void
  onReorder: (from: number, to: number) => void
}) {
  if (adjustments.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {adjustments.map((adj, idx) => (
        <div
          key={adj.id}
          draggable
          onDragStart={(e) => { e.dataTransfer.setData('index', String(idx)) }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const from = parseInt(e.dataTransfer.getData('index'), 10)
            if (!isNaN(from) && from !== idx) onReorder(from, idx)
          }}
          className={`flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl transition-all hover:border-white/20 ${
            adj.active ? 'opacity-100' : 'opacity-60'
          }`}
        >
          <button
            type="button"
            className="cursor-grab text-muted-foreground hover:text-foreground"
            aria-label="Arrastar para reordenar"
          >
            <GripVertical className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{adj.description}</p>
            <p className="text-[10px] text-muted-foreground">
              {ADJUSTMENT_TYPE_LABELS[adj.type]} · {formatCurrency(adj.type === 'parcelamento' ? (adj.valuePerInstallment ?? adj.value) : adj.value)}
              {adj.duration !== 'continuo' && ` · ${DURATION_LABELS[adj.duration]}`}
            </p>
          </div>
          <Switch checked={adj.active} onCheckedChange={(c) => onToggle(adj.id, c)} />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(adj)}>
            <Pencil className="size-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemove(adj.id)}>
            <Trash2 className="size-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}

// Resultado comparison
function ResultadoSection({ result }: { result: SimulatorResult }) {
  const r = result
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resultado: Atual vs Cenário</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
          <p className="text-[10px] text-muted-foreground">Saldo projetado (final)</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(r.adjustedFinalBalance)}</p>
          <p className="text-xs text-muted-foreground">Atual: {formatCurrency(r.currentFinalBalance)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
          <p className="text-[10px] text-muted-foreground">Economia acumulada</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(r.adjustedTotalSavings)}</p>
          <p className="text-xs text-muted-foreground">Atual: {formatCurrency(r.currentTotalSavings)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
          <p className="text-[10px] text-muted-foreground">Média sobra mensal</p>
          <p className="text-lg font-bold text-cyan-400">{formatCurrency(r.adjustedAvgMonthlySurplus)}</p>
          <p className="text-xs text-muted-foreground">Atual: {formatCurrency(r.currentAvgMonthlySurplus)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
          <p className="text-[10px] text-muted-foreground">Melhor / Pior mês</p>
          <p className="text-sm font-medium text-emerald-400">{r.adjustedBestMonth.month}: {formatCurrency(r.adjustedBestMonth.value)}</p>
          <p className="text-sm font-medium text-red-400">{r.adjustedWorstMonth.month}: {formatCurrency(r.adjustedWorstMonth.value)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {r.isHealthy ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="size-3.5" />
            Cenário saudável
          </span>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
              <AlertTriangle className="size-3.5" />
              Risco de déficit em: {r.riskMonth}
            </span>
            {r.suggestionToBreakEven != null && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-300">
                <Lightbulb className="size-3.5" />
                Para não ficar negativo, reduza gastos em R$ {formatCurrency(r.suggestionToBreakEven)}/mês
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Charts
function SimulatorCharts({ result }: { result: SimulatorResult }) {
  const lineData = result.currentScenario.map((m, i) => ({
    month: m.monthName,
    Atual: result.currentScenario[i].balance,
    Cenário: result.adjustedScenario[i].balance,
  }))

  const barData = result.adjustedScenario.map((m) => ({
    month: m.monthName,
    Economia: m.savings,
  }))

  const pieData = Object.entries(result.categoryTotals)
    .filter(([, v]) => v > 0)
    .map(([name, value], i) => ({
      name,
      value,
      color: ['#10b981', '#3b82f6', '#ef4444', '#eab308', '#8b5cf6', '#06b6d4', '#ec4899'][i % 7],
    }))

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gráficos</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
          <p className="mb-2 text-sm font-medium">Saldo mês a mês</p>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend />
                <Line type="monotone" dataKey="Atual" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Cenário" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
          <p className="mb-2 text-sm font-medium">Economia por mês</p>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="Economia" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {pieData.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
          <p className="mb-2 text-sm font-medium">Gastos por categoria no cenário</p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name">
                  {pieData.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

// Templates
const TEMPLATES = [
  { id: 'economia', label: 'Modo Economia', icon: PiggyBank, adjustments: [{ type: 'reduzir_gasto' as const, description: 'Cortar gastos supérfluos', value: 500, duration: 'continuo' as const }] },
  { id: 'celular', label: 'Comprar celular 12x', icon: Smartphone, adjustments: [{ type: 'parcelamento' as const, description: 'Celular parcelado', value: 3000, numInstallments: 12, duration: '12' as const }] },
  { id: 'viagem', label: 'Planejar viagem', icon: Plane, adjustments: [{ type: 'despesa_fixa' as const, description: 'Reserva mensal viagem', value: 800, duration: '12' as const }] },
  { id: 'investir', label: 'Começar a investir', icon: TrendingUpDown, adjustments: [{ type: 'investimento_mensal' as const, description: 'Aplicação mensal', value: 500, duration: 'continuo' as const }] },
  { id: 'dividas', label: 'Quitar dívidas', icon: CreditCard, adjustments: [{ type: 'despesa_fixa' as const, description: 'Parcela dívida', value: 600, duration: '12' as const }] },
]

function ScenarioTemplates({ onApply }: { onApply: (adjustments: Partial<ScenarioAdjustment>[]) => void }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Templates</h3>
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                const adjs = t.adjustments.map((a) => ({
                  type: a.type,
                  description: a.description,
                  value: a.value,
                  duration: a.duration,
                  durationMonths: DURATION_MAP[a.duration] ?? 999,
                  numInstallments: a.numInstallments,
                  startWhen: 'mes_atual' as const,
                  startMonthOffset: 0,
                  category: 'Outros',
                  active: true,
                }))
                onApply(adjs)
                toast.success(`Template "${t.label}" aplicado`)
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 backdrop-blur-xl transition-all hover:border-violet-500/50 hover:bg-violet-500/10"
            >
              <Icon className="size-4 text-violet-400" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Main component
const STORAGE_KEY = 'flowfinance-scenario-adjustments'

function loadStoredAdjustments(): ScenarioAdjustment[] {
  if (typeof window === 'undefined') return []
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (!v) return []
    const parsed = JSON.parse(v)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAdjustments(adj: ScenarioAdjustment[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adj))
  } catch {}
}

export function ScenarioSimulator({ transactions }: { transactions: Transaction[] }) {
  const [period, setPeriod] = useState(12)
  const [adjustments, setAdjustments] = useState<ScenarioAdjustment[]>(() => loadStoredAdjustments())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ScenarioAdjustment | null>(null)

  const base = useMemo(() => computeBaseFromTransactions(transactions), [transactions])
  const result = useMemo(
    () => runSimulation(base, adjustments, period),
    [base, adjustments, period]
  )

  const handleAdd = useCallback((adj: Omit<ScenarioAdjustment, 'id' | 'order'>) => {
    const newAdj: ScenarioAdjustment = {
      ...adj,
      id: crypto.randomUUID(),
      order: adjustments.length,
    }
    const next = [...adjustments, newAdj]
    setAdjustments(next)
    saveAdjustments(next)
  }, [adjustments])

  const handleSaveEdit = useCallback((adj: ScenarioAdjustment) => {
    setAdjustments((prev) => {
      const next = prev.map((a) => (a.id === adj.id ? adj : a))
      saveAdjustments(next)
      return next
    })
    setEditing(null)
  }, [])

  const handleRemove = useCallback((id: string) => {
    setAdjustments((prev) => {
      const next = prev.filter((a) => a.id !== id)
      saveAdjustments(next)
      return next
    })
  }, [])

  const handleToggle = useCallback((id: string, active: boolean) => {
    setAdjustments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, active } : a))
      saveAdjustments(next)
      return next
    })
  }, [])

  const handleReorder = useCallback((from: number, to: number) => {
    setAdjustments((prev) => {
      const copy = [...prev]
      const [removed] = copy.splice(from, 1)
      copy.splice(to, 0, removed)
      const next = copy.map((a, i) => ({ ...a, order: i }))
      saveAdjustments(next)
      return next
    })
  }, [])

  const handleApplyTemplate = useCallback((templateAdj: Partial<ScenarioAdjustment>[]) => {
    const newAdjs: ScenarioAdjustment[] = templateAdj.map((a, i) => {
      const n = a.numInstallments ?? 1
      const total = a.value ?? 0
      const vp = a.valuePerInstallment ?? total / n
      return {
        id: crypto.randomUUID(),
        type: a.type!,
        description: a.description!,
        value: a.type === 'parcelamento' ? vp * n : total,
        category: a.category ?? 'Outros',
        startWhen: a.startWhen ?? 'mes_atual',
        startMonthOffset: a.startMonthOffset ?? 0,
        duration: a.duration ?? 'continuo',
        durationMonths: a.duration === 'parcelamento' ? n : (a.durationMonths ?? 999),
        numInstallments: a.type === 'parcelamento' ? n : undefined,
        valuePerInstallment: a.type === 'parcelamento' ? vp : undefined,
        active: true,
        order: adjustments.length + i,
      }
    })
    const next = [...adjustments, ...newAdjs]
    setAdjustments(next)
    saveAdjustments(next)
  }, [adjustments])

  const handleSaveScenario = () => {
    saveAdjustments(adjustments)
    toast.success('Cenário salvo')
  }

  const handleDuplicate = () => {
    const duplicated = adjustments.map((a, i) => ({ ...a, id: crypto.randomUUID(), order: i }))
    setAdjustments(duplicated)
    saveAdjustments(duplicated)
    toast.success('Cenário duplicado')
  }

  const handleReset = () => {
    setAdjustments([])
    saveAdjustments([])
    toast.success('Cenário resetado')
  }

  const handleExport = () => {
    try {
      const csv = [
        ['Mês', 'Atual', 'Cenário'].join(','),
        ...result.currentScenario.map((m, i) =>
          [m.monthName, result.currentScenario[i].balance, result.adjustedScenario[i].balance].join(',')
        ),
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flowfinance-simulador-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exportado em CSV')
    } catch {
      toast.error('Erro ao exportar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Simulador de Cenários</h2>
          <p className="text-sm text-muted-foreground">Teste mudanças e veja a projeção do seu saldo</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={String(period)} onValueChange={(v) => setPeriod(parseInt(v, 10))}>
            <SelectTrigger className="w-[140px] bg-black/40 border-white/20">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="border-white/20" onClick={handleSaveScenario}>
            <Save className="mr-1.5 size-4" />
            Salvar Cenário
          </Button>
          <Button variant="outline" size="sm" className="border-white/20" onClick={handleDuplicate}>
            <Copy className="mr-1.5 size-4" />
            Duplicar
          </Button>
          <Button variant="outline" size="sm" className="border-white/20" onClick={handleReset}>
            <RotateCcw className="mr-1.5 size-4" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Base atual */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
        <BaseAtualCards base={base} />
      </div>

      {/* Ajustes */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Ajustes do Cenário</h3>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => { setEditing(null); setModalOpen(true) }}>
            <Plus className="mr-1.5 size-4" />
            Adicionar ajuste
          </Button>
        </div>
        <AdjustmentChips
          adjustments={adjustments}
          onToggle={handleToggle}
          onEdit={(a) => { setEditing(a); setModalOpen(true) }}
          onRemove={handleRemove}
          onReorder={handleReorder}
        />
        {adjustments.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhum ajuste. Clique em &quot;Adicionar ajuste&quot; para simular.</p>
        )}
      </div>

      <AdjustmentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onAdd={handleAdd}
        editing={editing}
        onSaveEdit={handleSaveEdit}
      />

      {/* Templates */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
        <ScenarioTemplates onApply={handleApplyTemplate} />
      </div>

      {/* Resultado */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
        <ResultadoSection result={result} />
      </div>

      {/* Gráficos */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
        <SimulatorCharts result={result} />
      </div>

      {/* Footer de ação */}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-4 backdrop-blur-xl">
        <Button className="bg-primary hover:bg-primary/90">
          Aplicar como Plano
        </Button>
        <Button variant="outline" className="border-white/20" onClick={handleSaveScenario}>
          Salvar Cenário
        </Button>
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <FileDown className="mr-1.5 size-4" />
          Exportar CSV
        </Button>
      </div>
    </div>
  )
}
