/**
 * Simulador de Cenários - lógica de projeção financeira
 * Base: média mensal dos últimos 3 meses (ou último mês se insuficiente)
 * saldo_mes = saldo_mes_anterior + receita - gasto - parcelas - investimentos
 */

import { type Transaction, MONTH_NAMES, calculateSummaryFromTransactions } from './finance'

export type AdjustmentType =
  | 'aumentar_receita'
  | 'reduzir_receita'
  | 'aumentar_gasto'
  | 'reduzir_gasto'
  | 'despesa_fixa'
  | 'parcelamento'
  | 'investimento_mensal'

export type StartWhen = 'mes_atual' | 'proximo_mes' | 'escolher_mes'
export type Duration = '1' | '3' | '6' | '12' | 'continuo'

export interface ScenarioAdjustment {
  id: string
  type: AdjustmentType
  description: string
  value: number
  category?: string
  account?: string
  startWhen: StartWhen
  startMonthOffset: number // 0 = atual, 1 = próximo, etc
  duration: Duration
  durationMonths: number
  numInstallments?: number
  valuePerInstallment?: number
  active: boolean
  order: number
}

export interface SimulatorBase {
  avgMonthlyIncome: number
  avgMonthlyExpenses: number
  currentBalance: number
  avgMonthlySavings: number
  avgSavingsPercent: number
  hasEnoughData: boolean
}

export interface MonthProjection {
  monthIndex: number
  monthName: string
  year: number
  balance: number
  income: number
  expense: number
  savings: number
  isNegative: boolean
}

export interface SimulatorResult {
  base: SimulatorBase
  currentScenario: MonthProjection[]
  adjustedScenario: MonthProjection[]
  periodMonths: number
  currentFinalBalance: number
  adjustedFinalBalance: number
  currentTotalSavings: number
  adjustedTotalSavings: number
  currentAvgMonthlySurplus: number
  adjustedAvgMonthlySurplus: number
  currentBestMonth: { month: string; value: number }
  currentWorstMonth: { month: string; value: number }
  adjustedBestMonth: { month: string; value: number }
  adjustedWorstMonth: { month: string; value: number }
  riskMonth: string | null
  isHealthy: boolean
  suggestionToBreakEven: number | null
  categoryTotals: Record<string, number>
}

function getMonthlyData(transactions: Transaction[]): { income: number[]; expense: number[] } {
  const now = new Date()
  const incomeByMonth: Record<string, number> = {}
  const expenseByMonth: Record<string, number> = {}

  for (const t of transactions) {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (t.type === 'income') {
      incomeByMonth[key] = (incomeByMonth[key] ?? 0) + t.amount
    } else {
      expenseByMonth[key] = (expenseByMonth[key] ?? 0) + t.amount
    }
  }

  const last3Keys = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    last3Keys.push(`${d.getFullYear()}-${d.getMonth()}`)
  }

  const income = last3Keys.map((k) => incomeByMonth[k] ?? 0)
  const expense = last3Keys.map((k) => expenseByMonth[k] ?? 0)
  return { income, expense }
}

export function computeBaseFromTransactions(transactions: Transaction[]): SimulatorBase {
  const { income, expense } = getMonthlyData(transactions)
  const hasData = income.some((v) => v > 0) || expense.some((v) => v > 0)
  const totalIncome = income.reduce((a, b) => a + b, 0)
  const totalExpense = expense.reduce((a, b) => a + b, 0)
  const count = income.length
  const avgMonthlyIncome = count > 0 ? totalIncome / count : 0
  const avgMonthlyExpenses = count > 0 ? totalExpense / count : 0
  const avgMonthlySavings = avgMonthlyIncome - avgMonthlyExpenses
  const avgSavingsPercent = avgMonthlyIncome > 0 ? (avgMonthlySavings / avgMonthlyIncome) * 100 : 0

  const { balance } = calculateSummaryFromTransactions(transactions)

  return {
    avgMonthlyIncome,
    avgMonthlyExpenses,
    currentBalance: balance,
    avgMonthlySavings,
    avgSavingsPercent,
    hasEnoughData: hasData || transactions.length > 0,
  }
}

function getIncomeDelta(adj: ScenarioAdjustment): number {
  if (!adj.active) return 0
  switch (adj.type) {
    case 'aumentar_receita':
      return adj.value
    case 'reduzir_receita':
      return -adj.value
    default:
      return 0
  }
}

function getExpenseDelta(adj: ScenarioAdjustment, _monthIndex: number): number {
  if (!adj.active) return 0
  switch (adj.type) {
    case 'aumentar_gasto':
      return adj.value
    case 'reduzir_gasto':
      return -adj.value
    case 'despesa_fixa':
      return adj.value
    case 'parcelamento':
      return 0 // handled by getParcelamentoAmount per month
    default:
      return 0
  }
}

function getInvestmentDelta(adj: ScenarioAdjustment): number {
  if (!adj.active || adj.type !== 'investimento_mensal') return 0
  return adj.value
}

function isAdjustmentActiveInMonth(
  adj: ScenarioAdjustment,
  monthIndex: number
): boolean {
  if (!adj.active) return false
  const startMonth = adj.startMonthOffset
  if (monthIndex < startMonth) return false
  if (adj.type === 'parcelamento') {
    const n = adj.numInstallments ?? 1
    return monthIndex < startMonth + n
  }
  if (adj.duration === 'continuo') return true
  const endMonth = startMonth + adj.durationMonths - 1
  return monthIndex <= endMonth
}

function getParcelamentoAmount(adj: ScenarioAdjustment, monthIndex: number): number {
  if (!adj.active || adj.type !== 'parcelamento') return 0
  const startMonth = adj.startMonthOffset
  const n = adj.numInstallments ?? 1
  const v = adj.valuePerInstallment ?? adj.value / n
  const parcelIndex = monthIndex - startMonth
  if (parcelIndex < 0 || parcelIndex >= n) return 0
  return v
}

export function runSimulation(
  base: SimulatorBase,
  adjustments: ScenarioAdjustment[],
  periodMonths: number
): SimulatorResult {
  const sortedAdj = [...adjustments].sort((a, b) => a.order - b.order)
  const currentScenario: MonthProjection[] = []
  const adjustedScenario: MonthProjection[] = []
  const now = new Date()
  const categoryTotals: Record<string, number> = {}

  for (let i = 0; i < periodMonths; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthName = MONTH_NAMES[d.getMonth()]
    const year = d.getFullYear()
    const label = `${monthName}/${year}`

    const baseIncome = base.avgMonthlyIncome
    const baseExpense = base.avgMonthlyExpenses
    const prevBalanceCurrent = i === 0 ? base.currentBalance : currentScenario[i - 1].balance
    const prevBalanceAdj = i === 0 ? base.currentBalance : adjustedScenario[i - 1].balance

    let adjIncome = 0
    let adjExpense = 0
    let adjInvestment = 0

    for (const adj of sortedAdj) {
      if (!isAdjustmentActiveInMonth(adj, i)) continue
      adjIncome += getIncomeDelta(adj)
      adjExpense += getExpenseDelta(adj, i)
      adjExpense += getParcelamentoAmount(adj, i)
      adjInvestment += getInvestmentDelta(adj)
      const thisExp = getExpenseDelta(adj, i) + getParcelamentoAmount(adj, i)
      if (adj.category && thisExp > 0) {
        categoryTotals[adj.category] = (categoryTotals[adj.category] ?? 0) + thisExp
      }
    }

    const currIncome = baseIncome
    const currExpense = baseExpense
    const currSavings = currIncome - currExpense
    const currBalance = prevBalanceCurrent + currSavings

    const adjInc = baseIncome + adjIncome
    const adjExp = baseExpense + adjExpense + adjInvestment
    const adjSavings = adjInc - adjExp
    const adjBalance = prevBalanceAdj + adjSavings

    currentScenario.push({
      monthIndex: i,
      monthName: label,
      year,
      balance: currBalance,
      income: currIncome,
      expense: currExpense,
      savings: currSavings,
      isNegative: currBalance < 0,
    })

    adjustedScenario.push({
      monthIndex: i,
      monthName: label,
      year,
      balance: adjBalance,
      income: adjInc,
      expense: adjExp,
      savings: adjSavings,
      isNegative: adjBalance < 0,
    })
  }

  const currentFinalBalance = currentScenario[periodMonths - 1]?.balance ?? base.currentBalance
  const adjustedFinalBalance = adjustedScenario[periodMonths - 1]?.balance ?? base.currentBalance
  const currentTotalSavings = currentScenario.reduce((a, m) => a + m.savings, 0)
  const adjustedTotalSavings = adjustedScenario.reduce((a, m) => a + m.savings, 0)
  const currentAvgMonthlySurplus = periodMonths > 0 ? currentTotalSavings / periodMonths : 0
  const adjustedAvgMonthlySurplus = periodMonths > 0 ? adjustedTotalSavings / periodMonths : 0

  const getBestWorst = (arr: MonthProjection[]) => {
    if (arr.length === 0) return { best: { month: '-', value: 0 }, worst: { month: '-', value: 0 } }
    const byBalance = [...arr].sort((a, b) => b.balance - a.balance)
    return {
      best: { month: byBalance[0].monthName, value: byBalance[0].balance },
      worst: { month: byBalance[byBalance.length - 1].monthName, value: byBalance[byBalance.length - 1].balance },
    }
  }

  const currentBW = getBestWorst(currentScenario)
  const adjustedBW = getBestWorst(adjustedScenario)

  const riskMonth = adjustedScenario.find((m) => m.isNegative)?.monthName ?? null
  const isHealthy = !riskMonth

  let suggestionToBreakEven: number | null = null
  if (riskMonth && base.avgMonthlyIncome > 0) {
    const negMonth = adjustedScenario.find((m) => m.isNegative)
    if (negMonth) {
      const monthsUntilNeg = negMonth.monthIndex
      const deficit = Math.abs(negMonth.balance)
      const needPerMonth = deficit / Math.max(1, monthsUntilNeg)
      suggestionToBreakEven = Math.ceil(needPerMonth / 10) * 10
    }
  }

  return {
    base,
    currentScenario,
    adjustedScenario,
    periodMonths,
    currentFinalBalance,
    adjustedFinalBalance,
    currentTotalSavings,
    adjustedTotalSavings,
    currentAvgMonthlySurplus,
    adjustedAvgMonthlySurplus,
    currentBestMonth: currentBW.best,
    currentWorstMonth: currentBW.worst,
    adjustedBestMonth: adjustedBW.best,
    adjustedWorstMonth: adjustedBW.worst,
    riskMonth,
    isHealthy,
    suggestionToBreakEven,
    categoryTotals,
  }
}

export const ADJUSTMENT_TYPE_LABELS: Record<AdjustmentType, string> = {
  aumentar_receita: 'Aumentar receita',
  reduzir_receita: 'Reduzir receita',
  aumentar_gasto: 'Aumentar gasto',
  reduzir_gasto: 'Reduzir gasto',
  despesa_fixa: 'Despesa fixa (recorrente)',
  parcelamento: 'Parcelamento',
  investimento_mensal: 'Investimento mensal',
}

export const DURATION_LABELS: Record<Duration, string> = {
  '1': '1 mês',
  '3': '3 meses',
  '6': '6 meses',
  '12': '12 meses',
  continuo: 'Contínuo',
}
