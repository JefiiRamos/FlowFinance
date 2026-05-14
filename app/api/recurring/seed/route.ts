import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

/**
 * Antes criava rendas recorrentes de exemplo. Novos usuários devem começar sem lançamentos nem regras.
 * A rota permanece para compatibilidade e não cria mais dados.
 */
export async function POST() {
  try {
    await getSessionUserId()
    return NextResponse.json({
      message: 'Nenhum dado inicial é criado automaticamente',
      count: 0,
    })
  } catch (error) {
    console.error('[POST /api/recurring/seed]', error)
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
  }
}
