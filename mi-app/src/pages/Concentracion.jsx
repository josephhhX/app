import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Settings,
  X,
  Check
} from 'lucide-react';
import { db } from '../db/db';
import { useTimer } from '../context/TimerContext';
import { useNavigate } from 'react-router-dom';

export function Concentracion() {
  const navigate = useNavigate();
  const {
    mode,
    setMode,
    timeLeft,
    isRunning,
    isBreak,
    completedPomodoros,
    selectedTaskId,
    setSelectedTaskId,
    startTimer,
    pauseTimer,
    resetTimer
  } = useTimer();

  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const sesiones = useLiveQuery(() => db.sesionesConcentracion.orderBy('fecha').reverse().limit(5).toArray(), []);
  const [selectedMateriaId, setSelectedMateriaId] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const selectedMateria = (materias || []).find(m => m.id === Number(selectedMateriaId));

  // Format time MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Progress percentage
  const totalSeconds = mode === 'pomodoro' ? (isBreak ? 5 * 60 : 25 * 60) : mode === '52/17' ? (isBreak ? 17 * 60 : 52 * 60) : 60 * 60;
  const progressPct = mode === 'libre' ? 100 : Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  // Stroke offset for 280 circumference (radius 44)
  const strokeDashoffset = 276.46 - (276.46 * progressPct) / 100;

  return (
    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
      
      {/* 1. HEADER (Mockup 4) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#163a34] dark:text-[#e4eee9]">
          Sesiones
        </h1>
        <button
          onClick={() => navigate('/mas')}
          className="p-2 rounded-xl bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          title="Ajustes"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[{label:'Lectura', mode:'pomodoro', goal:'Leer y tomar apuntes'},{label:'Repaso', mode:'52/17', goal:'Repasar el tema'},{label:'Libre', mode:'libre', goal:'Estudio libre'}].map(template => (
          <button key={template.label} onClick={() => { setMode(template.mode); setObjetivo(template.goal); }} className="jami-card p-3 text-center hover:border-[#184a42]/40 transition">
            <span className="block text-xs font-extrabold text-slate-700 dark:text-slate-100">{template.label}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">{template.mode === 'pomodoro' ? '25 min' : template.mode === '52/17' ? '52 min' : 'Sin límite'}</span>
          </button>
        ))}
      </div>

      {/* 2. MODE SELECTOR PILLS (Mockup 4) */}
      <div className="flex items-center justify-center p-1 rounded-full bg-[#ebf2ee] dark:bg-[#142722] text-xs font-bold gap-1">
        <button
          onClick={() => setMode('pomodoro')}
          className={`flex-1 py-2 rounded-full transition text-center ${
            mode === 'pomodoro'
              ? 'bg-[#184a42] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => setMode('52/17')}
          className={`flex-1 py-2 rounded-full transition text-center ${
            mode === '52/17'
              ? 'bg-[#184a42] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          52/17
        </button>
        <button
          onClick={() => setMode('libre')}
          className={`flex-1 py-2 rounded-full transition text-center ${
            mode === 'libre'
              ? 'bg-[#184a42] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Libre
        </button>
      </div>

      {/* 3. CIRCULAR PROGRESS TIMER (Mockup 4) */}
      <div className="jami-card p-8 flex flex-col items-center justify-center space-y-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[#dbece7] dark:stroke-[#1d3831]"
              strokeWidth="4.5"
              fill="transparent"
            />
            {/* Active progress */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[#184a42] dark:stroke-[#58b7a6] transition-all duration-1000"
              strokeWidth="4.5"
              strokeDasharray="276.46"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time text in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              {timeFormatted}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-1">
              {isBreak ? 'Descanso' : 'Enfoque'}
            </span>
          </div>
        </div>

        {/* Controls: Play & Reset */}
        <div className="flex items-center gap-4">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="w-14 h-14 rounded-full bg-[#184a42] hover:bg-[#133c35] text-white flex items-center justify-center shadow-lg shadow-[#184a42]/25 transition transform active:scale-95"
            title={isRunning ? 'Pausar' : 'Iniciar'}
          >
            {isRunning ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={resetTimer}
            className="w-11 h-11 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#152320] text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-center transition active:scale-95 shadow-xs"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. SELECTION CARDS (Mockup 4) */}
      <div className="space-y-3">
        {/* Materia Card */}
        <div
          onClick={() => setShowSubjectPicker(true)}
          className="jami-card p-4 flex items-center justify-between cursor-pointer hover:border-[#184a42]/30 transition group"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Materia
            </span>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs shadow-xs"
                style={{ backgroundColor: selectedMateria?.color || '#1b7a4e' }}
              >
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                {selectedMateria?.nombre || 'Seleccionar materia'}
              </span>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
        </div>

        {/* Objetivo Card */}
        <div className="jami-card p-4 space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Objetivo (opcional)
          </label>
          <input
            type="text"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            placeholder="ej. Ejercicios de derivadas"
            className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 5. MOTIVATIONAL BANNER (Mockup 4 bottom) */}
      <div className="text-center py-2 text-xs font-semibold text-[#184a42] dark:text-[#6ee7b7] flex items-center justify-center gap-1.5">
        <span>🌱</span>
        <span>Pequeños esfuerzos, grandes resultados</span>
      </div>

      <section className="jami-card p-4 space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Actividad reciente</h2><span className="text-[10px] text-slate-400">Últimas sesiones</span></div>
        {!sesiones?.length ? <div className="rounded-2xl bg-slate-50 dark:bg-[#152d26] p-4 text-center"><p className="text-xs font-bold text-slate-600 dark:text-slate-300">Aún no hay sesiones completadas</p><p className="mt-1 text-[11px] text-slate-400">Inicia una plantilla para registrar tu primer bloque.</p></div> : sesiones.map(session => <div key={session.id} className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs"><span className="font-semibold capitalize text-slate-700 dark:text-slate-200">{session.tipo}</span><span className="text-slate-400">{session.duracion} min · {new Date(session.fecha).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span></div>)}
      </section>

      {/* SUBJECT PICKER MODAL */}
      {showSubjectPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#14221f] rounded-3xl p-5 max-w-xs w-full space-y-3 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Elige una materia
              </h3>
              <button onClick={() => setShowSubjectPicker(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto">
              <button
                onClick={() => { setSelectedMateriaId(''); setShowSubjectPicker(false); }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  !selectedMateriaId ? 'bg-[#ebf8f2] text-[#1b7a4e]' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>General / Ninguna</span>
                {!selectedMateriaId && <Check className="w-3.5 h-3.5" />}
              </button>

              {(materias || []).map(m => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMateriaId(m.id); setShowSubjectPicker(false); }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                    selectedMateriaId === m.id ? 'bg-[#ebf8f2] text-[#1b7a4e]' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color || '#184a42' }} />
                    <span>{m.nombre}</span>
                  </div>
                  {selectedMateriaId === m.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
