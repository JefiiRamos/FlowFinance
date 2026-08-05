import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'
import { createTransactionSchema } from '@/lib/validations/transaction'
import { parseExpenseMessage } from '@/lib/expense-assistant-parser'

export const dynamic = 'force-dynamic'

const MAX_USER_MESSAGES = 24

function todaySaoPaulo(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

interface ClientMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const body = (await request.json()) as { messages?: ClientMessage[] }
    const rawMessages = Array.isArray(body.messages) ? body.messages : []
    const userTurns = rawMessages.filter((m) => m.role === 'user').length
    if (userTurns === 0) {
      return NextResponse.json({ error: 'Envie ao menos uma mensagem do usuario' }, { status: 400 })
    }
    if (rawMessages.length > MAX_USER_MESSAGES * 2) {
      return NextResponse.json({ error: 'Historico muito longo' }, { status: 400 })
    }

    const recent = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 25,
      select: {
        date: true,
        type: true,
        amount: true,
        category: true,
        description: true,
      },
    })

    const today = todaySaoPaulo()

    const sanitized: ClientMessage[] = rawMessages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 4000),
      }))

    const lastUserMessage = [...sanitized].reverse().find((m) => m.role === 'user')?.content ?? ''
    const parsed = parseExpenseMessage(lastUserMessage, { today, recentTransactions: recent })

    let created: { id: string; type: string; amount: number; date: Date; category: string | null; description: string | null } | null =
      null

    if (parsed.action !== 'none' && parsed.transaction) {
      const tx = parsed.transaction
      const expectedType = parsed.action === 'create_expense' ? 'expense' : 'income'
      if (tx.type !== expectedType) {
        return NextResponse.json({
          reply:
            parsed.reply +
            '\n\n(Nao registrei: tipo de transacao inconsistente. Reformule em uma frase, por favor.)',
          created: false,
        })
      }

      const validated = createTransactionSchema.safeParse({
        type: tx.type,
        amount: tx.amount,
        date: tx.date,
        description: tx.description,
        category: tx.category,
        paymentMethod: tx.paymentMethod,
      })

      if (!validated.success) {
        return NextResponse.json({
          reply:
            parsed.reply +
            '\n\n(Nao registrei: faltou algum dado valido. Inclua valor e, se possivel, a data.)',
          created: false,
        })
      }

      const { type, amount, date, description, category, paymentMethod } = validated.data
      created = await prisma.transaction.create({
        data: {
          type,
          amount,
          date: new Date(date),
          description: description ?? null,
          category: category ?? 'Outros',
          paymentMethod: paymentMethod ?? 'Outros',
          userId,
        },
      })
    }

    let planning: {
      safeSpend: string
      reserve: string
      category: string
      status: string
    } | null = null

    if (created) {
      // TODO: se você já tem um modelo de orçamento/meta (ex.: renda mensal fixa,
      // reserva de emergência), troque este cálculo pela sua regra real.
      // Por ora: soma receitas e despesas do MÊS ATUAL (incluindo a transação recém-criada)
      // pra estimar quanto ainda "sobra" com segurança.
      const [year, month] = today.split('-').map(Number)
      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 1)

      const monthTx = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: monthStart, lt: monthEnd },
        },
        select: { type: true, amount: true },
      })

      const totalIncome = monthTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const totalExpense = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      const safeSpend = totalIncome - totalExpense
      const sign = created.type === 'expense' ? '+' : '+'

      const formatBRL = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

      planning = {
        safeSpend: formatBRL(safeSpend),
        reserve: `${sign} ${formatBRL(created.amount)}`,
        category: created.category ?? 'Outros',
        status: 'Atualizado',
      }
    }

    return NextResponse.json({
      reply: parsed.reply,
      created: Boolean(created),
      transaction: created
        ? {
            id: created.id,
            type: created.type,
            amount: created.amount,
            date: created.date.toISOString(),
            category: created.category,
            description: created.description,
          }
        : null,
      planning,
    })
  } catch (error) {
    console.error('[POST /api/ai/expense-assistant]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
