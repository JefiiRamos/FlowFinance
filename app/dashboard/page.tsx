'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type TransitionEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { clearAuth, getToken, getUser } from '@/lib/auth'
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
import { cn } from '@/lib/utils'
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
  const [assistantShellMounted, setAssistantShellMounted] = useState(false)
  const [assistantShellOpen, setAssistantShellOpen] = useState(false)
  const assistantOpenRef = useRef(assistantOpen)
  const assistantExitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const user = getUser()
  const currentDateLabel = useMemo(
    () => new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    }).format(new Date()),
    []
  )
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }, [])
  assistantOpenRef.current = assistantOpen

  const toggleAssistant = useCallback(() => {
    setAssistantOpen((o) => !o)
  }, [])

  useEffect(() => {
    const token = getToken()
    if (!token || !isAuthenticated()) {
      router.replace('/login')
      return
    }

    const controller = new AbortController()

    async function validateSession() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })

        if (res.status === 401) {
          router.replace('/login')
          return
        }

        const data = await res.json().catch(() => null)
        if (!res.ok || !data) {
          router.replace('/login')
          return
        }

        if (!data.onboardingCompleted) {
          router.replace('/onboarding')
          return
        }

        setAuthChecked(true)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          router.replace('/login')
        }
      }
    }

    validateSession()
    return () => controller.abort()
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
    if (!lgUp) {
      if (assistantExitTimerRef.current) {
        clearTimeout(assistantExitTimerRef.current)
        assistantExitTimerRef.current = null
      }
      setAssistantShellMounted(false)
      setAssistantShellOpen(false)
    }
  }, [lgUp])

  useLayoutEffect(() => {
    if (!lgUp || !assistantOpen) return
    setAssistantShellMounted(true)
    setAssistantShellOpen(false)
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setAssistantShellOpen(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [assistantOpen, lgUp])

  useEffect(() => {
    if (!lgUp || assistantOpen) return
    if (!assistantShellMounted) return
    setAssistantShellOpen(false)
    if (assistantExitTimerRef.current) clearTimeout(assistantExitTimerRef.current)
    assistantExitTimerRef.current = setTimeout(() => {
      assistantExitTimerRef.current = null
      setAssistantShellMounted(false)
    }, 400)
    return () => {
      if (assistantExitTimerRef.current) {
        clearTimeout(assistantExitTimerRef.current)
        assistantExitTimerRef.current = null
      }
    }
  }, [assistantOpen, lgUp, assistantShellMounted])

  const handleAssistantShellTransitionEnd = useCallback((e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.propertyName !== 'transform') return
    if (assistantOpenRef.current) return
    if (assistantExitTimerRef.current) {
      clearTimeout(assistantExitTimerRef.current)
      assistantExitTimerRef.current = null
    }
    setAssistantShellMounted(false)
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

  const { transactions, isLoading, addTransaction, editTransaction, removeTransaction, refetch } = useTransactions()

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

  // Quando o usuÃ¡rio clica no FAB em outra aba, trocamos para "transacoes"
  // e abrimos o modal assim que o formulÃ¡rio estiver montado.
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
      assistantOverlayOpen={assistantOpen || assistantShellMounted}
      onAssistantSidebarClick={toggleAssistant}
    >
      <div className="fixed inset-0 -z-10 bg-[#090B10]" />

      <div className="mx-auto w-full max-w-[1700px] space-y-8 p-5 sm:p-6 lg:p-8">

        <div className="sticky top-0 z-20 flex flex-col gap-5 rounded-2xl border border-white/5 bg-[#0F131C]/85 px-5 py-5 shadow-lg shadow-black/20 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:px-6">
          {/* HEADER DAS SEÃ‡Ã•ES */}
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
              {currentDateLabel}
            </p>
            <h1 className="text-4xl font-semibold tracking-normal text-white">
              {greeting}, {user?.name ?? 'Usuario'}
            </h1>

            <p className="mt-2 text-sm font-medium text-[#A1A7B3]">
              Gerencie sua vida financeira com simplicidade.
            </p>
          </div>

          <PeriodFilter
            value={period}
            onChange={setPeriod}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
          />
        </div>

        {section === 'inicio' && (
          <div className="space-y-8">

            {/* KPI CARDS */}
            <SummaryCards
              balance={balance}
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
              monthlySavings={monthlySavings}
              savingsPercent={savingsPercent}
              projectedBalance={projectedBalance}
            />

            {/* GRID PRINCIPAL */}
            <div className="grid gap-5 xl:grid-cols-[1fr_340px]">

              {/* LADO ESQUERDO */}
              <div className="space-y-5">

                <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924] sm:p-6">
                  <IncomeVsSpendingChart summary={summary} />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924] sm:p-6">
                    <ExpensesPieChart transactions={transactions} />
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924] sm:p-6">
                    <AccumulatedChart summary={summary} />
                  </div>
                </div>
              </div>

              {/* PAINEL LATERAL */}
              <div className="space-y-5">

                <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924] sm:p-6">
                  <FinancialIntelligence
                    transactions={transactions}
                    monthlyExpenses={monthlyExpenses}
                    monthlyIncome={monthlyIncome}
                    balance={balance}
                    projectedBalance={projectedBalance}
                  />
                </div>

                {/* <div className="rounded-3xl border border-white/10 bg-card p-6">
                  <h3 className="mb-4 text-sm font-semibold">
                    Ãšltimas transaÃ§Ãµes
                  </h3>

                  <TransactionsTable
                    transactions={[...transactions]
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .slice(0, 5)}
                    onEdit={(t) => setEditingTransaction(t)}
                    onDelete={removeTransaction}
                  />
                </div> */}

              </div>

            </div>

          </div>
        )}

        {section === 'transacoes' && (
          <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[300px_1fr]">
            <div className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0F131C]/90 shadow-lg shadow-black/20 backdrop-blur-xl lg:sticky lg:top-28 lg:h-fit">
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
            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280] sm:mr-auto">Filtrar</span>
                <PeriodFilter value={period} onChange={setPeriod} customRange={customRange} onCustomRangeChange={setCustomRange} />
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
                <TransactionsTable transactions={filteredTransactions} onEdit={(t) => setEditingTransaction(t)} onDelete={removeTransaction} />
              </div>
            </div>
          </div>
        )}

        {section === 'graficos' && (
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
                <ExpensesPieChart transactions={transactions} />
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
                <AccumulatedChart summary={summary} />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
                <IncomeVsSpendingChart summary={summary} />
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
                <IncomeChartCompact summary={summary} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">Comparacao mensal</h3>
              <CashFlowCards summary={summary} />
            </div>
          </div>
        )}

        {section === 'simulador' && (
          <ScenarioSimulator transactions={transactions} />
        )}

        {section === 'metas' && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
              <GoalsSection balance={balance} />
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
              <BudgetTable transactions={transactions} />
            </div>
          </div>
        )}

        {section === 'despesas-fixas' && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
              <RecurringIncomeList />
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
              <RecurringExpensesList />
            </div>
          </div>
        )}

        {section === 'contas' && (
          <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-8 shadow-lg shadow-black/20 backdrop-blur-xl">
            <p className="text-center text-muted-foreground">Contas e carteiras em breve.</p>
          </div>
        )}

        {section === 'relatorios' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-foreground">Analise e exportacao</h3>
              <ExportReportsButton transactions={transactions} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
                <ExpensesPieChart transactions={transactions} />
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
                <AccumulatedChart summary={summary} />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
                <IncomeVsSpendingChart summary={summary} />
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
                <IncomeChartCompact summary={summary} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0F131C]/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#141924]">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">Comparacao mensal</h3>
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
        className="fixed bottom-28 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-[#7E8BFF] active:scale-95 lg:bottom-8 lg:right-8 lg:h-14 lg:w-14"
        aria-label="Nova Transacao"
      >
        <Plus className="size-8" />
      </button>

      {assistantShellMounted && lgUp && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[52] hidden bg-black/40 backdrop-blur-[1px] lg:block"
            style={{
              opacity: assistantShellOpen ? 1 : 0,
              pointerEvents: assistantShellOpen ? 'auto' : 'none',
              transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'opacity',
            }}
            aria-label="Fechar assistente"
            onClick={() => setAssistantOpen(false)}
          />
          <div
            className={cn(
              'fixed bottom-6 right-4 z-[55] hidden lg:block',
              !assistantShellOpen && 'pointer-events-none'
            )}
          >
            <AssistantChatPanel
              layout="overlay"
              overlayMotionOpen={assistantShellOpen}
              onOverlayShellTransitionEnd={handleAssistantShellTransitionEnd}
              onClose={() => setAssistantOpen(false)}
              onTransactionCreated={refetch}
            />
          </div>
        </>
      )}
    </AppShell>
  )
}
