import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/recurring - Lista rendas recorrentes
 */
export async function GET() {
  const items = await prisma.recurringIncome.findMany()
  return NextResponse.json(items)
}
