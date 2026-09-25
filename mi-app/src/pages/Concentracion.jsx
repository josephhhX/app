import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Bell,
  BellOff,
  Flame,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { db } from '../db/db';

export function Concentracion() {
  const {
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
  } = useTimer();

  const tareas = useLiveQuery(() => db.tareas.where('estado').notEqual('hecha').toArray(), []);
  const sesionesHistorial = useLiveQuery(() => db.sesionesConcentracion.reverse().limit(10).toArray(), []);

  // Format time display MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress ring percentage calculation
  const getProgressPct = () => {
    if (mode === 'libre') return 100;
    const totalSecs = mode === 'pomodoro' ? (isBreak ? 5 * 60 : 25 * 60) : (isBreak ? 17 * 60 : 52 * 60);
    return Math.round(((totalSecs - timeLeft) / totalSecs) * 100);
  };

  // Total minutes focused today
  const todayStr = new Date().toISOString().split('T')[0];
  const totalMinutesToday = (sesionesHistorial || [])
    .filter(s => s.fecha && s.fecha.startsWith(todayStr))
    .reduce((acc, s) => acc + (s.duracion || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <TimerIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Modo Concentración</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Técnicas Pomodoro y 52/17 para mantener el enfoque sin distracciones.
          </p>
        </div>

        {/* Mute toggle button */}
        <button
          onClick={() => setMuteNotifications(!muteNotifications)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
            muteNotifications
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {muteNotifications ? <BellOff className="w-4 h-4 text-amber-500" /> : <Bell className="w-4 h-4" />}
          <span>{muteNotifications ? 'Notificaciones Silenciadas' : 'Notificaciones Activas'}</span>
        </button>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-3 gap-3 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setMode('pomodoro')}
          className={`py-2.5 rounded-xl transition text-center ${
            mode === 'pomodoro'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Pomodoro (25/5)
        </button>
        <button
          onClick={() => setMode('52/17')}
          className={`py-2.5 rounded-xl transition text-center ${
            mode === '52/17'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Método 52/17
        </button>
        <button
          onClick={() => setMode('libre')}
          className={`py-2.5 rounded-xl transition text-center ${
            mode === 'libre'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Tiempo Libre
        </button>
      </div>

      {/* Timer Digital Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg text-center space-y-6 relative overflow-hidden">
        {/* Break state banner */}
        {isBreak && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 py-1.5 px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 animate-pulse">
            <span>☕ ¡Tiempo de descanso! Relájate un momento.</span>
          </div>
        )}

        {/* Task Selection */}
        <div className="max-w-md mx-auto">
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Vincular sesión a una tarea (opcional)
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Trabajo General --</option>
            {tareas?.map(t => (
              <option key={t.id} value={t.id}>{t.texto}</option>
            ))}
          </select>
        </div>

        {/* Circular Display */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              className="text-slate-100 dark:text-slate-800 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50" cy="50" r="42"
              className={`${isBreak ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'} stroke-current transition-all duration-1000`}
              strokeWidth="6"
              strokeDasharray="263.89"
              strokeDashoffset={263.89 - (263.89 * getProgressPct()) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              {mode === 'libre' ? 'Cronómetro' : isBreak ? 'Descanso' : 'Enfoque Total'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {!isRunning ? (
            <button
              onClick={startTimer}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-indigo-500/30 transition transform active:scale-95 flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Iniciar</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-amber-500/30 transition transform active:scale-95 flex items-center gap-2"
            >
              <Pause className="w-5 h-5 fill-white" />
              <span>Pausar</span>
            </button>
          )}
        </div>

        {/* Completed sessions indicators */}
        {mode === 'pomodoro' && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-medium">Sesiones completadas hoy:</span>
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border ${
                    i < completedPomodoros
                      ? 'bg-indigo-600 border-indigo-600 shadow-sm'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              ({completedPomodoros})
            </span>
          </div>
        )}
      </div>

      {/* Stats Summary & History */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Tiempo Enfocado Hoy</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalMinutesToday} <span className="text-sm font-medium text-slate-500">minutos</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Historial Reciente</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
            {(!sesionesHistorial || sesionesHistorial.length === 0) ? (
              <span className="text-slate-400 text-xs italic">Aún no hay sesiones registradas hoy.</span>
            ) : (
              sesionesHistorial.map(s => (
                <div key={s.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="capitalize font-medium">Modo {s.tipo} ({s.duracion}m)</span>
                  <span className="text-slate-400">{new Date(s.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
