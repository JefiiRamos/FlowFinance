'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ParticleCard } from '@/components/magic-bento'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type IncomeEntry, MONTH_NAMES, MONTH_NAMES_FULL, formatCurrency, generateId } from '@/lib/finance'
import { Plus, Trash2, Pencil } from 'lucide-react'

interface IncomeFormProps {
  entries: IncomeEntry[]
  onEntriesChange: (entries: IncomeEntry[]) => void
  compact?: boolean
}

export function IncomeForm({ entries, onEntriesChange, compact = false }: IncomeFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [startMonth, setStartMonth] = useState('1')
  const [endMonth, setEndMonth] = useState('12')

  function resetForm() {
    setDescription('')
    setAmount('')
    setStartMonth('1')
    setEndMonth('12')
    setEditingEntry(null)
  }

  function handleSave() {
    const parsedAmount = parseFloat(amount)
    if (!description || isNaN(parsedAmount) || parsedAmount <= 0) return

    if (editingEntry) {
      onEntriesChange(
        entries.map((e) =>
          e.id === editingEntry.id
            ? {
                ...e,
                description,
                amount: parsedAmount,
                startMonth: parseInt(startMonth),
                endMonth: parseInt(endMonth),
              }
            : e,
        ),
      )
    } else {
      onEntriesChange([
        ...entries,
        {
          id: generateId(),
          description,
          amount: parsedAmount,
          startMonth: parseInt(startMonth),
          endMonth: parseInt(endMonth),
        },
      ])
    }

    resetForm()
    setIsOpen(false)
  }

  function handleEdit(entry: IncomeEntry) {
    setEditingEntry(entry)
    setDescription(entry.description)
    setAmount(entry.amount.toString())
    setStartMonth(entry.startMonth.toString())
    setEndMonth(entry.endMonth.toString())
    setIsOpen(true)
  }

  function handleDelete(id: string) {
    onEntriesChange(entries.filter((e) => e.id !== id))
  }

  if (compact) {
    return (
      <div className="flex h-full flex-col">
        <div className="shrink-0 px-3 pt-3">
          <h3 className="text-sm font-semibold text-foreground">Rendas Projetadas</h3>
        </div>
        <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
          {entries.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Nenhuma renda.</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 transition-colors hover:bg-black/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{entry.description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {MONTH_NAMES[entry.startMonth - 1]} - {MONTH_NAMES[entry.endMonth - 1]}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-primary">{formatCurrency(entry.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => handleEdit(entry)}
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 hover:text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="shrink-0 border-t border-white/10 p-3">
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full gap-2 bg-primary/90 hover:bg-primary">
                <Plus className="size-3.5" />
                Adicionar Renda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEntry ? 'Editar Renda' : 'Nova Renda'}</DialogTitle>
                <DialogDescription>
                  {editingEntry ? 'Altere os dados da renda.' : 'Preencha os dados da nova fonte de renda.'}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Descricao</label>
                  <Input placeholder="Ex: Freelance, Salario..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Valor Mensal (R$)</label>
                  <Input type="number" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Mes Inicio</label>
                    <Select value={startMonth} onValueChange={setStartMonth}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTH_NAMES_FULL.map((name, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Mes Fim</label>
                    <Select value={endMonth} onValueChange={setEndMonth}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTH_NAMES_FULL.map((name, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { resetForm(); setIsOpen(false) }}>Cancelar</Button>
                <Button onClick={handleSave}>{editingEntry ? 'Salvar' : 'Adicionar'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Rendas Projetadas</CardTitle>
            <CardDescription>Adicione suas fontes de renda com periodo</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3.5" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEntry ? 'Editar Renda' : 'Nova Renda'}</DialogTitle>
                <DialogDescription>
                  {editingEntry
                    ? 'Altere os dados da renda selecionada.'
                    : 'Preencha os dados da nova fonte de renda.'}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Descricao</label>
                  <Input
                    placeholder="Ex: Freelance, Salario, Consultoria..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Valor Mensal (R$)</label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Mes Inicio</label>
                    <Select value={startMonth} onValueChange={setStartMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_NAMES_FULL.map((name, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Mes Fim</label>
                    <Select value={endMonth} onValueChange={setEndMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_NAMES_FULL.map((name, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { resetForm(); setIsOpen(false) }}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingEntry ? 'Salvar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma renda cadastrada.</p>
            <p className="text-xs text-muted-foreground">Clique em &quot;Adicionar&quot; para comecar.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <ParticleCard
                key={entry.id}
                className="magic-bento-card magic-bento-card--border-glow !aspect-auto !min-h-0 group flex items-center justify-between rounded-xl border border-border/50 px-4 py-3 transition-all duration-200"
                style={{ backgroundColor: '#060010', '--glow-color': '132, 0, 255' } as React.CSSProperties}
                particleCount={10}
                glowColor="132, 0, 255"
                enableTilt={false}
                enableMagnetism={false}
                clickEffect
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{entry.description}</span>
                  <span className="text-xs text-muted-foreground">
                    {MONTH_NAMES_FULL[entry.startMonth - 1]} a {MONTH_NAMES_FULL[entry.endMonth - 1]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary">{formatCurrency(entry.amount)}/mes</span>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); handleEdit(entry) }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </div>
              </ParticleCard>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
