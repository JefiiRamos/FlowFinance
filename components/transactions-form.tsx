'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { type Transaction, type TransactionType, formatCurrency } from '@/lib/finance'
import { Plus, Trash2, Pencil, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { toast } from 'sonner'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

interface TransactionsFormProps {
  transactions: Transaction[]
  onAdd: (data: { type: TransactionType; amount: number; date: string; description: string }) => Promise<void>
  onEdit: (id: string, data: { type: TransactionType; amount: number; date?: string; description: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function TransactionsForm({ transactions, onAdd, onEdit, onDelete, isLoading }: TransactionsFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType>('income')
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  function resetForm() {
    setDescription('')
    setAmount('')
    setEditing(null)
  }

  function openAdd(type: TransactionType) {
    setTransactionType(type)
    resetForm()
    setIsOpen(true)
  }

  async function handleSave() {
    const parsedAmount = parseFloat(amount)
    if (!description || isNaN(parsedAmount) || parsedAmount <= 0) return

    const date = new Date().toISOString().slice(0, 10)
    setIsSaving(true)
    try {
      if (editing) {
        await onEdit(editing.id, { type: transactionType, description, amount: parsedAmount })
      } else {
        await onAdd({ type: transactionType, description, amount: parsedAmount, date })
      }
      resetForm()
      setIsOpen(false)
      toast.success(editing ? 'Transação atualizada' : 'Transação adicionada')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
      return
    } finally {
      setIsSaving(false)
    }
  }

  function handleEdit(t: Transaction) {
    setEditing(t)
    setTransactionType(t.type)
    setDescription(t.description)
    setAmount(t.amount.toString())
    setIsOpen(true)
  }

  async function handleDelete(id: string) {
    try {
      await onDelete(id)
      toast.success('Transação removida')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover')
    }
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-3 pt-3">
        <h3 className="text-sm font-semibold text-foreground">Transações</h3>
        <p className="text-[10px] text-muted-foreground">Recebimentos e gastos</p>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {isLoading ? (
          <p className="py-4 text-center text-xs text-muted-foreground">Carregando...</p>
        ) : sorted.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Nenhuma transação. Adicione quando receber ou gastar.
          </p>
        ) : (
          sorted.map((t) => (
            <div
              key={t.id}
              className="group flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 transition-colors hover:bg-black/30"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {t.type === 'income' ? (
                  <ArrowDownCircle className="size-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <ArrowUpCircle className="size-3.5 shrink-0 text-red-400" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{t.description}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(t.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-semibold ${
                    t.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => handleEdit(t)}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 hover:text-destructive"
                  onClick={() => void handleDelete(t.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="shrink-0 space-y-2 border-t border-white/10 p-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-500"
            onClick={() => openAdd('income')}
          >
            <Plus className="size-3.5" />
            Recebi
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-2"
            onClick={() => openAdd('expense')}
          >
            <Plus className="size-3.5" />
            Gastei
          </Button>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm() }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Editar' : transactionType === 'income' ? 'Adicionar recebimento' : 'Adicionar gasto'}
              </DialogTitle>
              <DialogDescription>
                {transactionType === 'income'
                  ? 'Registre quando receber salário ou outra renda.'
                  : 'Registre quando fizer um gasto para subtrair do saldo.'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder={transactionType === 'income' ? 'Ex: Salário, Freelance...' : 'Ex: Supermercado, Conta...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Valor (R$)</label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setIsOpen(false) }} disabled={isSaving}>
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
