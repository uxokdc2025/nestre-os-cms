/* Postgres connection settings for Payload on Vercel serverless.
 *
 * Production has hit Postgres "sorry, too many clients already" (Nov 18 and Nov 20)
 * because every serverless instance opens its own direct connections to the
 * nestre-cms-db container (max_connections = 100). The fix is to go through
 * PgBouncer in transaction mode, which multiplexes thousands of client
 * connections onto a small, capped set of real Postgres connections.
 *
 * Resolution order (no env change = exactly the old behaviour):
 *   1. DATABASE_URL_POOLED   full pooled connection string, if set.
 *   2. DATABASE_POOLER_PORT  DATABASE_URI with its port swapped to the pooler port
 *                            (same host, user, password, database).
 *   3. DATABASE_URI          direct connection (previous behaviour, unchanged).
 *
 * Note: @payloadcms/db-postgres checks out one client at connect() and never
 * releases it, so a per-instance max below 2 would starve queries. Keep max >= 2.
 */
import type { postgresAdapter } from '@payloadcms/db-postgres'

type PoolConfig = NonNullable<Parameters<typeof postgresAdapter>[0]['pool']>

function withPort(uri: string, port: string): string {
  try {
    const u = new URL(uri)
    u.port = port
    return u.toString()
  } catch {
    return uri
  }
}

function intEnv(name: string, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(process.env[name] || '', 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

export function resolveDatabaseUrl(): { connectionString: string; pooled: boolean } {
  const direct = process.env.DATABASE_URI || ''
  const pooledUrl = (process.env.DATABASE_URL_POOLED || '').trim()
  if (pooledUrl) return { connectionString: pooledUrl, pooled: true }
  const poolerPort = (process.env.DATABASE_POOLER_PORT || '').trim()
  if (direct && /^\d{2,5}$/.test(poolerPort)) {
    return { connectionString: withPort(direct, poolerPort), pooled: true }
  }
  return { connectionString: direct, pooled: false }
}

export function payloadPoolConfig(): PoolConfig {
  const { connectionString, pooled } = resolveDatabaseUrl()
  if (!pooled) {
    // Unchanged legacy settings for a direct connection.
    return { connectionString, max: 3, idleTimeoutMillis: 10000, allowExitOnIdle: true }
  }
  return {
    connectionString,
    // Per serverless instance. The pooler caps real Postgres connections.
    max: intEnv('DATABASE_POOL_MAX', 3, 2, 5),
    idleTimeoutMillis: intEnv('DATABASE_POOL_IDLE_MS', 5000, 1000, 60000),
    connectionTimeoutMillis: intEnv('DATABASE_POOL_CONNECT_TIMEOUT_MS', 10000, 1000, 30000),
    allowExitOnIdle: true,
    // node-postgres only uses unnamed statements unless a query sets `name`, which
    // is safe in PgBouncer transaction mode (it also has max_prepared_statements on).
    application_name: `nestre-cms-${process.env.VERCEL_ENV || process.env.NODE_ENV || 'dev'}`,
  }
}
