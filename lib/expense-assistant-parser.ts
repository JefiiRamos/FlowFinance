import type { CategoryId, PaymentMethodId } from '@/lib/constants'

export interface AssistantJson {
  reply: string
  action: 'none' | 'create_expense' | 'create_income'
  transaction: {
    type: 'income' | 'expense'
    amount: number
    date: string
    description?: string
    category?: CategoryId
    paymentMethod?: PaymentMethodId
  } | null
}

export interface TransactionRow {
  date: Date
  type: string
  amount: number
  category: string | null
  description: string | null
}

export interface ParserContext {
  today: string
  recentTransactions?: TransactionRow[]
}

const INCOME_KEYWORDS = [
  'salario',
  'salário',
  'recebi',
  'entrada',
  'freela',
  'freelance',
  'pagamento recebido',
  'rendimento',
  'deposito',
  'depósito',
  'transferencia recebida',
  'transferência recebida',
]

const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  Alimentação: [
    'padaria',
    'mercado',
    'supermercado',
    'ifood',
    'restaurante',
    'almoço',
    'almoco',
    'lanche',
    'café',
    'cafe',
    'açougue',
    'acougue',
    'feira',
    'delivery',
    'comida',
  ],
  Transporte: [
    'uber',
    '99',
    'taxi',
    'táxi',
    'gasolina',
    'combustivel',
    'combustível',
    'onibus',
    'ônibus',
    'metro',
    'metrô',
    'estacionamento',
    'pedagio',
    'pedágio',
    'transporte',
  ],
  Moradia: ['aluguel', 'condominio', 'condomínio', 'luz', 'agua', 'água', 'internet', 'iptu', 'moradia'],
  Lazer: ['cinema', 'netflix', 'spotify', 'bar', 'festa', 'viagem', 'jogo', 'lazer', 'show', 'streaming'],
  Saúde: ['farmacia', 'farmácia', 'remedio', 'remédio', 'consulta', 'plano de saude', 'plano de saúde', 'dentista', 'hospital'],
  Educação: ['curso', 'faculdade', 'escola', 'livro', 'material escolar', 'educacao', 'educação', 'mensalidade'],
  Investimentos: ['investimento', 'acao', 'ação', 'fundo', 'tesouro', 'cdb', 'cripto', 'bitcoin'],
  Outros: [],
}

const PAYMENT_KEYWORDS: Record<PaymentMethodId, string[]> = {
  PIX: ['pix'],
  Dinheiro: ['dinheiro', 'cash'],
  'Cartão de Crédito': ['credito', 'crédito', 'cartao de credito', 'cartão de crédito'],
  'Cartão de Débito': ['debito', 'débito', 'cartao de debito', 'cartão de débito'],
  Transferência: ['transferencia', 'transferência', 'ted', 'doc'],
  Outros: [],
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function formatBRL(amount: number): string {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function extractAmount(text: string): number | null {
  const patterns = [
    /r\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})|\d+(?:[.,]\d{2})?)/i,
    /(\d{1,3}(?:\.\d{3})*(?:,\d{2})|\d+(?:[.,]\d{2})?)\s*(?:reais|r\$)?/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (!match) continue
    const raw = match[1].replace(/\./g, '').replace(',', '.')
    const value = parseFloat(raw)
    if (!Number.isNaN(value) && value > 0) return value
  }

  return null
}

function parseRelativeDate(text: string, today: string): string {
  const n = normalize(text)
  if (/\bontem\b/.test(n)) return addDays(today, -1)
  if (/\banteontem\b/.test(n)) return addDays(today, -2)
  return today
}

function isIncome(text: string): boolean {
  const n = normalize(text)
  return INCOME_KEYWORDS.some((kw) => n.includes(normalize(kw)))
}

function guessCategory(text: string): CategoryId {
  const n = normalize(text)
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CategoryId, string[]][]) {
    if (category === 'Outros') continue
    if (keywords.some((kw) => n.includes(normalize(kw)))) return category
  }
  return 'Outros'
}

function guessPaymentMethod(text: string): PaymentMethodId {
  const n = normalize(text)
  for (const [method, keywords] of Object.entries(PAYMENT_KEYWORDS) as [PaymentMethodId, string[]][]) {
    if (method === 'Outros') continue
    if (keywords.some((kw) => n.includes(normalize(kw)))) return method
  }
  return 'Outros'
}

function extractDescription(text: string, amount: number): string {
  let desc = text
    .replace(/r\$\s*/gi, '')
    .replace(/\b(hoje|ontem|anteontem)\b/gi, '')
    .replace(/\b(reais|r\$)\b/gi, '')
    .replace(/\b(gastei|paguei|comprei|recebi)\b/gi, '')

  const amountStr = amount.toString().replace('.', ',')
  desc = desc.replace(new RegExp(String(amount).replace('.', '[.,]'), 'g'), '')
  desc = desc.replace(new RegExp(amountStr, 'g'), '')

  for (const keywords of Object.values(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      desc = desc.replace(new RegExp(`\\b${kw}\\b`, 'gi'), kw)
    }
  }

  desc = desc.replace(/\s+/g, ' ').trim()
  if (!desc) return 'Transação'
  return desc.charAt(0).toUpperCase() + desc.slice(1)
}

function buildSummary(recent: TransactionRow[]): string {
  if (recent.length === 0) {
    return 'Você ainda não tem transações registradas. Me diga algo como "35 padaria" para começar.'
  }

  const expenses = recent.filter((t) => t.type === 'expense')
  const income = recent.filter((t) => t.type === 'income')
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)
  const totalIncome = income.reduce((s, t) => s + t.amount, 0)

  const lines = [
    `Nas suas últimas ${recent.length} transações:`,
    `- Despesas: ${formatBRL(totalExpenses)} (${expenses.length} registro${expenses.length !== 1 ? 's' : ''})`,
    `- Receitas: ${formatBRL(totalIncome)} (${income.length} registro${income.length !== 1 ? 's' : ''})`,
  ]

  if (expenses.length > 0) {
    const byCategory = new Map<string, number>()
    for (const t of expenses) {
      const cat = t.category ?? 'Outros'
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + t.amount)
    }
    const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]
    if (top) lines.push(`- Maior categoria de gasto: ${top[0]} (${formatBRL(top[1])})`)
  }

  return lines.join('\n')
}

function helpReply(): string {
  return [
    'Entendo frases curtas com valor + descrição. Exemplos:',
    '• "35 padaria" — despesa de R$ 35 em Alimentação',
    '• "uber 18" — despesa de R$ 18 em Transporte',
    '• "120 mercado hoje" — despesa de hoje',
    '• "salário 4500" — receita de R$ 4.500',
    '',
    'Também reconheço "ontem", "pix", "crédito" e categorias comuns.',
    'Digite "resumo" para ver um panorama das últimas transações.',
  ].join('\n')
}

export function parseExpenseMessage(text: string, ctx: ParserContext): AssistantJson {
  const trimmed = text.trim()
  const n = normalize(trimmed)

  if (!trimmed) {
    return {
      reply: 'Envie uma mensagem descrevendo o gasto ou receita. Ex.: "42 uber" ou "salário 4500".',
      action: 'none',
      transaction: null,
    }
  }

  if (/^(oi|ola|olá|hey|e ai|e aí|bom dia|boa tarde|boa noite|hello)\b/.test(n)) {
    return {
      reply: 'Olá! Descreva em uma frase o que gastou ou recebeu. Ex.: "35 padaria", "uber 18" ou "salário 4500".',
      action: 'none',
      transaction: null,
    }
  }

  if (/^(ajuda|help|como usar|como funciona|o que voce faz|o que você faz)\b/.test(n)) {
    return { reply: helpReply(), action: 'none', transaction: null }
  }

  if (/\b(quanto gastei|gastos do mes|gastos do mês|resumo|extrato|minhas transacoes|minhas transações)\b/.test(n)) {
    return {
      reply: buildSummary(ctx.recentTransactions ?? []),
      action: 'none',
      transaction: null,
    }
  }

  const amount = extractAmount(trimmed)
  if (!amount) {
    return {
      reply: 'Não identifiquei o valor. Tente algo como "35 padaria", "uber 18" ou "salário 4500".',
      action: 'none',
      transaction: null,
    }
  }

  const income = isIncome(trimmed)
  const date = parseRelativeDate(trimmed, ctx.today)
  const category = income ? 'Outros' : guessCategory(trimmed)
  const description = extractDescription(trimmed, amount)
  const paymentMethod = guessPaymentMethod(trimmed)
  const type = income ? 'income' : 'expense'
  const action = income ? 'create_income' : 'create_expense'

  const dateLabel =
    date === ctx.today ? 'hoje' : date === addDays(ctx.today, -1) ? 'ontem' : date

  const replyParts = [
    income
      ? `Registrei sua receita de ${formatBRL(amount)}`
      : `Registrei sua despesa de ${formatBRL(amount)}`,
    description !== 'Transação' ? `(${description})` : null,
    !income && category !== 'Outros' ? `em ${category}` : null,
    `para ${dateLabel}.`,
  ].filter(Boolean)

  return {
    reply: replyParts.join(' '),
    action,
    transaction: {
      type,
      amount,
      date,
      description,
      category,
      paymentMethod,
    },
  }
}
