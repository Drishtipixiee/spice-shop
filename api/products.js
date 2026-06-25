const { readData, saveData } = require('./github.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let products = await readData('products.json') || [];

    if (req.method === 'GET') {
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const { name, name_hindi, category, price, mrp, image_url, description, weight, is_bestseller, is_new, in_stock } = req.body;
      const newProduct = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        name_hindi: name_hindi || null,
        category: category || 'spices',
        price: parseInt(price),
        mrp: parseInt(mrp),
        image_url: image_url || 'https://via.placeholder.com/400x300?text=Product',
        description: description || '',
        weight: weight || '',
        is_bestseller: is_bestseller || false,
        is_new: is_new || false,
        in_stock: in_stock !== undefined ? in_stock : true,
        created_at: new Date().toISOString()
      };
      
      products.push(newProduct);
      
      // MUST await so Vercel doesn't kill the lambda
      await saveData('products.json', products, `Add product: ${name}`);
      
      return res.status(201).json(newProduct);
    }

    if (req.method === 'PUT') {
      const { id, name, name_hindi, category, price, mrp, image_url, description, weight, is_bestseller, is_new, in_stock } = req.body;
      if (!id) return res.status(400).json({ error: 'Product ID is required' });
      
      const index = products.findIndex(p => p.id === id);
      if (index === -1) return res.status(404).json({ error: 'Product not found' });
      
      products[index] = {
        ...products[index],
        name,
        name_hindi: name_hindi || null,
        category: category || 'spices',
        price: parseInt(price),
        mrp: parseInt(mrp),
        image_url: image_url || 'https://via.placeholder.com/400x300?text=Product',
        description: description || '',
        weight: weight || '',
        is_bestseller: is_bestseller || false,
        is_new: is_new || false,
        in_stock: in_stock !== undefined ? in_stock : true,
      };
      
      await saveData('products.json', products, `Update product: ${name}`);
      
      return res.status(200).json(products[index]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Product ID is required for deletion' });
      
      const filtered = products.filter(p => p.id !== id);
      if (filtered.length === products.length) return res.status(404).json({ error: 'Product not found' });
      
      await saveData('products.json', filtered, `Delete product ID: ${id}`);
      
      return res.status(200).json({ success: true, message: 'Product deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
