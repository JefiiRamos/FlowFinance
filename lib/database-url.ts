/**
 * Resolve which Postgres URL to use.
 * Railway's private hostname (*.railway.internal) only works inside Railway's network
 * (deployed services or `railway run`). On a normal dev machine, use a public URL or
 * set DATABASE_PUBLIC_URL to the TCP/public connection string from the Railway dashboard.
 */
function isRailwayInternalHost(url: string): boolean {
  return url.includes('railway.internal')
}

function runningOnRailwayPlatform(): boolean {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_SERVICE_NAME ||
    process.env.RAILWAY_PROJECT_ID
  )
}

export function resolveDatabaseUrl(): string {
  const direct = process.env.DATABASE_URL?.trim() || undefined
  const publicUrl = process.env.DATABASE_PUBLIC_URL?.trim() || undefined

  if (!direct && !publicUrl) {
    throw new Error('DATABASE_URL is not defined')
  }

  if (runningOnRailwayPlatform()) {
    if (direct) return direct
    if (publicUrl) return publicUrl
    throw new Error('DATABASE_URL is not defined')
  }

  if (publicUrl) return publicUrl

  if (direct && !isRailwayInternalHost(direct)) {
    return direct
  }

  if (direct && isRailwayInternalHost(direct)) {
    throw new Error(
      'DATABASE_URL aponta para *.railway.internal, que não resolve no seu PC. ' +
        'No Railway: Postgres → Connect → copie a URL pública (TCP/proxy) e defina DATABASE_PUBLIC_URL no .env, ' +
        'ou substitua DATABASE_URL por essa URL pública.'
    )
  }

  throw new Error('DATABASE_URL is not defined')
}

/**
 * Prisma CLI (`validate`, `migrate`, …): prefers DATABASE_PUBLIC_URL when set; does not throw
 * on *.railway.internal so `prisma validate` works without a reachable DB hostname.
 */
export function resolveDatasourceUrlForPrismaCli(): string {
  const pub = process.env.DATABASE_PUBLIC_URL?.trim() || undefined
  const direct = process.env.DATABASE_URL?.trim() || undefined
  const url = pub || direct
  if (!url) {
    throw new Error('DATABASE_URL is not defined')
  }
  return url
}
