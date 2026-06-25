const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      const { rows } = await client.query('SELECT * FROM site_settings');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { key, value } = req.body;
      if (!key || !value) {
        return res.status(400).json({ error: 'Key and value are required' });
      }

      const query = `
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        RETURNING *
      `;
      const valParam = typeof value === 'string' ? value : JSON.stringify(value);
      const { rows } = await client.query(query, [key, valParam]);
      return res.status(200).json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error in settings api:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};
