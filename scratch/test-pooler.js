const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Hjklvbnm%401234@db.dinygrtktvzkyqgutuft.supabase.co:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.time('connect-pooler');
  const client = await pool.connect();
  console.timeEnd('connect-pooler');

  console.time('query');
  const { rows } = await client.query('SELECT * FROM products LIMIT 1');
  console.timeEnd('query');

  client.release();
  await pool.end();
}

main().catch(err => console.error('Error on pooler:', err));
