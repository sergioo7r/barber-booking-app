# Barber Booking WebApp — Mobile First (QR Ready)

Webapp minimalista, ultrarrápida y mobile-first para reserva de citas en peluquerías y barberías tradicionales en zonas turísticas o de barrio. Diseñada para ser escaneada directamente desde un código QR en la puerta del local.

## Características principales

- **Mobile First & Ultra Ligero**: Carga instantánea, sin frameworks pesados, 100% optimizado para navegación táctil (`touch-friendly`).
- **Diseño Minimalista y Sobrio**: Paleta oscura de alto contraste (`zinc-950`), tipografía *Inter*, cero emojis en la UI, solo iconos vectoriales SVG.
- **Bilingüe (ES / EN)**: Cambio dinámico de idioma en un clic con persistencia en el mensaje generado.
- **Flujo de Reserva en 3 Pasos**:
  1. Selección de servicio con duración y precio.
  2. Selector horizontal de días hábiles y cuadrícula de horas disponibles.
  3. Formulario simplificado (Nombre y Teléfono móvil).
- **Gestión de Horarios y Bloqueos sin Backend (`barber-config.js`)**:
  - Horario semanal configurable por turnos (mañana/tarde).
  - Días festivos o vacaciones completas.
  - Bloqueo instantáneo de horas ocupadas sin tocar código complejo.
- **Confirmación directa vía WhatsApp**: Genera la URL con el mensaje estructurado y codificado para confirmar la cita al instante.
- **Cero Costes de Mantenimiento**: Desplegable gratuitamente en GitHub Pages, Cloudflare Pages o Vercel.

---

## Estructura de Archivos

```
├── index.html            # Interfaz de usuario (HTML5 semántico + Tailwind CSS + JS)
├── barber-config.js      # Configuración de horarios, festivos y horas bloqueadas
├── whatsapp-booking.js   # Validador y generador de enlace a la API de WhatsApp
└── README.md             # Documentación del proyecto
```

---

## Cómo configurar para tu barbería

1. Abre `barber-config.js`.
2. Introduce tu número de teléfono de WhatsApp en `whatsappPhone` (ejemplo: `"34600112233"`).
3. Ajusta los turnos de apertura en `weeklySchedule`.
4. Para bloquear una hora ocupada, agrégala en `blockedSlots` con la fecha correspondiente:
   ```javascript
   blockedSlots: {
     "2026-09-01": ["10:30", "11:00", "17:30"]
   }
   ```

---

## Despliegue en GitHub Pages (Gratis)

1. Ve a **Settings** > **Pages** en tu repositorio de GitHub.
2. En **Build and deployment** > **Branch**, selecciona `main` y la carpeta `/ (root)`.
3. Haz clic en **Save**. En pocos segundos tendrás tu URL pública lista para generar el código QR.
