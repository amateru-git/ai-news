export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { texts } = req.body;
  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'texts array required' });
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'DEEPL_API_KEY not configured' });
  }

  try {
    // Build form data for DeepL API (supports batch)
    const params = new URLSearchParams();
    texts.forEach(t => params.append('text', t));
    params.append('target_lang', 'JA');
    params.append('source_lang', 'EN');

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const translations = data.translations.map(t => t.text);
    return res.status(200).json({ translations });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
