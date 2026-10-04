import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { executeTenantQuery, withTenantTransaction, pool } from './pool';
import { logger } from '../utils/logger.util';

export abstract class BaseRepository {
  protected readonly tenantId: string;

  constructor(tenantId: string) {
    if (!tenantId) {
      throw new Error('BaseRepository requires a valid tenantId for RLS context isolation.');
    }
    this.tenantId = tenantId;
  }

  /**
   * Executes a query under the current tenant's Row Level Security context.
   * PostgreSQL RLS policies will automatically and implicitly filter the results by tenant_id.
   */
  protected async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    try {
      return await executeTenantQuery<T>(this.tenantId, text, params);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('BaseRepository Query Execution Failed', {
        tenantId: this.tenantId,
        query: text,
        error: errorMsg,
      });
      throw err;
    }
  }

  /**
   * Executes multiple queries within a single transactional block under the tenant's RLS context.
   */
  protected async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    try {
      return await withTenantTransaction<T>(this.tenantId, callback);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('BaseRepository Transaction Failed', {
        tenantId: this.tenantId,
        error: errorMsg,
      });
      throw err;
    }
  }

  /**
   * Optional system-level query bypass (e.g. for cross-tenant billing or super-admin audits).
   * Restricted: Use ONLY when explicitly required outside of clinical/tenant workflows.
   */
  protected static async systemQuery<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    return pool.query<T>(text, params);
  }
}
