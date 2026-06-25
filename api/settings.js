const { readData, saveData } = require('./github.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let settingsObj = await readData('settings.json') || {};

    if (req.method === 'GET') {
      const arr = Object.keys(settingsObj).map(k => ({ key: k, value: settingsObj[k] }));
      return res.status(200).json(arr);
    }

    if (req.method === 'POST') {
      const { key, value } = req.body;
      if (!key || !value) return res.status(400).json({ error: 'Key and value are required' });
      
      settingsObj[key] = value;
      
      await saveData('settings.json', settingsObj, `Update setting ${key}`);
      
      return res.status(200).json({ key, value });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
