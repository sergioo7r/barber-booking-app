// ==============================================================================
// LC BARBER TRIANA — Cliente API & Adaptador Híbrido (Cloud + Offline-First)
// ==============================================================================
(function(window) {
  'use strict';

  const API_BASE = (window.location && window.location.origin && window.location.origin.startsWith('http')) 
    ? '' 
    : 'https://barber-booking-topaz.vercel.app';

  const ApiClient = {
    isOnline: false,

    async checkHealth() {
      try {
        const res = await fetch(API_BASE + '/api/health', { method: 'GET', headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          this.isOnline = true;
          console.log('⚡ [API Engine] Conectado a Vercel Serverless:', data);
          return data;
        }
      } catch (err) {
        console.warn('⚡ [API Engine] Modo offline/localstorage activo:', err.message);
      }
      this.isOnline = false;
      return null;
    },

    async getBookings(date) {
      try {
        const url = date ? (API_BASE + '/api/bookings?date=' + encodeURIComponent(date)) : (API_BASE + '/api/bookings');
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          return json.bookings || [];
        }
      } catch (e) {}
      return window.STORE ? window.STORE.getAppointments() : [];
    },

    async createBooking(bookingData) {
      try {
        const res = await fetch(API_BASE + '/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });
        if (res.ok) {
          const json = await res.json();
          console.log('⚡ [API Engine] Cita sincronizada con backend:', json.booking);
          return json;
        }
      } catch (e) {
        console.warn('⚡ [API Engine] Guardando en local (fallback):', e.message);
      }
      return { success: true, localOnly: true, booking: bookingData };
    },

    async updateBookingStatus(id, status) {
      try {
        const res = await fetch(API_BASE + '/api/bookings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id, status: status })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return { success: true };
    },

    async getServices() {
      try {
        const res = await fetch(API_BASE + '/api/services');
        if (res.ok) {
          const json = await res.json();
          return json.services || [];
        }
      } catch (e) {}
      return window.STORE ? window.STORE.getServices() : [];
    },

    async updateServicePrice(id, newPrice) {
      try {
        const res = await fetch(API_BASE + '/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id, price: newPrice })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
      return { success: true };
    },

    async checkAvailability(date) {
      try {
        const res = await fetch(API_BASE + '/api/availability?date=' + encodeURIComponent(date));
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    }
  };

  window.ApiClient = ApiClient;

  // Auto-comprobar estado en segundo plano al cargar
  window.addEventListener('DOMContentLoaded', function() {
    ApiClient.checkHealth();
  });
})(window);
