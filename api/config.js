const { readData } = require('./github.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const settings = await readData('settings.json') || {};
  const ownerWhatsapp = String(settings.owner_whatsapp || settings.contact?.whatsapp || process.env.WHATSAPP_NUMBER || '919892360874').replace(/\D/g, '').slice(-10);

  return res.status(200).json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || settings.razorpay_key || 'rzp_test_51I0O96U8Z397p',
    ownerWhatsapp,
    // AI & Upload config — MUST set GROQ_API_KEY as Vercel env var
    groqApiKey: process.env.GROQ_API_KEY || '',
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'd4lxspus',
    cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'Project'
  });
};
