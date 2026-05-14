import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'
import { createTransactionSchema } from '@/lib/validations/transaction'

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

interface AssistantJson {
  reply: string
  action: 'none' | 'create_expense' | 'create_income'
  transaction: {
    type: 'income' | 'expense'
    amount: number
    date: string
    description?: string
    category?: string
    paymentMethod?: string
  } | null
}

function buildTransactionContext(
  rows: Array<{ date: Date; type: string; amount: number; category: string | null; description: string | null }>
): string {
  if (rows.length === 0) return 'Nenhuma transacao registrada ainda.'
  return rows
    .map((t) => {
      const d = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(t.date)
      const desc = (t.description ?? '').slice(0, 40)
      const cat = t.category ?? 'Outros'
      return `- ${d} | ${t.type} | R$ ${t.amount.toFixed(2)} | ${cat} | ${desc}`
    })
    .join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY nao configurada' }, { status: 503 })
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
    const ctx = buildTransactionContext(recent)

    const system = `Voce e o assistente de gastos do FlowFinance. Idioma: portugues do Brasil.

Data de hoje (America/Sao_Paulo): ${today}

Ultimas transacoes do usuario (mais recente primeiro):
${ctx}

Categorias validas (use exatamente estes nomes com acentos): Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Investimentos, Outros.
Formas de pagamento validas: Dinheiro, PIX, Cartão de Crédito, Cartão de Débito, Transferência, Outros.

Tarefa:
- Se o usuario descrever um gasto ou receita clara (valor e o que foi), proponha registrar.
- Se for conversa, duvida sobre financas ou pedido de conselho usando o contexto, use action "none".
- Se faltar valor ou nao der para inferir data/categoria com seguranca, use action "none" e explique no reply o que falta.

Responda SOMENTE um JSON valido (sem markdown). Campos obrigatorios:
- "reply": string em portugues para o usuario
- "action": exatamente uma destas strings: "none", "create_expense", "create_income"
- "transaction": se action for "none", use null. Caso contrario, objeto com:
  - "type": "expense" ou "income" (deve bater com a action)
  - "amount": numero > 0
  - "date": "YYYY-MM-DD" em fuso America/Sao_Paulo (hoje = ${today}; "ontem" = dia anterior)
  - "description": string curta ou omita
  - "category": uma categoria valida listada acima
  - "paymentMethod": opcional; se omitir, use "Outros"

Exemplo conversa: {"reply":"Oi!","action":"none","transaction":null}
Exemplo despesa: {"reply":"Registrei sua despesa.","action":"create_expense","transaction":{"type":"expense","amount":42,"date":"${today}","description":"Uber","category":"Transporte","paymentMethod":"PIX"}}

Regras:
- create_expense exige transaction.type === "expense" e valores coerentes.
- create_income exige transaction.type === "income".
- Se action for "none", transaction deve ser null.
- Nunca invente valores que o usuario nao indicou.`

    const sanitized: ClientMessage[] = rawMessages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 4000),
      }))

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.25,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, ...sanitized.map((m) => ({ role: m.role, content: m.content }))],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[expense-assistant] OpenAI error:', res.status, err)
      return NextResponse.json(
        { error: 'Erro ao falar com a IA' },
        { status: res.status >= 500 ? 502 : 400 }
      )
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      return NextResponse.json({ error: 'Resposta vazia da IA' }, { status: 502 })
    }

    let parsed: AssistantJson
    try {
      parsed = JSON.parse(content) as AssistantJson
    } catch {
      return NextResponse.json({ error: 'Resposta invalida da IA' }, { status: 502 })
    }

    if (typeof parsed.reply !== 'string' || !['none', 'create_expense', 'create_income'].includes(parsed.action)) {
      return NextResponse.json({ error: 'Formato invalido da IA' }, { status: 502 })
    }

    let created: { id: string; type: string; amount: number; date: Date; category: string | null; description: string | null } | null =
      null

    if (parsed.action !== 'none' && parsed.transaction) {
      const tx = parsed.transaction
      const expectedType = parsed.action === 'create_expense' ? 'expense' : 'income'
      if (tx.type !== expectedType) {
        return NextResponse.json({
          reply:
            parsed.reply +
            '\n\n(Nao registrei: a IA indicou um tipo de transacao inconsistente. Reformule em uma frase, por favor.)',
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
    })
  } catch (error) {
    console.error('[POST /api/ai/expense-assistant]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
