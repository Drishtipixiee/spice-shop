// Vercel Serverless Function: /api/orders
// Handles order creation and retrieval

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/orders (Admin or user history)
  if (req.method === 'GET') {
    const mockOrders = [
      { id: 'ORD1001', total: 450, status: 'delivered', date: new Date().toISOString() }
    ];
    return res.status(200).json(mockOrders);
  }

  // POST /api/orders (Checkout)
  if (req.method === 'POST') {
    const orderData = req.body;
    // In a real DB, INSERT INTO orders...
    return res.status(201).json({ 
      success: true, 
      orderId: 'ORD' + Math.floor(1000 + Math.random() * 9000),
      message: 'Order placed successfully' 
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
