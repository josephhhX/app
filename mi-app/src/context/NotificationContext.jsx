import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { db } from '../db/db';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [permission, setPermission] = useState('Notification' in window ? Notification.permission : 'unsupported');
  const [batteryAlertDismissed, setBatteryAlertDismissed] = useState(false);
  const [offsetMinutes, setOffsetMinutes] = useState(15);
  const notifiedEventsRef = useRef(new Set());

  useEffect(() => {
    // Load config from DB
    db.configuracion.get('batteryAlertDismissed').then(item => {
      if (item) setBatteryAlertDismissed(Boolean(item.value));
    });
    db.configuracion.get('notificationTimeOffset').then(item => {
      if (item) setOffsetMinutes(Number(item.value) || 15);
    });
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta Notificaciones.');
      return 'unsupported';
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      return res;
    } catch (e) {
      console.error('Error pidiendo permiso de notificación:', e);
      return 'denied';
    }
  };

  const updateOffsetMinutes = async (mins) => {
    setOffsetMinutes(mins);
    await db.configuracion.put({ key: 'notificationTimeOffset', value: mins });
  };

  const dismissBatteryAlert = async () => {
    setBatteryAlertDismissed(true);
    await db.configuracion.put({ key: 'batteryAlertDismissed', value: true });
  };

  const sendNotification = (title, options = {}) => {
    if (permission === 'granted' && 'Notification' in window) {
      try {
        const defaultOptions = {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          ...options
        };
        // Use service worker notification if available, else standard window Notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, defaultOptions);
          });
        } else {
          new Notification(title, defaultOptions);
        }
      } catch (err) {
        console.error('Error lanzando notificación:', err);
      }
    }
  };

  // Background interval checker for class reminders & upcoming task deadlines
  useEffect(() => {
    const checkScheduleAndTasks = async () => {
      if (permission !== 'granted') return;

      const now = new Date();
      const currentDayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][now.getDay()];
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      // 1. Check Materias Schedule
      const materias = await db.materias.toArray();
      materias.forEach(m => {
        if (!m.horarios) return;
        m.horarios.forEach(h => {
          if (h.diaSemana === currentDayName && h.horaInicio) {
            const [hHours, hMins] = h.horaInicio.split(':').map(Number);
            const classStartMinutes = hHours * 60 + hMins;
            const diff = classStartMinutes - nowMinutes;

            // Trigger if diff matches configured offset (e.g. 15 minutes)
            const eventId = `class-${m.id}-${currentDayName}-${h.horaInicio}-${now.toDateString()}`;
            if (diff > 0 && diff <= offsetMinutes && !notifiedEventsRef.current.has(eventId)) {
              notifiedEventsRef.current.add(eventId);
              sendNotification(`Próxima Clase: ${m.nombre}`, {
                body: `Comienza en ${diff} min (${h.horaInicio}) en ${m.aula || 'Aula no especificada'}. Profesor: ${m.profesor || 'Por definir'}`,
                tag: eventId
              });
            }
          }
        });
      });

      // 2. Configurable reminders for tasks and one-off events.
      const checkReminder = (item, date, time, kind) => {
        const minutes = Number(item.recordatorioMinutos);
        if (!date || !time || !Number.isFinite(minutes)) return;
        const due = new Date(`${date}T${time}`);
        const diff = Math.round((due - now) / 60000);
        const eventId = `${kind}-${item.id}-${date}-${time}-${minutes}`;
        if (diff >= 0 && diff <= minutes && !notifiedEventsRef.current.has(eventId)) {
          notifiedEventsRef.current.add(eventId);
          sendNotification(`${kind === 'task' ? 'Tarea' : 'Evento'} próximo: ${item.texto || item.titulo}`, { body: `Empieza o vence en ${diff} min.`, tag: eventId });
        }
      };
      const tasks = await db.tareas.where('estado').notEqual('hecha').toArray();
      tasks.forEach(t => {
        checkReminder(t, t.fechaLimite, t.horaLimite || '09:00', 'task');
      });
      const events = await db.eventos.toArray();
      events.forEach(event => checkReminder(event, event.fecha, event.horaInicio, 'event'));
    };

    checkScheduleAndTasks();
    const interval = setInterval(checkScheduleAndTasks, 45000); // Check every 45s
    return () => clearInterval(interval);
  }, [permission, offsetMinutes]);

  return (
    <NotificationContext.Provider value={{
      permission,
      requestPermission,
      sendNotification,
      batteryAlertDismissed,
      dismissBatteryAlert,
      offsetMinutes,
      updateOffsetMinutes
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
