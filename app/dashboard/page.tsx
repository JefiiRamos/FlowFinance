'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { clearAuth, getToken } from '@/lib/auth'
import { isAuthenticated } from '@/lib/auth'
import { TransactionsForm } from '@/components/transactions-form'
import {
  calculateSummaryFromTransactions,
  financialSummaryFromTransactions,
  getTotalIncome,
  getTotalExpenses,
  getProjectedEndOfMonthBalance,
} from '@/lib/finance'
import { useTransactions } from '@/hooks/use-transactions'
import dynamic from 'next/dynamic'
import { IncomeChartCompact } from '@/components/income-chart-compact'
import { IncomeVsSpendingChart } from '@/components/income-vs-spending-chart'
import { CashFlowCards } from '@/components/cash-flow-cards'
import { AccumulatedChart } from '@/components/accumulated-chart'
import { ExpensesPieChart } from '@/components/expenses-pie-chart'
import { GoalsSection } from '@/components/goals-section'
import { ScenarioSimulator } from '@/components/scenario-simulator'
import { BudgetTable } from '@/components/budget-table'
import { RecurringExpensesList } from '@/components/recurring-expenses-list'
import { RecurringIncomeList } from '@/components/recurring-income-list'
import { TransactionsTable } from '@/components/transactions-table'
import { AppShell, type NavSection } from '@/components/dashboard/app-shell'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { PeriodFilter, type PeriodValue } from '@/components/dashboard/period-filter'
import { FinancialIntelligence } from '@/components/dashboard/financial-intelligence'
import { ExportReportsButton } from '@/components/dashboard/export-reports-button'
import { AssistantChatPanel } from '@/components/assistant-chat-panel'
import { useLgUp } from '@/hooks/use-lg-up'
import type { Transaction } from '@/lib/finance'
import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth, subMonths } from 'date-fns'

const Grainient = dynamic(() => import('@/components/grainient').then((m) => m.Grainient), {
  ssr: false,
})

function getDateRangeForPeriod(
  value: PeriodValue,
  customRange?: { from: Date; to: Date }
): { from: Date; to: Date } {
  const now = new Date()
  switch (value) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) }
    case '7d':
      return { from: startOfDay(addDays(now, -6)), to: endOfDay(now) }
    case 'month':
      return { from: startOfMonth(now), to: endOfDay(now) }
    case 'lastMonth': {
      const last = subMonths(now, 1)
      return { from: startOfMonth(last), to: endOfMonth(last) }
    }
    case 'custom':
      return customRange ?? { from: startOfMonth(now), to: endOfDay(now) }
    default:
      return { from: startOfMonth(now), to: endOfDay(now) }
  }
}

function filterTransactionsByPeriod(
  transactions: Transaction[],
  value: PeriodValue,
  customRange?: { from: Date; to: Date }
): Transaction[] {
  const { from, to } = getDateRangeForPeriod(value, customRange)
  const fromTime = from.getTime()
  const toTime = to.getTime()
  return transactions.filter((t) => {
    const tTime = new Date(t.date).getTime()
    return tTime >= fromTime && tTime <= toTime
  })
}

function getCurrentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  return transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [section, setSection] = useState<NavSection>('inicio')
  const [pendingOpenAdd, setPendingOpenAdd] = useState(false)
  const [period, setPeriod] = useState<PeriodValue>('month')
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>()
  const openAddRef = useRef<{ open: (type?: import('@/lib/finance').TransactionType) => void } | null>(null)
  const lgUp = useLgUp()
  const [assistantOpen, setAssistantOpen] = useState(false)

  const toggleAssistant = useCallback(() => {
    setAssistantOpen((o) => !o)
  }, [])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const q = new URLSearchParams(window.location.search).get('assistant')
    if (q === '1') {
      setAssistantOpen(true)
      router.replace('/dashboard', { scroll: false })
    }
  }, [router])

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const onNarrow = (e: MediaQueryListEvent) => {
      if (!e.matches) setAssistantOpen(false)
    }
    mql.addEventListener('change', onNarrow)
    return () => mql.removeEventListener('change', onNarrow)
  }, [])

  useEffect(() => {
    if (!assistantOpen || !lgUp) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAssistantOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [assistantOpen, lgUp])

  const handleLogout = useCallback(async () => {
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
  }, [router])

  const { transactions, isLoading, addTransaction, editTransaction, removeTransaction } = useTransactions()

  const currentMonthTx = useMemo(() => getCurrentMonthTransactions(transactions), [transactions])
  const monthlyIncome = useMemo(() => getTotalIncome(currentMonthTx), [currentMonthTx])
  const monthlyExpenses = useMemo(() => getTotalExpenses(currentMonthTx), [currentMonthTx])
  const monthlySavings = monthlyIncome - monthlyExpenses
  const savingsPercent = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0

  const { balance } = useMemo(
    () => calculateSummaryFromTransactions(transactions),
    [transactions]
  )

  const projectedBalance = useMemo(
    () => getProjectedEndOfMonthBalance(transactions, balance),
    [transactions, balance]
  )

  const filteredTransactions = useMemo(
    () => filterTransactionsByPeriod(transactions, period, customRange),
    [transactions, period, customRange]
  )

  const summary = useMemo(
    () => financialSummaryFromTransactions(transactions),
    [transactions]
  )

  // Quando o usuário clica no FAB em outra aba, trocamos para "transacoes"
  // e abrimos o modal assim que o formulário estiver montado.
  useEffect(() => {
    if (section === 'transacoes' && pendingOpenAdd && openAddRef.current) {
      openAddRef.current.open()
      setPendingOpenAdd(false)
    }
  }, [section, pendingOpenAdd])

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AppShell
      section={section}
      onSectionChange={setSection}
      onLogout={handleLogout}
      assistantNavUsesLink={!lgUp}
      assistantOverlayOpen={assistantOpen}
      onAssistantSidebarClick={toggleAssistant}
    >
      <div className="fixed inset-0 -z-10">
        <Grainient
          color1="#7c3aed"
          color2="#0c0a14"
          color3="#1e1b2e"
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

      <div className="flex flex-col gap-3 p-3 md:p-4">
        <SummaryCards
          balance={balance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          monthlySavings={monthlySavings}
          savingsPercent={savingsPercent}
          projectedBalance={projectedBalance}
        />

        {section === 'inicio' && (
          <>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
            <FinancialIntelligence
              transactions={transactions}
              monthlyExpenses={monthlyExpenses}
              monthlyIncome={monthlyIncome}
              balance={balance}
              projectedBalance={projectedBalance}
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Ultimas transacoes</h3>
              <button
                type="button"
                onClick={() => setSection('transacoes')}
                className="text-xs font-medium text-violet-400 hover:text-violet-300"
              >
                Ver todas
              </button>
            </div>
            <TransactionsTable
              transactions={[...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)}
              onEdit={(t) => setEditingTransaction(t)}
              onDelete={removeTransaction}
            />
          </div>
          </>
        )}

        {section === 'transacoes' && (
          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[260px_1fr]">
            <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-xl lg:sticky lg:top-4 lg:h-fit">
              <TransactionsForm
                transactions={transactions}
                onAdd={addTransaction}
                onEdit={editTransaction}
                onDelete={removeTransaction}
                isLoading={isLoading}
                externalEdit={editingTransaction}
                onEditClose={() => setEditingTransaction(null)}
                openAddRef={openAddRef}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground sm:mr-auto">Filtrar</span>
                <PeriodFilter value={period} onChange={setPeriod} customRange={customRange} onCustomRangeChange={setCustomRange} />
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                <TransactionsTable transactions={filteredTransactions} onEdit={(t) => setEditingTransaction(t)} onDelete={removeTransaction} />
              </div>
            </div>
          </div>
        )}

        {section === 'graficos' && (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
                <ExpensesPieChart transactions={transactions} />
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
                <AccumulatedChart summary={summary} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
                <IncomeVsSpendingChart summary={summary} />
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
                <IncomeChartCompact summary={summary} />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-xl">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Comparacao mensal</h3>
              <CashFlowCards summary={summary} />
            </div>
          </div>
        )}

        {section === 'simulador' && (
          <ScenarioSimulator transactions={transactions} />
        )}

        {section === 'metas' && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur">
              <GoalsSection balance={balance} />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden p-3 backdrop-blur">
              <BudgetTable transactions={transactions} />
            </div>
          </div>
        )}

        {section === 'despesas-fixas' && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur">
              <RecurringIncomeList />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur">
              <RecurringExpensesList />
            </div>
          </div>
        )}

        {section === 'contas' && (
          <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur">
            <p className="text-center text-muted-foreground">Contas e carteiras em breve.</p>
          </div>
        )}

        {section === 'relatorios' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">Analise e exportacao</h3>
              <ExportReportsButton transactions={transactions} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
                <ExpensesPieChart transactions={transactions} />
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
                <AccumulatedChart summary={summary} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
                <IncomeVsSpendingChart summary={summary} />
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
                <IncomeChartCompact summary={summary} />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-xl">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Comparacao mensal</h3>
              <CashFlowCards summary={summary} />
            </div>
          </div>
        )}
      </div>

      {/* FAB - botao grande Nova Transacao */}
      <button
        type="button"
        onClick={() => {
          if (section !== 'transacoes') {
            setPendingOpenAdd(true)
            setSection('transacoes')
          } else {
            openAddRef.current?.open()
          }
        }}
        className="fixed bottom-24 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-110 hover:shadow-2xl active:scale-95 lg:bottom-6 lg:h-16 lg:w-16"
        aria-label="Nova Transacao"
      >
        <Plus className="size-8" />
      </button>

      {assistantOpen && lgUp && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[52] hidden bg-black/40 backdrop-blur-[1px] lg:block"
            aria-label="Fechar assistente"
            onClick={() => setAssistantOpen(false)}
          />
          <div className="fixed bottom-24 right-4 z-[55] hidden lg:block">
            <AssistantChatPanel layout="overlay" onClose={() => setAssistantOpen(false)} />
          </div>
        </>
      )}
    </AppShell>
  )
}
