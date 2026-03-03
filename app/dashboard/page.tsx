'use client'

import Link from 'next/link'
import { ArrowLeft, Bell, User, Menu } from 'lucide-react'
import { TransactionsForm } from '@/components/transactions-form'
import {
  calculateSummaryFromTransactions,
  financialSummaryFromTransactions,
  getAverageMonthlySurplus,
} from '@/lib/finance'
import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { DashboardSummaryRow } from '@/components/dashboard-summary-row'
import { IncomeChartCompact } from '@/components/income-chart-compact'
import { IncomeVsSpendingChart } from '@/components/income-vs-spending-chart'
import { CashFlowCards } from '@/components/cash-flow-cards'
import { GoalCard } from '@/components/goal-card'
import { useTransactions } from '@/hooks/use-transactions'

const Grainient = dynamic(() => import('@/components/grainient').then((m) => m.Grainient), {
  ssr: false,
})

export default function DashboardPage() {
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

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      {/* Grainient background */}
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

      {/* Header */}
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
        <div className="flex items-center gap-2">
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
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Menu"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      {/* Main content - no scroll, fits viewport */}
      <main className="flex min-h-0 flex-1 gap-3 overflow-hidden p-3 md:p-4">
        {/* Left: Transações (Recebi / Gastei) */}
        <div className="flex w-52 shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur lg:w-56">
          <TransactionsForm
            transactions={transactions}
            onAdd={addTransaction}
            onEdit={editTransaction}
            onDelete={removeTransaction}
            isLoading={isLoading}
          />
        </div>

        {/* Right: Dashboard grid */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
          {/* Summary cards row */}
          <DashboardSummaryRow
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
          />

          {/* Objetivo + Charts */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-3">
            <div className="min-h-0">
              <GoalCard balance={balance} monthlySurplus={monthlySurplus} />
            </div>
            <div className="grid min-h-0 grid-cols-1 gap-2 lg:col-span-2 lg:grid-cols-2">
              <div className="min-h-0 overflow-hidden rounded-xl">
                <IncomeChartCompact summary={summary} />
              </div>
              <div className="min-h-0 overflow-hidden rounded-xl">
                <IncomeVsSpendingChart summary={summary} />
              </div>
            </div>
          </div>

          {/* Fluxo de Caixa */}
          <div className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur">
            <CashFlowCards summary={summary} />
          </div>
        </div>
      </main>
    </div>
  )
}
