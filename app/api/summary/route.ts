import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * GET /api/summary
 * Retorna resumo financeiro:
 * - totalIncome, totalExpense, balance
 * - monthlyFlow: fluxo por mês para gráficos
 */
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'asc' },
    })

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    const balance = totalIncome - totalExpense

    // Agrupar por mês (ano-mês) para o fluxo mensal
    const byMonth = new Map<string, { income: number; expense: number }>()

    for (const t of transactions) {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`
      if (!byMonth.has(key)) {
        byMonth.set(key, { income: 0, expense: 0 })
      }
      const row = byMonth.get(key)!
      if (t.type === 'income') row.income += t.amount
      else row.expense += t.amount
    }

    const monthlyFlow = Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { income, expense }]) => {
        const [, monthStr] = key.split('-')
        const monthIndex = parseInt(monthStr, 10) - 1
        return {
          month: MONTH_NAMES[monthIndex],
          income,
          expense,
        }
      })

    return NextResponse.json({
      totalIncome,
      totalExpense,
      balance,
      monthlyFlow,
    })
  } catch (error) {
    console.error('[GET /api/summary]', error)
    return NextResponse.json(
      { error: 'Erro ao calcular resumo' },
      { status: 500 }
    )
  }
}
