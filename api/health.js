// Vercel Serverless Function: Health Check
export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasDb = Boolean(process.env.DATABASE_URL || process.env.KV_REST_API_URL);

  return res.status(200).json({
    status: 'ok',
    app: 'LC BARBER TRIANA — Core Booking Engine',
    version: '1.2.0',
    environment: process.env.VERCEL_ENV || 'production',
    databaseConnected: hasDb,
    databaseMode: hasDb ? 'cloud_live' : 'mock_hybrid_ready',
    timestamp: new Date().toISOString()
  });
}
