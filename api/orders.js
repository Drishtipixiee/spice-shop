const { readData, saveData } = require('./github.js');

const MAHARASHTRA_SERVICE_PINCODES = new Set([
  // Thane city / district service pincodes
  '400601', '400602', '400603', '400604', '400605', '400606', '400607', '400608', '400609', '400610',
  '400612', '400615', '400701', '400708', '401105', '401107'
]);
const SERVICE_DISTRICTS = new Set(['thane']);

function isServiceablePincode(pincode) {
  return /^\d{6}$/.test(String(pincode || '')) && MAHARASHTRA_SERVICE_PINCODES.has(String(pincode));
}

async function validateServiceablePincode(pincode) {
  const pin = String(pincode || '');
  if (!/^\d{6}$/.test(pin)) return false;

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    if (!response.ok) throw new Error('Pincode lookup failed');
    const data = await response.json();
    const offices = data?.[0]?.PostOffice || [];
    return offices.some(office => (
      SERVICE_DISTRICTS.has(String(office.District || '').trim().toLowerCase()) &&
      String(office.State || '').trim().toLowerCase() === 'maharashtra'
    ));
  } catch (error) {
    console.error('Pincode lookup failed, using fallback list:', error);
    return isServiceablePincode(pin);
  }
}

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
      const { 
        customer_name, customer_phone, customer_address, customer_pincode, 
        items, subtotal, delivery_charge, total, 
        payment_method, payment_status, razorpay_order_id, razorpay_payment_id,
        order_status, notes 
      } = req.body;

      if (!customer_name || !customer_phone || !customer_address || !items || !total) {
        return res.status(400).json({ error: 'Missing required order fields' });
      }
      if (!await validateServiceablePincode(customer_pincode)) {
        return res.status(400).json({ error: 'Delivery is available only in Thane, Maharashtra.' });
      }

      const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const status = order_status || 'placed';
      const newOrder = {
        id: orderId,
        customer_name,
        customer_phone,
        customer_address,
        delivery_address: customer_address,
        customer_pincode,
        items,
        subtotal: parseInt(subtotal),
        delivery_charge: parseInt(delivery_charge),
        total: parseInt(total),
        total_amount: parseInt(total),
        payment_method,
        payment_status: payment_status || 'pending',
        razorpay_order_id: razorpay_order_id || null,
        razorpay_payment_id: razorpay_payment_id || null,
        order_status: status,
        status,
        notes: notes || '',
        created_at: new Date().toISOString()
      };

      orders.push(newOrder);
      await saveData('orders.json', orders, `Place order: ${orderId}`);

      return res.status(201).json({ success: true, orderId: orderId, order: newOrder });
    }

    if (req.method === 'PUT') {
      const { id, status, order_status } = req.body;
      const nextStatus = status || order_status;
      if (!id || !nextStatus) return res.status(400).json({ error: 'Order ID and status required' });
      
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) return res.status(404).json({ error: 'Order not found' });
      
      orders[index].status = nextStatus;
      orders[index].order_status = nextStatus;
      orders[index].updated_at = new Date().toISOString();
      
      await saveData('orders.json', orders, `Update order ${id} status to ${nextStatus}`);
      
      return res.status(200).json(orders[index]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
