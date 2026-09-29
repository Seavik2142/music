import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Use DATABASE_URL if available, otherwise use separate credentials
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'soundfly_db',
    };

export const pool = new Pool(poolConfig);

// Helper function to test database connectivity
export const testDbConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('🐘 PostgreSQL connected successfully at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.warn('⚠️  PostgreSQL connection warning:', error.message);
    return false;
  }
};

export default pool;
