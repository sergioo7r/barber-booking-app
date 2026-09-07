// Vercel Serverless Function: Real-time Slot Availability Engine
const MORNING_SLOTS = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
const AFTERNOON_SLOTS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
const SATURDAY_SLOTS = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, error: 'Parámetro date (YYYY-MM-DD) requerido' });
  }

  const [y, m, d] = date.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  const dayOfWeek = targetDate.getDay(); // 0 = Domingo

  if (dayOfWeek === 0) {
    return res.status(200).json({
      success: true,
      isOpen: false,
      reason: 'Cerrado los domingos',
      morning: [],
      afternoon: []
    });
  }

  let morning = [...MORNING_SLOTS];
  let afternoon = [...AFTERNOON_SLOTS];

  if (dayOfWeek === 6) {
    // Sábado: horario continuo 10:00 - 17:00
    morning = SATURDAY_SLOTS.slice(0, 7);
    afternoon = SATURDAY_SLOTS.slice(7);
  }

  return res.status(200).json({
    success: true,
    date,
    dayOfWeek,
    isOpen: true,
    totalSlots: morning.length + afternoon.length,
    morning,
    afternoon
  });
}
