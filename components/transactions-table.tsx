'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { type Transaction, formatCurrency } from '@/lib/finance'
import { getCategoryIcon, getPaymentIcon } from '@/lib/constants'
import { Pencil, Search, Trash2 } from 'lucide-react'

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hoje'
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem'

  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

interface TransactionsTableProps {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.category ?? '').toLowerCase().includes(q) ||
          (t.paymentMethod ?? '').toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, search])

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7280]" />
        <Input
          placeholder="Buscar por descricao, categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center text-sm font-medium text-[#A1A7B3]">
            Nenhuma transacao encontrada.
          </div>
        ) : (
          filtered.map((t) => {
            const CatIcon = getCategoryIcon(t.category ?? 'Outros')
            const PayIcon = getPaymentIcon(t.paymentMethod ?? 'Outros')
            const isIncome = t.type === 'income'

            return (
              <div
                key={t.id}
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 shadow-sm shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[#A1A7B3]">
                  <CatIcon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {t.description || 'Sem descricao'}
                    </p>
                    <span className="text-xs font-medium text-[#6B7280]">{formatDate(t.date)}</span>
                  </div>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs font-medium text-[#A1A7B3]">
                    <span className="truncate">{t.category ?? 'Outros'}</span>
                    <span className="text-[#6B7280]">/</span>
                    <span className="inline-flex min-w-0 items-center gap-1 truncate">
                      <PayIcon className="size-3.5 shrink-0" />
                      {t.paymentMethod ?? 'Outros'}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <p className={`text-right text-sm font-semibold ${isIncome ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <div className="flex items-center gap-1 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                    <Button variant="ghost" size="icon-sm" onClick={() => onEdit(t)} aria-label="Editar transacao">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(t.id)}
                      aria-label="Excluir transacao"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
