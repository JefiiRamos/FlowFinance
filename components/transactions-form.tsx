'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { type Transaction, type TransactionType, formatCurrency } from '@/lib/finance'
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/constants'
import { Plus, Trash2, Pencil, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { toast } from 'sonner'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export type TransactionFormData = {
  type: TransactionType
  amount: number
  date: string
  description: string
  category?: string
  paymentMethod?: string
}

interface TransactionsFormProps {
  transactions: Transaction[]
  onAdd: (data: TransactionFormData) => Promise<void>
  onEdit: (id: string, data: Partial<TransactionFormData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
  externalEdit?: Transaction | null
  onEditClose?: () => void
  /** Ref to open add dialog from outside (e.g. FAB) */
  openAddRef?: React.MutableRefObject<{ open: (type?: TransactionType) => void } | null>
}

export function TransactionsForm({ transactions, onAdd, onEdit, onDelete, isLoading, externalEdit, onEditClose, openAddRef }: TransactionsFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType>('income')
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState('Outros')
  const [paymentMethod, setPaymentMethod] = useState('Outros')

  function resetForm() {
    setDescription('')
    setAmount('')
    setDate(new Date().toISOString().slice(0, 10))
    setCategory('Outros')
    setPaymentMethod('Outros')
    setEditing(null)
  }

  const openAdd = useCallback((type: TransactionType) => {
    setTransactionType(type)
    resetForm()
    setIsOpen(true)
  }, [])

  async function handleSave() {
    if (isSaving) return

    if (!description.trim()) {
      toast.error('Preencha a descriÃ§Ã£o')
      return
    }

    const parsedAmount = parseFloat(amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Informe um valor vÃ¡lido')
      return
    }

    if (!date?.trim()) {
      toast.error('Informe a data')
      return
    }

    setIsSaving(true)

    try {
      const data: TransactionFormData = {
        type: transactionType,
        description: description.trim(),
        amount: parsedAmount,
        date,
        category,
        paymentMethod,
      }

      if (editing) {
        await onEdit(editing.id, data)
      } else {
        await onAdd(data)
      }

      resetForm()
      setIsOpen(false)
      toast.success(editing ? 'TransaÃ§Ã£o atualizada' : 'TransaÃ§Ã£o adicionada')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  function handleEdit(t: Transaction) {
    setEditing(t)
    setTransactionType(t.type)
    setDescription(t.description)
    setAmount(t.amount.toString())
    setDate(t.date)
    setCategory(t.category ?? 'Outros')
    setPaymentMethod(t.paymentMethod ?? 'Outros')
    setIsOpen(true)
  }

  useEffect(() => {
    if (openAddRef) {
      openAddRef.current = { open: (type = 'income') => openAdd(type) }
      return () => {
        openAddRef.current = null
      }
    }
  }, [openAddRef, openAdd])

  useEffect(() => {
    if (externalEdit) {
      setEditing(externalEdit)
      setTransactionType(externalEdit.type)
      setDescription(externalEdit.description)
      setAmount(externalEdit.amount.toString())
      setDate(externalEdit.date)
      setCategory(externalEdit.category ?? 'Outros')
      setPaymentMethod(externalEdit.paymentMethod ?? 'Outros')
      setIsOpen(true)
    }
  }, [externalEdit?.id])

  async function handleDelete(id: string) {
    try {
      await onDelete(id)
      toast.success('TransaÃ§Ã£o removida')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover')
    }
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">Transacoes</h3>
        <p className="mt-2 text-sm font-medium text-[#A1A7B3]">Recebimentos e gastos</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <p className="py-4 text-center text-xs font-medium text-muted-foreground">Carregando...</p>
        ) : sorted.length === 0 ? (
          <p className="py-4 text-center text-xs font-medium text-muted-foreground">
            Nenhuma transaÃ§Ã£o. Adicione quando receber ou gastar.
          </p>
        ) : (
          sorted.map((t) => (
            <div
              key={t.id}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-3 shadow-sm shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {t.type === 'income' ? (
                  <ArrowDownCircle className="size-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <ArrowUpCircle className="size-3.5 shrink-0 text-red-400" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{t.description}</p>
                  <p className="text-xs font-medium text-muted-foreground">{formatDate(t.date)} / {t.category ?? 'Outros'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-semibold ${t.type === 'income' ? 'text-[#22C55E]' : 'text-[#EF4444]'
                    }`}
                >
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={() => handleEdit(t)}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive opacity-100 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={() => void handleDelete(t.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="shrink-0 space-y-3 border-t border-white/5 p-4">
        <Button
          className="w-full gap-2"
          size="sm"
          onClick={() => {
            setTransactionType('income')
            resetForm()
            setIsOpen(true)
          }}
        >
          <Plus className="size-4" />
          Nova TransaÃ§Ã£o
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-white/5 bg-white/[0.03] text-[#22C55E] hover:bg-[#22C55E]/10"
            onClick={() => openAdd('income')}
          >
            <ArrowDownCircle className="size-3.5" />
            Receita
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-white/5 bg-white/[0.03] text-[#EF4444] hover:bg-[#EF4444]/10"
            onClick={() => openAdd('expense')}
          >
            <ArrowUpCircle className="size-3.5" />
            Gasto
          </Button>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) { resetForm(); onEditClose?.() } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Editar transaÃ§Ã£o' : transactionType === 'income' ? 'Nova receita' : 'Novo gasto'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da transaÃ§Ã£o.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={transactionType === 'income' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTransactionType('income')}
                  >
                    Receita
                  </Button>
                  <Button
                    type="button"
                    variant={transactionType === 'expense' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTransactionType('expense')}
                  >
                    Gasto
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">DescriÃ§Ã£o</Label>
                <Input
                  id="desc"
                  placeholder="Ex: Supermercado, SalÃ¡rio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}

                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"

                />
              </div>
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Forma de pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}

                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => { resetForm(); setIsOpen(false) }} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={() => void handleSave()} disabled={isSaving}>
                {isSaving ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
