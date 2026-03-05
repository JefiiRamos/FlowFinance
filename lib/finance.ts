export interface IncomeEntry {
  id: string
  description: string
  amount: number
  startMonth: number // 1-12
  endMonth: number   // 1-12
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  date: string // ISO date YYYY-MM-DD
  category?: string
  paymentMethod?: string
}

export interface MonthlyProjection {
  month: number
  monthName: string
  income: number
  recommendedSpending: number
  balance: number
  accumulatedBalance: number
  status: 'positive' | 'negative' | 'neutral'
}

export interface FinancialSummary {
  totalAnnual: number
  monthlyAverage: number
  safeMonthlySpending: number
  annualSavings: number
  reserveGoal: number
  monthlyProjections: MonthlyProjection[]
}

export const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export const MONTH_NAMES_FULL = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function calculateMonthlyIncome(entries: IncomeEntry[]): number[] {
  const monthly = Array(12).fill(0)

  for (const entry of entries) {
    const start = entry.startMonth - 1
    const end = entry.endMonth - 1

    if (start <= end) {
      for (let i = start; i <= end; i++) {
        monthly[i] += entry.amount
      }
    } else {
      // Handles wrap-around (e.g., Nov-Feb)
      for (let i = start; i < 12; i++) {
        monthly[i] += entry.amount
      }
      for (let i = 0; i <= end; i++) {
        monthly[i] += entry.amount
      }
    }
  }

  return monthly
}

export function calculateFinancialSummary(
  entries: IncomeEntry[],
  safetyMargin: number = 0.85,
  reserveGoal: number = 0
): FinancialSummary {
  const monthlyIncome = calculateMonthlyIncome(entries)
  const totalAnnual = monthlyIncome.reduce((acc, val) => acc + val, 0)
  const monthlyAverage = totalAnnual / 12
  const safeMonthlySpending = monthlyAverage * safetyMargin
  const annualSavings = totalAnnual - safeMonthlySpending * 12

  let accumulated = 0
  const monthlyProjections: MonthlyProjection[] = monthlyIncome.map((income, i) => {
    const balance = income - safeMonthlySpending
    accumulated += balance
    return {
      month: i + 1,
      monthName: MONTH_NAMES[i],
      income,
      recommendedSpending: safeMonthlySpending,
      balance,
      accumulatedBalance: accumulated,
      status: balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral',
    }
  })

  return {
    totalAnnual,
    monthlyAverage,
    safeMonthlySpending,
    annualSavings,
    reserveGoal,
    monthlyProjections,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export const DEFAULT_ENTRIES: IncomeEntry[] = []

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpenses(transactions)
}

export function calculateSummaryFromTransactions(
  transactions: Transaction[]
): { totalIncome: number; totalExpenses: number; balance: number } {
  return {
    totalIncome: getTotalIncome(transactions),
    totalExpenses: getTotalExpenses(transactions),
    balance: getBalance(transactions),
  }
}

/** Média de economia mensal (receita - despesa) a partir das transações do ano atual */
export function getAverageMonthlySurplus(transactions: Transaction[]): number {
  const proj = transactionsToMonthlyProjections(transactions)
  const monthsWithData = proj.filter((p) => p.income > 0 || p.recommendedSpending > 0)
  if (monthsWithData.length === 0) return 0
  const totalSurplus = monthsWithData.reduce((a, p) => a + p.balance, 0)
  return totalSurplus / monthsWithData.length
}

/** Group transactions by month for charts - uses current year */
export function transactionsToMonthlyProjections(
  transactions: Transaction[]
): MonthlyProjection[] {
  const monthlyIncome = Array(12).fill(0)
  const monthlyExpenses = Array(12).fill(0)
  const now = new Date()
  const currentYear = now.getFullYear()

  for (const t of transactions) {
    const d = new Date(t.date)
    if (d.getFullYear() !== currentYear) continue
    const monthIndex = d.getMonth()
    if (t.type === 'income') monthlyIncome[monthIndex] += t.amount
    else monthlyExpenses[monthIndex] += t.amount
  }

  let accumulated = 0
  return monthlyIncome.map((income, i) => {
    const recommendedSpending = monthlyExpenses[i]
    const balance = income - recommendedSpending
    accumulated += balance
    return {
      month: i + 1,
      monthName: MONTH_NAMES[i],
      income,
      recommendedSpending,
      balance,
      accumulatedBalance: accumulated,
      status: balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral',
    }
  })
}

/** Categoria que mais gasta (a partir de transacoes expense) */
export function getTopSpendingCategory(transactions: Transaction[]): { category: string; amount: number } | null {
  const byCat: Record<string, number> = {}
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const cat = t.category ?? 'Outros'
    byCat[cat] = (byCat[cat] ?? 0) + t.amount
  }
  const entries = Object.entries(byCat)
  if (entries.length === 0) return null
  const top = entries.reduce((a, b) => (a[1] >= b[1] ? a : b))
  return { category: top[0], amount: top[1] }
}

/** Media de gastos mensal (ultimos 12 meses) */
export function getAverageMonthlyExpenses(transactions: Transaction[]): number {
  const byMonth: Record<string, number> = {}
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    byMonth[key] = (byMonth[key] ?? 0) + t.amount
  }
  const values = Object.values(byMonth)
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

/**
 * Projecao de saldo no final do mes.
 * Conservadora: nao assume receitas futuras (salario costuma vir 1x), apenas projeta gastos.
 * Formula: Saldo atual - (gastos projetados no resto do mes)
 */
export function getProjectedEndOfMonthBalance(
  transactions: Transaction[],
  currentBalance: number
): number {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const daysLeft = Math.max(0, daysInMonth - dayOfMonth)

  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const monthlyExpenses = getTotalExpenses(currentMonthTx)
  const dailyExpenseRate = dayOfMonth > 0 ? monthlyExpenses / dayOfMonth : 0
  const projectedExpensesRest = dailyExpenseRate * daysLeft
  return currentBalance - projectedExpensesRest
}

/** Create FinancialSummary from transactions for chart compatibility */
export function financialSummaryFromTransactions(
  transactions: Transaction[]
): FinancialSummary {
  const { totalIncome, totalExpenses, balance } = calculateSummaryFromTransactions(transactions)
  const monthlyProjections = transactionsToMonthlyProjections(transactions)
  const avgMonthly = monthlyProjections.reduce((a, p) => a + p.income, 0) / 12
  const avgExpenses = monthlyProjections.reduce((a, p) => a + p.recommendedSpending, 0) / 12

  return {
    totalAnnual: totalIncome,
    monthlyAverage: avgMonthly || 0,
    safeMonthlySpending: avgExpenses || 0,
    annualSavings: balance,
    reserveGoal: 0,
    monthlyProjections,
  }
}
