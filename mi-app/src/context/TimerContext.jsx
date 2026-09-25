import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../db/db';
import { useNotification } from './NotificationContext';

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [mode, setModeState] = useState('pomodoro'); // 'pomodoro' | '52/17' | 'libre'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // In seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [muteNotifications, setMuteNotifications] = useState(false);
  const { sendNotification } = useNotification();

  const timerRef = useRef(null);

  // Set default times when mode or break state changes
  const resetTimerForMode = (newMode, inBreak = false) => {
    setIsRunning(false);
    setIsBreak(inBreak);
    if (newMode === 'pomodoro') {
      setTimeLeft(inBreak ? 5 * 60 : 25 * 60);
    } else if (newMode === '52/17') {
      setTimeLeft(inBreak ? 17 * 60 : 52 * 60);
    } else if (newMode === 'libre') {
      setTimeLeft(0);
    }
  };

  const setMode = (newMode) => {
    setModeState(newMode);
    resetTimerForMode(newMode, false);
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => resetTimerForMode(mode, isBreak);

  // Play audio alert beep
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio playback not supported:', e);
    }
  };

  const handleSessionComplete = async () => {
    playAlertSound();

    if (!isBreak) {
      // Focus session ended -> transition to Break
      const durationMin = mode === 'pomodoro' ? 25 : mode === '52/17' ? 52 : Math.round(timeLeft / 60);

      // Save session to IndexedDB
      await db.sesionesConcentracion.add({
        tipo: mode,
        duracion: durationMin,
        fecha: new Date().toISOString(),
        tareaId: selectedTaskId ? Number(selectedTaskId) : null
      });

      setCompletedPomodoros(prev => prev + 1);

      if (!muteNotifications) {
        sendNotification('🎉 ¡Sesión de Concentración Finalizada!', {
          body: `Completaste ${durationMin} minutos de enfoque. Tómate un descanso.`,
        });
      }

      if (mode === 'libre') {
        setIsRunning(false);
        setTimeLeft(0);
      } else {
        // Start break automatically or prompt
        resetTimerForMode(mode, true);
      }
    } else {
      // Break ended -> transition back to Focus
      if (!muteNotifications) {
        sendNotification('⏰ ¡Fin del Descanso!', {
          body: 'Es hora de volver a enfocarte.',
        });
      }
      resetTimerForMode(mode, false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (mode === 'libre') {
            return prev + 1;
          }
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, isBreak, selectedTaskId, muteNotifications]);

  return (
    <TimerContext.Provider value={{
      mode,
      setMode,
      timeLeft,
      isRunning,
      isBreak,
      completedPomodoros,
      selectedTaskId,
      setSelectedTaskId,
      muteNotifications,
      setMuteNotifications,
      startTimer,
      pauseTimer,
      resetTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);
