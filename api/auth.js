// Vercel Serverless Function: Barber Auth & PIN Verification
const DEFAULT_PIN = '1234';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { pin } = body || {};

    const configuredPin = process.env.ADMIN_PIN || DEFAULT_PIN;

    if (String(pin).trim() === String(configuredPin).trim()) {
      return res.status(200).json({
        success: true,
        message: 'Acceso autorizado al Panel de Barbero',
        token: 'barber_session_' + Buffer.from(Date.now().toString()).toString('base64'),
        role: 'owner',
        expiresIn: '7d'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'PIN incorrecto'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
