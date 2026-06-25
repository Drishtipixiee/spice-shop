const { readData, saveData } = require('./github.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let orders = await readData('orders.json') || [];

    if (req.method === 'GET') {
      return res.status(200).json(orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }

    if (req.method === 'POST') {
      // In reality, orders are created via create-order.js
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body;
      if (!id || !status) return res.status(400).json({ error: 'Order ID and status required' });
      
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) return res.status(404).json({ error: 'Order not found' });
      
      orders[index].status = status;
      orders[index].updated_at = new Date().toISOString();
      
      saveData('orders.json', orders, `Update order ${id} status to ${status}`);
      
      return res.status(200).json(orders[index]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
