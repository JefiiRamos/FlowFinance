import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { resolveDatabaseUrl } from './database-url'

export function createPrismaClient(): PrismaClient {
  const pool = new pg.Pool({ connectionString: resolveDatabaseUrl() })
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}
