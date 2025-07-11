// Anclora Service Worker - Notificaciones Web
const CACHE_NAME = 'anclora-notifications-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Anclora Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Anclora Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-budget-alerts') {
    event.waitUntil(checkBudgetAlerts());
  } else if (event.tag === 'check-ancla-reminders') {
    event.waitUntil(checkAnclaReminders());
  } else if (event.tag === 'check-savings-goals') {
    event.waitUntil(checkSavingsGoals());
  }
});

// Push event for receiving notifications
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'Tienes una nueva notificación de Anclora',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.url || '/',
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '⚓ Anclora',
      options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Handle notification click
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If the app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        const targetUrl = event.notification.data || '/';
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Function to check budget alerts
async function checkBudgetAlerts() {
  try {
    // This would typically fetch from your API
    // For now, we'll show a sample notification
    const notificationData = {
      title: '⚠️ Alerta de Presupuesto',
      body: 'Has superado el 90% de tu límite de gastos en "Alimentación"',
      url: '/advanced-budget'
    };

    await showNotification(notificationData);
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
}

// Function to check ancla reminders
async function checkAnclaReminders() {
  try {
    const notificationData = {
      title: '⚓ Recordatorio de Ancla',
      body: 'Tienes una tarea pendiente que vence en 30 minutos',
      url: '/dashboard'
    };

    await showNotification(notificationData);
  } catch (error) {
    console.error('Error checking ancla reminders:', error);
  }
}

// Function to check savings goals
async function checkSavingsGoals() {
  try {
    const notificationData = {
      title: '🏦 Meta de Ahorro',
      body: '¡Felicidades! Has alcanzado el 75% de tu meta "Vacaciones de verano"',
      url: '/advanced-budget'
    };

    await showNotification(notificationData);
  } catch (error) {
    console.error('Error checking savings goals:', error);
  }
}

// Helper function to show notification
async function showNotification(data) {
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.url,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
    timestamp: Date.now()
  };

  await self.registration.showNotification(data.title, options);
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(
      Promise.all([
        checkBudgetAlerts(),
        checkAnclaReminders(),
        checkSavingsGoals()
      ])
    );
  }
});