/**
 * Supabase Postgres connection strings:
 *
 * - DATABASE_URL: Transaction pooler (port 6543, ?pgbouncer=true) — use at runtime (Next.js / Vercel).
 * - DIRECT_URL: Direct connection (port 5432) — use for Prisma CLI (`db push`, migrations).
 *
 * Supabase dashboard: Project Settings → Database → Connection string.
 */
function requireEnv(name: 'DATABASE_URL' | 'DIRECT_URL'): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `${name} is not defined. Configure as URLs do Supabase no .env — veja .env.example.`
    )
  }
  return value
}

/** Runtime connection (Next.js API routes, scripts). */
export function resolveDatabaseUrl(): string {
  return requireEnv('DATABASE_URL')
}

/** Direct connection for Prisma CLI when available; falls back to DATABASE_URL. */
export function resolveDirectDatabaseUrl(): string {
  const direct = process.env.DIRECT_URL?.trim()
  if (direct) return direct
  return resolveDatabaseUrl()
}
