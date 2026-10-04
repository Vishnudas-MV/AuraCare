import fs from 'fs';
import path from 'path';
import { pool } from './pool';
import { logger } from '../utils/logger.util';

export async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    logger.warn('No migrations directory found');
    return;
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    logger.info(`Applying migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      logger.info(`Migration ${file} applied successfully`);
    } catch (err: unknown) {
      await client.query('ROLLBACK');
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`Migration ${file} failed:`, { error: errorMsg });
      throw err;
    } finally {
      client.release();
    }
  }
}

// Allow running directly via tsx
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('All database migrations finished.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Migration execution failed', { error: String(err) });
      process.exit(1);
    });
}
