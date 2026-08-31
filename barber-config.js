/**
 * =========================================================================================
 * ARCHIVO: barber-config.js
 * PROPÓSITO: Panel de control de datos del negocio para el peluquero.
 * INSTRUCCIONES: Modifica únicamente los valores dentro de este objeto. No toques la lógica inferior.
 * =========================================================================================
 */

const BARBER_SCHEDULE_CONFIG = {
  // ---------------------------------------------------------------------------------------
  // 1. TELÉFONO DE RECEPCIÓN DE RESERVAS (WHATSAPP)
  // ---------------------------------------------------------------------------------------
  // Debe incluir el prefijo internacional del país sin el símbolo '+', sin espacios ni guiones.
  // Ejemplo España: "34600112233" (34 = código país, 600112233 = número móvil).
  whatsappPhone: "34600112233",

  // ---------------------------------------------------------------------------------------
  // 2. INTERVALO DE CADA CITA (DURACIÓN EN MINUTOS)
  // ---------------------------------------------------------------------------------------
  // Controla el salto de tiempo entre un botón y otro en la interfaz (ej. 15, 20, 30, 45, 60).
  slotIntervalMinutes: 30,

  // ---------------------------------------------------------------------------------------
  // 3. HORARIO SEMANAL DE APERTURA Y TURNOS
  // ---------------------------------------------------------------------------------------
  // Los días se identifican por números:
  // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado.
  //
  // - "isOpen": pon "true" si abre ese día, o "false" si está cerrado todo el día.
  // - "shifts": lista de turnos (mañana y/o tarde) con hora de inicio ("start") y fin ("end").
  weeklySchedule: {
    1: { // Lunes
      isOpen: true,
      shifts: [
        { start: "10:00", end: "14:00" }, // Turno de mañana
        { start: "16:30", end: "20:00" }  // Turno de tarde
      ]
    },
    2: { // Martes
      isOpen: true,
      shifts: [
        { start: "10:00", end: "14:00" },
        { start: "16:30", end: "20:00" }
      ]
    },
    3: { // Miércoles
      isOpen: true,
      shifts: [
        { start: "10:00", end: "14:00" },
        { start: "16:30", end: "20:00" }
      ]
    },
    4: { // Jueves
      isOpen: true,
      shifts: [
        { start: "10:00", end: "14:00" },
        { start: "16:30", end: "20:00" }
      ]
    },
    5: { // Viernes
      isOpen: true,
      shifts: [
        { start: "10:00", end: "14:00" },
        { start: "16:30", end: "20:30" }
      ]
    },
    6: { // Sábado (solo turno de mañana)
      isOpen: true,
      shifts: [
        { start: "10:00", end: "14:30" }
      ]
    },
    0: { // Domingo (Cerrado)
      isOpen: false,
      shifts: []
    }
  },

  // ---------------------------------------------------------------------------------------
  // 4. DÍAS FESTIVOS O VACACIONES COMPLETAS (CIERRE TOTAL)
  // ---------------------------------------------------------------------------------------
  // Formato estricto: "AAAA-MM-DD" (Año con 4 cifras, Mes con 2 cifras, Día con 2 cifras).
  // Estos días no permitirán seleccionar ninguna hora.
  closedDates: [
    "2026-09-11", // Ejemplo: Fiesta local
    "2026-10-12", // Ejemplo: Fiesta nacional
    "2026-12-25"  // Ejemplo: Navidad
  ],

  // ---------------------------------------------------------------------------------------
  // 5. BLOQUEO DE HORAS PUNTUALES / CITAS YA AGENDADAS
  // ---------------------------------------------------------------------------------------
  // Formato: "AAAA-MM-DD": ["HH:MM", "HH:MM", ...]
  // Cuando un cliente reserve una hora (o tú cojas una cita por teléfono), anótala aquí
  // y esa hora aparecerá automáticamente en color gris y tachada (no seleccionable).
  blockedSlots: {
    "2026-09-01": ["10:30", "11:00", "17:30"],
    "2026-09-02": ["10:00", "12:30", "18:00"],
    "2026-09-03": ["16:30", "17:00"]
  }
};


// =========================================================================================
// MOTOR INTERNO DE CÁLCULO DE DISPONIBILIDAD (NO ES NECESARIO MODIFICAR ESTO)
// =========================================================================================

/**
 * Calcula dinámicamente las horas disponibles de un día en función de turnos,
 * horas bloqueadas y la hora actual del sistema (si se consulta el día de hoy).
 * 
 * @param {string} dateStr - Fecha solicitada en formato "AAAA-MM-DD"
 * @returns {Array<{ time: string, isAvailable: boolean, reason?: string }>}
 */
function getDayTimeSlots(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  // Paso A: Comprobar si el día entero está cerrado por festivo o vacaciones
  if (BARBER_SCHEDULE_CONFIG.closedDates.includes(dateStr)) {
    return [];
  }

  // Paso B: Comprobar si el día de la semana tiene apertura configurada
  const dayRule = BARBER_SCHEDULE_CONFIG.weeklySchedule[dayOfWeek];
  if (!dayRule || !dayRule.isOpen) {
    return [];
  }

  const generatedSlots = [];
  const interval = BARBER_SCHEDULE_CONFIG.slotIntervalMinutes;
  const blockedForThisDate = BARBER_SCHEDULE_CONFIG.blockedSlots[dateStr] || [];

  // Variables para deshabilitar horas pasadas si el usuario consulta el día de hoy
  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Paso C: Iterar sobre cada turno y trocearlo en intervalos regulares
  dayRule.shifts.forEach(shift => {
    let startMin = timeStringToMinutes(shift.start);
    const endMin = timeStringToMinutes(shift.end);

    while (startMin < endMin) {
      const timeStr = minutesToTimeString(startMin);

      // 1. ¿Está bloqueada manualmente por el peluquero?
      const isExplicitlyBlocked = blockedForThisDate.includes(timeStr);

      // 2. ¿Es hoy y la hora ya ha pasado?
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

/**
 * Convierte un string de hora tipo "14:30" a minutos totales (870 min).
 */
function timeStringToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Convierte minutos totales (ej. 870 min) a formato legible "14:30".
 */
function minutesToTimeString(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
