/**
 * Módulo de Reserva y Redirección a WhatsApp para Barbería
 * 
 * Funcionalidad:
 * - Valida campos requeridos (Servicio, Fecha, Hora, Nombre y Teléfono).
 * - Sanitiza y normaliza datos de entrada.
 * - Construye el mensaje preformateado en Español (ES) o Inglés (EN).
 * - Codifica el payload en URI Component y redirecciona a la API de WhatsApp (wa.me).
 */

// ==========================================
// 1. CONFIGURACIÓN
// ==========================================
const BOOKING_CONFIG = {
  // Número de teléfono del negocio con prefijo internacional (sin espacios, guiones ni '+')
  // Ejemplo: '34600112233' para España (+34)
  barberPhoneNumber: '34600112233',
  
  // Plantillas de mensaje bilingüe
  templates: {
    es: (service, date, time, name, phone) =>
      `Hola, quiero reservar una cita: ${service} el ${date} a las ${time}. A nombre de: ${name}. Mi teléfono: ${phone}.`,
    
    en: (service, date, time, name, phone) =>
      `Hello, I would like to book an appointment: ${service} on ${date} at ${time}. Name: ${name}. Phone: ${phone}.`
  }
};

// ==========================================
// 2. FUNCIÓN PRINCIPAL DE RESERVA
// ==========================================
/**
 * Procesa la confirmación de la cita, valida los datos y abre WhatsApp.
 * 
 * @param {Object} [bookingData] - Datos opcionales directos o lee del DOM si se omite.
 * @returns {boolean} - True si la validación fue exitosa y se abrió WhatsApp, False si falló.
 */
function handleBookingConfirmation(bookingData) {
  // A. Obtener datos (de parámetro o desde los elementos del DOM)
  const data = bookingData || extractBookingDataFromDOM();

  // B. Validar datos requeridos
  const validation = validateBookingData(data);
  if (!validation.isValid) {
    alert(validation.errorMessage);
    return false;
  }

  // C. Formatear el mensaje según el idioma seleccionado
  const lang = (data.lang && data.lang.toLowerCase() === 'en') ? 'en' : 'es';
  const messageBuilder = BOOKING_CONFIG.templates[lang];
  
  const rawMessage = messageBuilder(
    data.serviceName,
    data.dateFormatted,
    data.time,
    data.clientName,
    data.clientPhone
  );

  // D. Codificar mensaje en formato URI seguro
  const encodedMessage = encodeURIComponent(rawMessage);

  // E. Construir URL oficial de la API de WhatsApp
  const cleanPhoneNumber = BOOKING_CONFIG.barberPhoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;

  // F. Abrir WhatsApp en una nueva pestaña o app nativa
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  
  return true;
}

// ==========================================
// 3. EXTRACCIÓN DE DATOS DESDE EL DOM
// ==========================================
/**
 * Extrae los valores actuales de los selectores e inputs en el DOM.
 * @returns {Object}
 */
function extractBookingDataFromDOM() {
  // 1. Servicio seleccionado
  const selectedServiceEl = document.querySelector('[data-service-selected="true"]') ||
                            document.querySelector('.service-card.selected') ||
                            document.querySelector('input[name="service"]:checked');
  const serviceName = selectedServiceEl ? (selectedServiceEl.dataset.name || selectedServiceEl.value || selectedServiceEl.innerText.split('\n')[0]) : null;

  // 2. Fecha seleccionada
  const selectedDateEl = document.querySelector('[data-date-selected="true"]') ||
                         document.querySelector('.date-chip.selected') ||
                         document.getElementById('booking-date');
  const dateFormatted = selectedDateEl ? (selectedDateEl.dataset.formatted || selectedDateEl.value || selectedDateEl.innerText.trim().replace(/\n+/g, ' ')) : null;

  // 3. Hora seleccionada
  const selectedTimeEl = document.querySelector('[data-time-selected="true"]') ||
                         document.querySelector('.time-slot.selected') ||
                         document.getElementById('booking-time');
  const time = selectedTimeEl ? (selectedTimeEl.dataset.time || selectedTimeEl.value || selectedTimeEl.innerText.trim()) : null;

  // 4. Campos del cliente
  const nameInput = document.getElementById('client-name') || document.querySelector('input[name="client-name"]');
  const phoneInput = document.getElementById('client-phone') || document.querySelector('input[name="client-phone"]');

  const clientName = nameInput ? nameInput.value.trim() : '';
  const clientPhone = phoneInput ? phoneInput.value.trim() : '';

  // 5. Idioma activo (por defecto 'es')
  const lang = (window.currentLanguage || document.documentElement.lang || 'es').toLowerCase();

  return {
    lang,
    serviceName,
    dateFormatted,
    time,
    clientName,
    clientPhone
  };
}

// ==========================================
// 4. VALIDACIÓN DE CAMPOS
// ==========================================
/**
 * Valida que ningún campo obligatorio esté ausente o incompleto.
 * 
 * @param {Object} data - Objeto con los datos recolectados
 * @returns {{ isValid: boolean, errorMessage: string|null }}
 */
function validateBookingData(data) {
  const isEn = data.lang === 'en';

  if (!data.serviceName) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please select a service." : "Por favor, selecciona un servicio."
    };
  }

  if (!data.dateFormatted) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please select a date." : "Por favor, selecciona una fecha."
    };
  }

  if (!data.time) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please select an available time." : "Por favor, selecciona una hora disponible."
    };
  }

  if (!data.clientName || data.clientName.trim().length < 2) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please enter your full name." : "Por favor, introduce tu nombre completo."
    };
  }

  // Validación básica de teléfono (mínimo 6 dígitos)
  const phoneDigits = data.clientPhone.replace(/\D/g, '');
  if (!data.clientPhone || phoneDigits.length < 6) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please enter a valid phone number." : "Por favor, introduce un número de teléfono válido."
    };
  }

  return {
    isValid: true,
    errorMessage: null
  };
}
