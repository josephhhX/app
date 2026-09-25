import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { db } from '../db/db';

const StreakContext = createContext();

export function StreakProvider({ children }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    db.configuracion.get('streakCount').then(item => {
      if (item) setStreak(Number(item.value) || 0);
    });
  }, []);

  const triggerStreakCheck = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDateItem = await db.configuracion.get('lastCompletedDate');
    const lastDate = lastDateItem ? lastDateItem.value : null;

    if (lastDate === todayStr) {
      // Already incremented today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastDate === yesterdayStr) {
      // Continued streak!
      const currentStreakItem = await db.configuracion.get('streakCount');
      const currentStreak = currentStreakItem ? Number(currentStreakItem.value) : 0;
      newStreak = currentStreak + 1;
    }

    setStreak(newStreak);
    await db.configuracion.put({ key: 'streakCount', value: newStreak });
    await db.configuracion.put({ key: 'lastCompletedDate', value: todayStr });

    // Confetti celebration! 🎉
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <StreakContext.Provider value={{ streak, triggerStreakCheck }}>
      {children}
    </StreakContext.Provider>
  );
}

export const useStreak = () => useContext(StreakContext);
