import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'
import { expenseCategoryDbNameToForm } from '@/lib/expense-category-from-seed'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const userId = await getSessionUserId()

    if (!userId) {
      return NextResponse.json({
        created: 0,
        message: 'Nao autenticado',
      })
    }

    const rules = await prisma.recurringIncome.findMany({
      where: { userId },
    })

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: { userId },
      include: { category: true },
    })

    if (rules.length === 0 && recurringExpenses.length === 0) {
      return NextResponse.json({
        created: 0,
        message: 'Nenhuma regra',
      })
    }

    const now = new Date()
    const year = now.getFullYear()
    const today = now.getDate()
    const currentMonth = now.getMonth() + 1

    let created = 0

    // Sincroniza rendas recorrentes (income)
    for (const rule of rules) {
      const start = rule.startMonth
      const end = rule.endMonth

      const isValidMonth =
        start <= end
          ? currentMonth >= start && currentMonth <= end
          : currentMonth >= start || currentMonth <= end

      if (!isValidMonth) {
        continue
      }

      const lastDay = new Date(year, currentMonth, 0).getDate()

      const day = Math.min(rule.dayOfMonth, lastDay)

      // Ainda não chegou o dia do pagamento
      if (today < day) {
        continue
      }

      const date = new Date(year, currentMonth - 1, day)

      const startOfDay = new Date(
        year,
        currentMonth - 1,
        day,
        0,
        0,
        0
      )

      const endOfDay = new Date(
        year,
        currentMonth - 1,
        day,
        23,
        59,
        59
      )

      const existing = await prisma.transaction.findFirst({
        where: {
          type: 'income',
          description: rule.description,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          userId,
        },
      })

      if (existing) {
        continue
      }

      await prisma.transaction.create({
        data: {
          type: 'income',
          amount: rule.amount,
          date,
          description: rule.description,
          userId,
          category: 'Outros',
          paymentMethod: 'Outros',
        },
      })

      created++
    }

    // Sincroniza despesas recorrentes (expense)
    for (const exp of recurringExpenses) {
      const lastDay = new Date(year, currentMonth, 0).getDate()

      const day = Math.min(exp.dueDay, lastDay)

      // Ainda não chegou o vencimento
      if (today < day) {
        continue
      }

      const date = new Date(year, currentMonth - 1, day)

      const startOfDay = new Date(
        year,
        currentMonth - 1,
        day,
        0,
        0,
        0
      )

      const endOfDay = new Date(
        year,
        currentMonth - 1,
        day,
        23,
        59,
        59
      )

      const existing = await prisma.transaction.findFirst({
        where: {
          type: 'expense',
          description: exp.name,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          userId,
        },
      })

      if (existing) {
        continue
      }

      const categoryLabel = expenseCategoryDbNameToForm(
        exp.category?.name
      )

      await prisma.transaction.create({
        data: {
          type: 'expense',
          amount: exp.amount,
          date,
          description: exp.name,
          userId,
          categoryId: exp.categoryId ?? undefined,
          category: categoryLabel,
          paymentMethod: 'Outros',
        },
      })

      created++
    }

    return NextResponse.json({ created })
  } catch (error) {
    console.error('[POST /api/recurring/sync]', error)

    return NextResponse.json(
      { error: 'Erro ao sincronizar' },
      { status: 500 }
    )
  }
}