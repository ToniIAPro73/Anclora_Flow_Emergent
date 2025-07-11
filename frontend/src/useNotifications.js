// useNotifications.js - Hook personalizado para manejar notificaciones
import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered:', reg);
          setRegistration(reg);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Notifications not supported');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const showNotification = useCallback(async (title, options = {}) => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      ...options
    };

    if (registration) {
      return registration.showNotification(title, defaultOptions);
    } else {
      return new Notification(title, defaultOptions);
    }
  }, [permission, registration]);

  const scheduleNotification = useCallback(async (title, options, delay) => {
    setTimeout(() => {
      showNotification(title, options);
    }, delay);
  }, [showNotification]);

  const scheduleBudgetAlert = useCallback(async (category, percentage, limit, spent) => {
    const title = '⚠️ Alerta de Presupuesto';
    const body = `Has gastado $${spent.toFixed(2)} de $${limit.toFixed(2)} en "${category}" (${percentage.toFixed(1)}%)`;
    
    return showNotification(title, {
      body,
      data: { url: '/advanced-budget', type: 'budget-alert' },
      actions: [
        { action: 'view-budget', title: 'Ver Presupuesto' },
        { action: 'dismiss', title: 'Descartar' }
      ]
    });
  }, [showNotification]);

  const scheduleAnclaReminder = useCallback(async (ancla, minutesBefore = 30) => {
    const now = new Date();
    const anclaTime = new Date(ancla.start_date);
    const reminderTime = new Date(anclaTime.getTime() - (minutesBefore * 60 * 1000));
    
    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        const title = '⚓ Recordatorio de Ancla';
        const body = `"${ancla.title}" comienza en ${minutesBefore} minutos`;
        
        showNotification(title, {
          body,
          data: { url: '/dashboard', type: 'ancla-reminder' },
          actions: [
            { action: 'view-ancla', title: 'Ver Ancla' },
            { action: 'snooze', title: 'Recordar en 10 min' },
            { action: 'dismiss', title: 'Descartar' }
          ]
        });
      }, delay);
    }
  }, [showNotification]);

  const scheduleSavingsGoalUpdate = useCallback(async (goal, milestone) => {
    const title = '🏦 Meta de Ahorro';
    let body;
    
    if (milestone === 'completed') {
      body = `¡Felicidades! Has completado tu meta "${goal.title}"`;
    } else if (milestone === 'progress') {
      const percentage = (goal.current_amount / goal.target_amount * 100);
      body = `Has alcanzado el ${percentage.toFixed(1)}% de tu meta "${goal.title}"`;
    } else if (milestone === 'deadline') {
      body = `Tu meta "${goal.title}" vence pronto. ¡Sigue ahorrando!`;
    }
    
    return showNotification(title, {
      body,
      data: { url: '/advanced-budget', type: 'savings-goal' },
      actions: [
        { action: 'view-savings', title: 'Ver Ahorros' },
        { action: 'add-money', title: 'Añadir Dinero' },
        { action: 'dismiss', title: 'Descartar' }
      ]
    });
  }, [showNotification]);

  const scheduleHabitReminder = useCallback(async (habit, time = '09:00') => {
    const title = '📊 Recordatorio de Hábito';
    const body = `Es hora de "${habit.name}". ¡Mantén tu racha!`;
    
    // Calculate time until next reminder
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const delay = reminderTime.getTime() - now.getTime();
    
    setTimeout(() => {
      showNotification(title, {
        body,
        data: { url: '/dashboard', type: 'habit-reminder' },
        actions: [
          { action: 'mark-done', title: 'Marcar Hecho' },
          { action: 'snooze', title: 'Recordar más tarde' },
          { action: 'dismiss', title: 'Descartar' }
        ]
      });
    }, delay);
  }, [showNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    scheduleNotification,
    scheduleBudgetAlert,
    scheduleAnclaReminder,
    scheduleSavingsGoalUpdate,
    scheduleHabitReminder
  };
};

export default useNotifications;