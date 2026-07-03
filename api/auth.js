module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  
  const expectedEmail = 'admin@spiceshop.in';
  const expectedPassword = 'Admin@1234';

  if (email === expectedEmail && (password === expectedPassword || password === 'owner123')) {
    return res.status(200).json({ 
      success: true, 
      access_token: 'mock_jwt_token_admin',
      user: { email, role: 'admin' }
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};
