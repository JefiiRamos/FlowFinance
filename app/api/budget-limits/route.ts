import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'
import { CATEGORIES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const ALLOWED_CATEGORIES = new Set(CATEGORIES.map((c) => c.id))

/**
 * GET /api/budget-limits — limites por categoria (objeto categoria → valor).
 */
export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({})
    }
    const rows = await prisma.budgetLimit.findMany({ where: { userId } })
    const limits: Record<string, number> = {}
    for (const r of rows) {
      if (ALLOWED_CATEGORIES.has(r.category)) {
        limits[r.category] = r.limit
      }
    }
    return NextResponse.json(limits)
  } catch (error) {
    console.error('[GET /api/budget-limits]', error)
    return NextResponse.json({ error: 'Erro ao listar limites' }, { status: 500 })
  }
}

/**
 * PUT /api/budget-limits — substitui todos os limites do usuário.
 * Body: { "limits": { "Alimentação": 500, ... } } (apenas categorias conhecidas; 0 ou omitir remove o limite)
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }
    const body = (await request.json()) as { limits?: unknown }
    if (!body.limits || typeof body.limits !== 'object' || Array.isArray(body.limits)) {
      return NextResponse.json({ error: 'Body precisa de { limits: objeto }' }, { status: 400 })
    }
    const raw = body.limits as Record<string, unknown>
    const toCreate: { userId: string; category: string; limit: number }[] = []
    for (const [cat, val] of Object.entries(raw)) {
      if (!ALLOWED_CATEGORIES.has(cat)) continue
      const limit = typeof val === 'number' ? val : Number(val)
      if (!Number.isFinite(limit) || limit <= 0) continue
      toCreate.push({ userId, category: cat, limit })
    }

    await prisma.$transaction([
      prisma.budgetLimit.deleteMany({ where: { userId } }),
      ...(toCreate.length > 0 ? [prisma.budgetLimit.createMany({ data: toCreate })] : []),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[PUT /api/budget-limits]', error)
    return NextResponse.json({ error: 'Erro ao salvar limites' }, { status: 500 })
  }
}
