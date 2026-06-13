import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('No database connection string configured. Set DATABASE_URL.');
}

export const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,
});
