'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { formatCurrency } from '@/lib/finance'
import type { Transaction } from '@/lib/finance'
import { toast } from 'sonner'

interface ExportReportsButtonProps {
  transactions: Transaction[]
}

export function ExportReportsButton({ transactions }: ExportReportsButtonProps) {
  const [loading, setLoading] = useState(false)

  function exportCSV() {
    setLoading(true)
    try {
      const headers = 'Data,Descricao,Categoria,Tipo,Forma de pagamento,Valor\n'
      const rows = transactions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((t) => {
          const d = new Date(t.date).toLocaleDateString('pt-BR')
          const desc = `"${(t.description || '').replace(/"/g, '""')}"`
          const cat = t.category ?? 'Outros'
          const tipo = t.type === 'income' ? 'Receita' : 'Gasto'
          const pay = t.paymentMethod ?? 'Outros'
          return `${d},${desc},${cat},${tipo},${pay},${t.amount.toFixed(2)}`
        })
      const csv = headers + rows.join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flowfinance-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Relatorio exportado')
    } catch {
      toast.error('Erro ao exportar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportCSV}
      disabled={loading || transactions.length === 0}
      className="gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/20"
    >
      <Download className="size-4" />
      Exportar CSV
    </Button>
  )
}
