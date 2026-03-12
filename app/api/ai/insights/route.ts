import { NextRequest, NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

interface InsightPayload {
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  savingsPercent: number
  projectedBalance?: number
  topCategory?: { category: string; amount: number }
  avgMonthlyExpenses: number
  transactionCount: number
}

export async function POST(request: NextRequest) {
  try {
    await getSessionUserId()
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY nao configurada' }, { status: 503 })
    }

    const body = (await request.json()) as InsightPayload
    const {
      balance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsPercent,
      projectedBalance,
      topCategory,
      avgMonthlyExpenses,
      transactionCount,
    } = body

    const prompt = `Voce e um assistente financeiro em PT-BR. Analise os dados e responda em JSON com exatamente estes campos (strings em portugues):
{
  "projecao": "1-2 frases sobre a projecao do saldo nos proximos meses",
  "recomendacao": "1-2 frases de recomendacao pratica",
  "risco": "alerta curto se houver risco, ou null se estiver saudavel",
  "dica": "1 dica objetiva para melhorar a economia"
}

Dados do usuario:
- Saldo atual: R$ ${balance.toFixed(2)}
- Receita mensal: R$ ${monthlyIncome.toFixed(2)}
- Gastos mensais: R$ ${monthlyExpenses.toFixed(2)}
- Economia mensal: R$ ${monthlySavings.toFixed(2)} (${savingsPercent.toFixed(1)}%)
${projectedBalance != null ? `- Projecao fim do mes: R$ ${projectedBalance.toFixed(2)}` : ''}
- Media historica de gastos: R$ ${avgMonthlyExpenses.toFixed(2)}
${topCategory ? `- Categoria que mais gasta: ${topCategory.category} (R$ ${topCategory.amount.toFixed(2)})` : ''}
- Total de transacoes registradas: ${transactionCount}

Responda SOMENTE o JSON, sem markdown ou texto adicional.`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[AI insights] OpenAI error:', res.status, err)
      return NextResponse.json(
        { error: 'Erro ao gerar insights' },
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

    let parsed: { projecao: string; recomendacao: string; risco: string | null; dica: string }
    try {
      const cleaned = content.replace(/^```json?\s*/i, '').replace(/\s*```\s*$/, '')
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Resposta invalida da IA' }, { status: 502 })
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[POST /api/ai/insights]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
