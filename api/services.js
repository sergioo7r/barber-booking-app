// Vercel Serverless Function: Services Catalog API
let MEMORY_SERVICES = [
  { id: 1, name: 'Corte clásico', duration: '30 min', price: 12, active: true },
  { id: 2, name: 'Arreglo de barba', duration: '20 min', price: 8, active: true },
  { id: 3, name: 'Corte y Barba', duration: '45 min', price: 18, active: true }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      services: MEMORY_SERVICES
    });
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, price, duration, active, name } = body || {};

      const service = MEMORY_SERVICES.find((s) => String(s.id) === String(id));
      if (service) {
        if (price !== undefined) service.price = Number(price);
        if (duration !== undefined) service.duration = duration;
        if (active !== undefined) service.active = Boolean(active);
        if (name) service.name = name;
        return res.status(200).json({ success: true, service });
      }

      if (name && price) {
        const newService = {
          id: Date.now(),
          name,
          duration: duration || '30 min',
          price: Number(price),
          active: true
        };
        MEMORY_SERVICES.push(newService);
        return res.status(201).json({ success: true, service: newService });
      }

      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
