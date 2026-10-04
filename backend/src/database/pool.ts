import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import fs from 'fs';
import { env } from '../config/env.config';
import { logger } from '../utils/logger.util';

const poolConfig = {
  host: env.PGHOST,
  port: env.PGPORT,
  database: env.PGDATABASE,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  max: env.PG_POOL_MAX,
  idleTimeoutMillis: env.PG_POOL_IDLE_TIMEOUT,
  ssl: env.PG_SSL_CA_CERT_PATH
    ? {
        ca: fs.readFileSync(env.PG_SSL_CA_CERT_PATH).toString(),
        rejectUnauthorized: true,
      }
    : undefined,
};

export const pool = new Pool(poolConfig);

pool.on('connect', (client) => {
  logger.debug('New client checked out of PostgreSQL pool');
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected idle client error in PostgreSQL pool', { error: err.message });
});

/**
 * Health check verification for PostgreSQL connectivity
 */
export async function verifyDbConnection(): Promise<boolean> {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    logger.info('Database connection verified successfully', {
      db: res.rows[0].db_name,
      time: res.rows[0].current_time,
    });
    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('Database connection verification failed', { error: errorMsg });
    return false;
  } finally {
    if (client) client.release();
  }
}

/**
 * Executes a query with an explicitly set Row-Level-Security (RLS) tenant context.
 * Uses `set_config('app.current_tenant_id', $1, true)` to scope the setting strictly
 * to the transaction, preventing cross-tenant connection pollution.
 */
export async function executeTenantQuery<T extends QueryResultRow = QueryResultRow>(
  tenantId: string,
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Set transaction-local tenant context for PostgreSQL RLS policies:
    await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
    const result = await client.query<T>(text, params);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    // Clean up session context before returning connection back to pool
    await client.query(`SELECT set_config('app.current_tenant_id', '', false)`).catch(() => {});
    client.release();
  }
}

/**
 * Executes a transactional block with an explicitly set Row-Level-Security (RLS) tenant context.
 */
export async function withTenantTransaction<T>(
  tenantId: string,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.query(`SELECT set_config('app.current_tenant_id', '', false)`).catch(() => {});
    client.release();
  }
}
