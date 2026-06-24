// Vercel Serverless Function: /api/auth
// Handles OTP verification (Mocked for now)

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { phone, otp } = req.body;
    
    // Hardcoded master OTP for admin
    if (otp === '7391') {
      return res.status(200).json({ 
        success: true, 
        token: 'mock_jwt_token_admin',
        user: { phone, role: 'admin' }
      });
    }

    // In a real app, verify OTP via Twilio or Firebase Admin SDK
    return res.status(200).json({ 
      success: true, 
      token: 'mock_jwt_token_user',
      user: { phone, role: 'user' }
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
