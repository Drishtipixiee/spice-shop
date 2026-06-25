const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Hjklvbnm%401234@db.dinygrtktvzkyqgutuft.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  const { rows } = await client.query('SELECT id, name, category, price, LENGTH(image_url) as img_len, SUBSTRING(image_url FROM 1 FOR 50) as img_start FROM products');
  console.log('Products currently in database:');
  console.table(rows);
  client.release();
  await pool.end();
}

main().catch(err => console.error('Error:', err));
