'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { type Transaction, formatCurrency } from '@/lib/finance'
import { getCategoryIcon, getPaymentIcon } from '@/lib/constants'
import { Pencil, Trash2, Search } from 'lucide-react'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por descricao, categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-white/5 border-white/20"
          />
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="text-muted-foreground">Descrição</TableHead>
                <TableHead className="text-muted-foreground">Categoria</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Forma de pagamento</TableHead>
                <TableHead className="text-right text-muted-foreground">Valor</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => {
                  const CatIcon = getCategoryIcon(t.category ?? 'Outros')
                  const PayIcon = getPaymentIcon(t.paymentMethod ?? 'Outros')
                  return (
                    <TableRow key={t.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-xs text-foreground">{formatDate(t.date)}</TableCell>
                      <TableCell className="font-medium text-foreground">{t.description || '—'}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-xs">
                          <CatIcon className="size-3.5 text-muted-foreground" />
                          {t.category ?? 'Outros'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}>
                          {t.type === 'income' ? 'Receita' : 'Gasto'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <PayIcon className="size-3.5" />
                          {t.paymentMethod ?? 'Outros'}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(t)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(t.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
