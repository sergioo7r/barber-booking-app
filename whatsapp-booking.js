/**
 * =========================================================================================
 * ARCHIVO: whatsapp-booking.js
 * PROPÓSITO: Validador de formulario, formateador de texto y generador de URL de WhatsApp.
 * INSTRUCCIONES: Puedes personalizar las frases de los mensajes en BOOKING_CONFIG.templates.
 * =========================================================================================
 */

// =========================================================================================
// 1. PLANTILLAS DE MENSAJE PERSONALIZABLES
// =========================================================================================
const BOOKING_CONFIG = {
  // Número de teléfono (se sincroniza automáticamente con barber-config.js si está presente)
  barberPhoneNumber: '34600112233',

  // Mensaje que recibirá el peluquero cuando el cliente pulse "Confirmar cita"
  // Puedes cambiar el texto o el orden de los datos según tus preferencias.
  templates: {
    // Versión en Español
    es: (service, date, time, name, phone) =>
      `Hola, quiero reservar una cita: ${service} el ${date} a las ${time}. A nombre de: ${name}. Mi teléfono: ${phone}.`,

    // Versión en Inglés (para turistas / clientes extranjeros)
    en: (service, date, time, name, phone) =>
      `Hello, I would like to book an appointment: ${service} on ${date} at ${time}. Name: ${name}. Phone: ${phone}.`
  }
};


// =========================================================================================
// 2. FUNCIÓN PRINCIPAL DE CONFIRMACIÓN
// =========================================================================================
/**
 * Se ejecuta al hacer clic en el botón principal.
 * Valida los datos y abre la app de WhatsApp con el mensaje ya escrito.
 * 
 * @param {Object} [bookingData] - Objeto con datos de la cita (opcional)
 * @returns {boolean} - Devuelve true si la validación fue correcta y se abrió WhatsApp.
 */
function handleBookingConfirmation(bookingData) {
  // Paso 1: Obtener los datos (o extraerlos del DOM si no se pasaron como argumento)
  const data = bookingData || extractBookingDataFromDOM();

  // Paso 2: Validar que el cliente haya completado todos los pasos
  const validation = validateBookingData(data);
  if (!validation.isValid) {
    alert(validation.errorMessage); // Alerta amigable si falta algún dato
    return false;
  }

  // Paso 3: Detectar el idioma y armar el mensaje correspondiente
  const lang = (data.lang && data.lang.toLowerCase() === 'en') ? 'en' : 'es';
  const messageTemplate = BOOKING_CONFIG.templates[lang];

  const rawMessage = messageTemplate(
    data.serviceName,
    data.dateFormatted,
    data.time,
    data.clientName,
    data.clientPhone
  );

  // Paso 4: Codificar el mensaje para que sea válido dentro de una URL de internet (URI Encode)
  // Convierte espacios, tildes y saltos de línea a caracteres seguros (%20, %C3%A1, etc.)
  const encodedMessage = encodeURIComponent(rawMessage);

  // Paso 5: Construir la URL oficial de la API de WhatsApp
  const cleanPhone = BOOKING_CONFIG.barberPhoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  // Paso 6: Abrir WhatsApp en una nueva pestaña (o en la App si está en móvil)
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  return true;
}


// =========================================================================================
// 3. REGLAS DE VALIDACIÓN DE CAMPOS
// =========================================================================================
/**
 * Comprueba que el formulario cumpla todas las condiciones antes de enviar.
 * 
 * @param {Object} data - Datos recogidos del cliente
 * @returns {{ isValid: boolean, errorMessage: string|null }}
 */
function validateBookingData(data) {
  const isEn = data.lang === 'en';

  // 1. ¿Ha seleccionado un servicio?
  if (!data.serviceName) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please select a service." : "Por favor, selecciona un servicio."
    };
  }

  // 2. ¿Ha seleccionado una fecha?
  if (!data.dateFormatted) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please select a date." : "Por favor, selecciona una fecha."
    };
  }

  // 3. ¿Ha seleccionado una hora?
  if (!data.time) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please select an available time." : "Por favor, selecciona una hora disponible."
    };
  }

  // 4. ¿Ha escrito su nombre (mínimo 2 letras)?
  if (!data.clientName || data.clientName.trim().length < 2) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please enter your full name." : "Por favor, introduce tu nombre completo."
    };
  }

  // 5. ¿Ha escrito un teléfono con al menos 6 dígitos numéricos?
  const numericDigits = data.clientPhone ? data.clientPhone.replace(/\D/g, '') : '';
  if (!data.clientPhone || numericDigits.length < 6) {
    return {
      isValid: false,
      errorMessage: isEn ? "Please enter a valid phone number." : "Por favor, introduce un número de teléfono válido."
    };
  }

  // Todos los campos son correctos
  return { isValid: true, errorMessage: null };
}


// =========================================================================================
// 4. EXTRACTOR AUTOMÁTICO DE DATOS DEL DOM (FALLBACK)
// =========================================================================================
/**
 * Extrae los valores seleccionados directamente de los elementos HTML de la página.
 */
function extractBookingDataFromDOM() {
  return {
    lang: document.documentElement.lang || 'es',
    serviceName: document.querySelector('[data-service-selected="true"]')?.dataset.name || null,
    dateFormatted: document.querySelector('[data-date-selected="true"]')?.dataset.formatted || null,
    time: document.querySelector('[data-time-selected="true"]')?.dataset.time || null,
    clientName: document.getElementById('client-name')?.value.trim() || '',
    clientPhone: document.getElementById('client-phone')?.value.trim() || ''
  };
}
