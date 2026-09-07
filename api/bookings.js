// Vercel Serverless Function: Bookings API (CRUD & Conflict Verification)

// Default Seed Memory Store (Used when external DB is not yet plugged in)
let MEMORY_BOOKINGS = [
  {
    id: 101,
    name: 'Carlos Mendoza',
    phone: '612345678',
    service: 'Corte clásico',
    price: 12,
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    name: 'Antonio Jiménez',
    phone: '655443221',
    service: 'Corte + Ritual Barba',
    price: 20,
    date: new Date().toISOString().split('T')[0],
    time: '12:30',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: List bookings (with optional ?date=YYYY-MM-DD filter)
  if (req.method === 'GET') {
    const { date, status } = req.query;
    let list = [...MEMORY_BOOKINGS];

    if (date) {
      list = list.filter((b) => b.date === date);
    }
    if (status) {
      list = list.filter((b) => b.status === status);
    }

    return res.status(200).json({
      success: true,
      count: list.length,
      bookings: list
    });
  }

  // 2. POST: Create a new booking
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { name, phone, service, price, date, time, durationMin } = body || {};

      if (!name || !phone || !date || !time) {
        return res.status(400).json({
          success: false,
          error: 'Faltan campos obligatorios: name, phone, date, time'
        });
      }

      // Check slot conflict
      const conflict = MEMORY_BOOKINGS.find(
        (b) => b.date === date && b.time === time && b.status !== 'cancelled'
      );
      if (conflict) {
        return res.status(409).json({
          success: false,
          error: 'El horario seleccionado ya está ocupado',
          conflictBookingId: conflict.id
        });
      }

      const newBooking = {
        id: Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        service: service || 'Corte clásico',
        price: Number(price) || 12,
        date,
        time,
        durationMin: Number(durationMin) || 30,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      MEMORY_BOOKINGS.unshift(newBooking);

      return res.status(201).json({
        success: true,
        message: 'Cita registrada con éxito',
        booking: newBooking
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. PATCH: Update booking status (e.g. completed, cancelled)
  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, status, time, date } = body || {};

      const booking = MEMORY_BOOKINGS.find((b) => String(b.id) === String(id));
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Cita no encontrada' });
      }

      if (status) booking.status = status;
      if (time) booking.time = time;
      if (date) booking.date = date;
      booking.updatedAt = new Date().toISOString();

      return res.status(200).json({ success: true, booking });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. DELETE: Cancel/Remove booking
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Falta el id' });

    MEMORY_BOOKINGS = MEMORY_BOOKINGS.filter((b) => String(b.id) !== String(id));
    return res.status(200).json({ success: true, message: 'Cita eliminada correctamente' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
