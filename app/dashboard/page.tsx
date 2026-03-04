'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, User, LogOut } from 'lucide-react'
import { clearAuth, getToken } from '@/lib/auth'
import { isAuthenticated } from '@/lib/auth'
import { TransactionsForm } from '@/components/transactions-form'
import {
  calculateSummaryFromTransactions,
  financialSummaryFromTransactions,
  getAverageMonthlySurplus,
} from '@/lib/finance'
import { useTransactions } from '@/hooks/use-transactions'
import dynamic from 'next/dynamic'
import { DashboardSummaryRow } from '@/components/dashboard-summary-row'
import { IncomeChartCompact } from '@/components/income-chart-compact'
import { IncomeVsSpendingChart } from '@/components/income-vs-spending-chart'
import { CashFlowCards } from '@/components/cash-flow-cards'
import { AccumulatedChart } from '@/components/accumulated-chart'
import { ExpensesPieChart } from '@/components/expenses-pie-chart'
import { GoalsSection } from '@/components/goals-section'
import { BudgetTable } from '@/components/budget-table'
import { RecurringExpensesList } from '@/components/recurring-expenses-list'
import { TransactionsTable } from '@/components/transactions-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Transaction } from '@/lib/finance'

const Grainient = dynamic(() => import('@/components/grainient').then((m) => m.Grainient), {
  ssr: false,
})

export default function DashboardPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  const { transactions, isLoading, addTransaction, editTransaction, removeTransaction } = useTransactions()

  const { totalIncome, totalExpenses, balance } = useMemo(
    () => calculateSummaryFromTransactions(transactions),
    [transactions]
  )
  const summary = useMemo(
    () => financialSummaryFromTransactions(transactions),
    [transactions]
  )
  const monthlySurplus = useMemo(
    () => getAverageMonthlySurplus(transactions),
    [transactions]
  )

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      <div className="fixed inset-0 -z-10">
        <Grainient
          color1="#5227FF"
          color2="#0a0615"
          color3="#0d0a18"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
          className="h-full w-full"
        />
      </div>

      <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
          <span className="text-lg font-semibold text-foreground">FlowFinance</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Notificações"
          >
            <Bell className="size-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Perfil"
          >
            <User className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Sair"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            onClick={async () => {
              const token = getToken()
              if (token) {
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` },
                }).catch(() => {})
              }
              clearAuth()
              router.push('/login')
              router.refresh()
            }}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 md:p-4">
        <DashboardSummaryRow
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}
        />

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[260px_1fr]">
          <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur lg:sticky lg:top-4 lg:h-fit">
            <TransactionsForm
              transactions={transactions}
              onAdd={addTransaction}
              onEdit={editTransaction}
              onDelete={removeTransaction}
              isLoading={isLoading}
              externalEdit={editingTransaction}
              onEditClose={() => setEditingTransaction(null)}
            />
          </div>

          <div className="min-w-0 flex-1">
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="mb-3 w-full justify-start border border-white/10 bg-black/20">
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
                <TabsTrigger value="goals">Metas e Orçamento</TabsTrigger>
                <TabsTrigger value="recurring">Despesas fixas</TabsTrigger>
              </TabsList>
              <TabsContent value="transactions" className="mt-0">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                  <TransactionsTable
                    transactions={transactions}
                    onEdit={(t) => setEditingTransaction(t)}
                    onDelete={removeTransaction}
                  />
                </div>
              </TabsContent>
              <TabsContent value="charts" className="mt-0 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur">
                    <IncomeVsSpendingChart summary={summary} />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur">
                    <ExpensesPieChart transactions={transactions} />
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur">
                  <AccumulatedChart summary={summary} />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur">
                  <IncomeChartCompact summary={summary} />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Fluxo por mês</h3>
                  <CashFlowCards summary={summary} />
                </div>
              </TabsContent>
              <TabsContent value="goals" className="mt-0 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur">
                    <GoalsSection balance={balance} />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur overflow-hidden">
                    <BudgetTable transactions={transactions} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="recurring" className="mt-0">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                  <RecurringExpensesList />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
