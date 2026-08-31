/**
 * =======================================================================
 * PANEL DE CONFIGURACIÓN RÁPIDA — BARBERÍA
 * =======================================================================
 * Edita este archivo para cambiar horarios, días de cierre o bloquear horas.
 * No necesitas tocar nada más del código de la aplicación.
 */

const BARBER_SCHEDULE_CONFIG = {
  // 1. TELÉFONO DEL PELUQUERO (para recibir las reservas de WhatsApp)
  // Formato: Prefijo de país + número (sin '+', ni espacios, ni guiones)
  whatsappPhone: "34600112233",

  // 2. DURACIÓN DEL BLOQUE DE CITA (en minutos)
  // Opciones comunes: 20, 30, 45, 60
  slotIntervalMinutes: 30,

  // 3. HORARIO DE APERTURA SEMANAL
  // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado
  // Puedes definir uno o dos turnos (mañana y tarde). Deja isOpen: false si está cerrado.
  weeklySchedule: {
    1: { isOpen: true,  shifts: [{ start: "10:00", end: "14:00" }, { start: "16:30", end: "20:00" }] }, // Lunes
    2: { isOpen: true,  shifts: [{ start: "10:00", end: "14:00" }, { start: "16:30", end: "20:00" }] }, // Martes
    3: { isOpen: true,  shifts: [{ start: "10:00", end: "14:00" }, { start: "16:30", end: "20:00" }] }, // Miércoles
    4: { isOpen: true,  shifts: [{ start: "10:00", end: "14:00" }, { start: "16:30", end: "20:00" }] }, // Jueves
    5: { isOpen: true,  shifts: [{ start: "10:00", end: "14:00" }, { start: "16:30", end: "20:30" }] }, // Viernes
    6: { isOpen: true,  shifts: [{ start: "10:00", end: "14:30" }] },                                     // Sábado (solo mañanas)
    0: { isOpen: false, shifts: [] }                                                                      // Domingo (Cerrado)
  },

  // 4. DÍAS FESTIVOS O VACACIONES COMPLETAS (Formato: "AAAA-MM-DD")
  closedDates: [
    "2026-09-11", // Festivo local
    "2026-10-12", // Fiesta nacional
    "2026-12-25"  // Navidad
  ],

  // 5. HORAS BLOQUEADAS O CITAS YA AGENDADAS (Formato: "AAAA-MM-DD": ["HH:MM", ...])
  // Añade la fecha y las horas que ya no están disponibles para que salgan en gris.
  blockedSlots: {
    "2026-09-01": ["10:30", "11:00", "17:30"],
    "2026-09-02": ["10:00", "12:30", "18:00", "18:30"],
    "2026-09-03": ["16:30", "17:00"]
  }
};


// =======================================================================
// LÓGICA DE CÁLCULO DE DISPONIBILIDAD (MOTOR LIGERO)
// =======================================================================

/**
 * Genera todos los slots horarios para un día específico según el horario semanal.
 * @param {string} dateStr - Fecha en formato "AAAA-MM-DD"
 * @returns {Array<{ time: string, isAvailable: boolean, reason?: string }>}
 */
function getDayTimeSlots(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  // A. Verificar si es un día festivo o cerrado completamente
  if (BARBER_SCHEDULE_CONFIG.closedDates.includes(dateStr)) {
    return []; // Día cerrado
  }

  const dayRule = BARBER_SCHEDULE_CONFIG.weeklySchedule[dayOfWeek];
  if (!dayRule || !dayRule.isOpen) {
    return []; // Cerrado este día de la semana
  }

  // B. Generar todas las franjas horarias a partir de los turnos
  const generatedSlots = [];
  const interval = BARBER_SCHEDULE_CONFIG.slotIntervalMinutes;
  const blockedForThisDate = BARBER_SCHEDULE_CONFIG.blockedSlots[dateStr] || [];

  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  dayRule.shifts.forEach(shift => {
    let startMin = timeStringToMinutes(shift.start);
    const endMin = timeStringToMinutes(shift.end);

    while (startMin < endMin) {
      const timeStr = minutesToTimeString(startMin);

      // Reglas de deshabilitación:
      // 1. Si está explícitamente bloqueada en blockedSlots
      const isExplicitlyBlocked = blockedForThisDate.includes(timeStr);

      // 2. Si es el día de hoy y la hora ya ha pasado
      const isPastTime = isToday && startMin <= currentMinutes;

      const isAvailable = !isExplicitlyBlocked && !isPastTime;

      generatedSlots.push({
        time: timeStr,
        isAvailable: isAvailable,
        reason: isExplicitlyBlocked ? "Ocupado" : (isPastTime ? "Hora pasada" : "Disponible")
      });

      startMin += interval;
    }
  });

  return generatedSlots;
}

// Helpers de conversión de tiempo
function timeStringToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeString(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
