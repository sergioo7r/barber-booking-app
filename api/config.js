// Vercel Serverless Function: Public Barber Shop Config
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    brandName: 'LC BARBER TRIANA',
    brandSubtitle: 'C. Castilla, 58B · Triana',
    address: 'C. Castilla, 58B',
    addressFull: 'C. Castilla, 58B, 41010 Sevilla (Triana)',
    whatsappNumber: process.env.WHATSAPP_PHONE || '34664616475',
    phoneDisplay: '664 61 64 75',
    instagramHandle: 'LCBARBERTRIANA',
    instagramUrl: 'https://www.instagram.com/lcbarbertriana/',
    mapsUrl: 'https://maps.google.com/?q=LC+BARBER+TRIANA+C+Castilla+58B+41010+Sevilla',
    hoursSummary: 'Lunes a Viernes 10:00–14:00 y 17:00–22:00 · Sábados 10:00–17:00',
    statusHours: 'Abierto hoy · 10:00 — 22:00',
    googleReviews: {
      rating: 5.0,
      count: 62
    }
  });
}
