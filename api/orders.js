const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      const { rows } = await client.query('SELECT * FROM orders ORDER BY created_at DESC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { 
        customer_name, customer_phone, customer_address, customer_pincode, 
        items, subtotal, delivery_charge, total, 
        payment_method, payment_status, razorpay_order_id, razorpay_payment_id,
        order_status, notes 
      } = req.body;

      if (!customer_name || !customer_phone || !customer_address || !items || !total) {
        return res.status(400).json({ error: 'Missing required order fields' });
      }

      const query = `
        INSERT INTO orders (
          customer_name, customer_phone, customer_address, customer_pincode, 
          items, subtotal, delivery_charge, total, 
          payment_method, payment_status, razorpay_order_id, razorpay_payment_id,
          order_status, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;
      const values = [
        customer_name,
        customer_phone,
        customer_address,
        customer_pincode || null,
        typeof items === 'string' ? items : JSON.stringify(items),
        parseInt(subtotal),
        parseInt(delivery_charge !== undefined ? delivery_charge : 40),
        parseInt(total),
        payment_method || 'cod',
        payment_status || 'pending',
        razorpay_order_id || null,
        razorpay_payment_id || null,
        order_status || 'placed',
        notes || ''
      ];

      const { rows } = await client.query(query, values);
      return res.status(201).json({ success: true, orderId: rows[0].id, order: rows[0] });
    }

    if (req.method === 'PUT') {
      const { id, order_status, payment_status } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      let query = '';
      let values = [];

      if (order_status && payment_status) {
        query = 'UPDATE orders SET order_status = $1, payment_status = $2 WHERE id = $3 RETURNING *';
        values = [order_status, payment_status, id];
      } else if (order_status) {
        query = 'UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *';
        values = [order_status, id];
      } else if (payment_status) {
        query = 'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *';
        values = [payment_status, id];
      } else {
        return res.status(400).json({ error: 'Nothing to update' });
      }

      const { rows } = await client.query(query, values);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error in orders api:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};
