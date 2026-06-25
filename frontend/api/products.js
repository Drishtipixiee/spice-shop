const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      const { rows } = await client.query('SELECT * FROM products ORDER BY created_at DESC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { name, name_hindi, category, price, mrp, image_url, description, weight, is_bestseller, is_new, in_stock } = req.body;
      const query = `
        INSERT INTO products (name, name_hindi, category, price, mrp, image_url, description, weight, is_bestseller, is_new, in_stock)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const values = [
        name,
        name_hindi || null,
        category,
        parseInt(price),
        parseInt(mrp),
        image_url || 'https://via.placeholder.com/400x300?text=Product',
        description || '',
        weight || '',
        is_bestseller || false,
        is_new || false,
        in_stock !== undefined ? in_stock : true
      ];
      const { rows } = await client.query(query, values);
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id, name, name_hindi, category, price, mrp, image_url, description, weight, is_bestseller, is_new, in_stock } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Product ID is required for update' });
      }
      const query = `
        UPDATE products 
        SET name = $1, name_hindi = $2, category = $3, price = $4, mrp = $5, image_url = $6, 
            description = $7, weight = $8, is_bestseller = $9, is_new = $10, in_stock = $11
        WHERE id = $12
        RETURNING *
      `;
      const values = [
        name,
        name_hindi || null,
        category,
        parseInt(price),
        parseInt(mrp),
        image_url || 'https://via.placeholder.com/400x300?text=Product',
        description || '',
        weight || '',
        is_bestseller || false,
        is_new || false,
        in_stock !== undefined ? in_stock : true,
        id
      ];
      const { rows } = await client.query(query, values);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Product ID is required for deletion' });
      }
      const { rowCount } = await client.query('DELETE FROM products WHERE id = $1', [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json({ success: true, message: 'Product deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error in products api:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};
