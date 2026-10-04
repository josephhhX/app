import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  FileText,
  Calendar,
  Lightbulb,
  Plus,
  BookOpen,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function AddActionModal({ isOpen, onClose, defaultMode = 'menu' }) {
  const [activeView, setActiveView] = useState(defaultMode); // 'menu', 'tarea', 'evento', 'idea'
  
  // Note inline form
  const [notaTexto, setNotaTexto] = useState('');
  const [notaCategoria, setNotaCategoria] = useState('Ideas');
  const [notaColor, setNotaColor] = useState('yellow'); // yellow, blue, green, pink, purple

  // Task form
  const [taskTitulo, setTaskTitulo] = useState('');
  const [taskMateriaId, setTaskMateriaId] = useState('');
  const [taskFecha, setTaskFecha] = useState(new Date().toISOString().split('T')[0]);
  const [taskHora, setTaskHora] = useState('16:00');
  const [taskPrioridad, setTaskPrioridad] = useState('media'); // urgente, media, baja, ninguna

  // Event form
  const [eventoTitulo, setEventoTitulo] = useState('');
  const [eventoMateriaId, setEventoMateriaId] = useState('');
  const [eventoLugar, setEventoLugar] = useState('Aula virtual');
  const [eventoHoraInicio, setEventoHoraInicio] = useState('08:00');
  const [eventoHoraFin, setEventoHoraFin] = useState('10:00');
  const [eventoTipo, setEventoTipo] = useState('clase'); // clase, tutoria, entrega, almuerzo, estudio

  // Idea/Goal form
  const [ideaTitulo, setIdeaTitulo] = useState('');

  const materias = useLiveQuery(() => db.materias.toArray(), []);

  if (!isOpen) return null;

  const handleSaveNota = async (e) => {
    e?.preventDefault();
    if (!notaTexto.trim()) return;

    const colorsMap = {
      'Ideas': 'yellow',
      'Fórmulas': 'blue',
      'Libros': 'green',
      'Dudas': 'pink',
      'General': 'purple'
    };

    const iconMap = {
      'Ideas': 'lightbulb',
      'Fórmulas': 'flask',
      'Libros': 'check',
      'Dudas': 'question',
      'General': 'document'
    };

    await db.notasRapidas.add({
      titulo: notaTexto.trim().slice(0, 36),
      texto: notaTexto.trim(),
      categoria: notaCategoria,
      color: colorsMap[notaCategoria] || 'yellow',
      icono: iconMap[notaCategoria] || 'lightbulb',
      fecha: new Date().toISOString()
    });

    setNotaTexto('');
    onClose();
  };

  const handleSaveTask = async (e) => {
    e?.preventDefault();
    if (!taskTitulo.trim()) return;

    await db.tareas.add({
      texto: taskTitulo.trim(),
      materiaId: taskMateriaId ? Number(taskMateriaId) : null,
      fechaLimite: taskFecha,
      horaLimite: taskHora,
      estado: 'pendiente',
      prioridad: taskPrioridad,
      esDestacada: taskPrioridad === 'urgente',
      subtareas: []
    });

    setTaskTitulo('');
    onClose();
  };

  const handleSaveEvento = async (e) => {
    e?.preventDefault();
    if (!eventoTitulo.trim()) return;

    await db.eventos.add({
      titulo: eventoTitulo.trim(),
      materiaId: eventoMateriaId ? Number(eventoMateriaId) : null,
      lugar: eventoLugar.trim(),
      horaInicio: eventoHoraInicio,
      horaFin: eventoHoraFin,
      fecha: new Date().toISOString().split('T')[0],
      tipo: eventoTipo
    });

    setEventoTitulo('');
    onClose();
  };

  const handleSaveIdea = async (e) => {
    e?.preventDefault();
    if (!ideaTitulo.trim()) return;

    await db.objetivos.add({
      titulo: ideaTitulo.trim(),
      completado: false,
      categoria: 'Personal',
      fecha: new Date().toISOString()
    });

    setIdeaTitulo('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-[3px] animate-fade-in p-0 sm:p-4">
      <div className="bg-white dark:bg-[#152320] w-full max-w-lg rounded-t-[32px] sm:rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            {activeView === 'menu' && '¿Qué quieres añadir?'}
            {activeView === 'tarea' && 'Nueva Tarea'}
            {activeView === 'evento' && 'Nuevo Evento / Clase'}
            {activeView === 'idea' && 'Nuevo Objetivo / Idea'}
          </h2>
          <button
            onClick={() => {
              if (activeView !== 'menu') setActiveView('menu');
              else onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 MAIN ACTION TILES (Mockup 8) */}
        {activeView === 'menu' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3.5">
              {/* Tarea */}
              <button
                type="button"
                onClick={() => setActiveView('tarea')}
                className="p-4 rounded-2xl bg-[#ebf8f2] dark:bg-[#122822] border border-[#d2efe2] dark:border-[#1d3d34] flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition active:scale-95 group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1b7a4e] text-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-[#145a3a] dark:text-[#6ee7b7]">
                  Tarea
                </span>
              </button>

              {/* Nota Rápida */}
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById('quick-note-textarea');
                  textarea?.focus();
                }}
                className="p-4 rounded-2xl bg-[#f4ecfb] dark:bg-[#251733] border border-[#e7d5f8] dark:border-[#3d2454] flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition active:scale-95 group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#7a35b8] text-white flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-[#582188] dark:text-[#d8b4fe]">
                  Nota rápida
                </span>
              </button>

              {/* Evento */}
              <button
                type="button"
                onClick={() => setActiveView('evento')}
                className="p-4 rounded-2xl bg-[#fdf2ea] dark:bg-[#2d1c16] border border-[#fcdcc8] dark:border-[#48281d] flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition active:scale-95 group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#c8561d] text-white flex items-center justify-center shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-[#8c350d] dark:text-[#fdba74]">
                  Evento
                </span>
              </button>

              {/* Idea */}
              <button
                type="button"
                onClick={() => setActiveView('idea')}
                className="p-4 rounded-2xl bg-[#ebf5fb] dark:bg-[#13222e] border border-[#cce7f8] dark:border-[#1d374a] flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition active:scale-95 group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1c6ca1] text-white flex items-center justify-center shadow-sm">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-[#144d73] dark:text-[#7dd3fc]">
                  Idea
                </span>
              </button>
            </div>

            {/* INLINE QUICK NOTE CAPTURE CARD (Mockup 8 bottom) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fafcfa] dark:bg-[#13201d] border border-slate-200/80 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#184a42] dark:text-[#71c3b4]">
                <FileText className="w-4 h-4 text-[#184a42] dark:text-[#71c3b4]" />
                <span>Nueva nota rápida</span>
              </div>

              <textarea
                id="quick-note-textarea"
                rows={3}
                value={notaTexto}
                onChange={(e) => setNotaTexto(e.target.value)}
                placeholder="Escribe tu nota..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#192b27] border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#184a42] resize-none"
              />

              <div className="flex items-center gap-2.5">
                <select
                  value={notaCategoria}
                  onChange={(e) => setNotaCategoria(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-[#192b27] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
                >
                  <option value="Ideas">💡 Ideas</option>
                  <option value="Fórmulas">🧪 Fórmulas</option>
                  <option value="Libros">☑️ Libros</option>
                  <option value="Dudas">❓ Dudas</option>
                  <option value="General">📄 General</option>
                </select>

                <div className="px-3 py-1.5 bg-white dark:bg-[#192b27] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hoy</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveNota}
                disabled={!notaTexto.trim()}
                className="w-full py-3 bg-[#184a42] hover:bg-[#133c35] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-md shadow-[#184a42]/20"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* TAREA FORM */}
        {activeView === 'tarea' && (
          <form onSubmit={handleSaveTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Título de la tarea</label>
              <input
                autoFocus
                type="text"
                required
                value={taskTitulo}
                onChange={(e) => setTaskTitulo(e.target.value)}
                placeholder="ej. Resolver ejercicios 4-12 de inferencia"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#184a42]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Materia</label>
                <select
                  value={taskMateriaId}
                  onChange={(e) => setTaskMateriaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="">General / Ninguna</option>
                  {materias?.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Prioridad</label>
                <select
                  value={taskPrioridad}
                  onChange={(e) => setTaskPrioridad(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="urgente">🔥 Urgente</option>
                  <option value="media">⚡ Media</option>
                  <option value="baja">🌱 Baja</option>
                  <option value="ninguna">Sin prioridad</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
                <input
                  type="date"
                  value={taskFecha}
                  onChange={(e) => setTaskFecha(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hora límite</label>
                <input
                  type="time"
                  value={taskHora}
                  onChange={(e) => setTaskHora(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveView('menu')}
                className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Volver
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 text-xs font-bold text-white bg-[#184a42] hover:bg-[#133c35] rounded-xl shadow-md"
              >
                Crear Tarea
              </button>
            </div>
          </form>
        )}

        {/* EVENTO FORM */}
        {activeView === 'evento' && (
          <form onSubmit={handleSaveEvento} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nombre del evento / clase</label>
              <input
                autoFocus
                type="text"
                required
                value={eventoTitulo}
                onChange={(e) => setEventoTitulo(e.target.value)}
                placeholder="ej. Tutoría de Estadística, Bloque de Bioquímica"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Lugar / Aula</label>
                <input
                  type="text"
                  value={eventoLugar}
                  onChange={(e) => setEventoLugar(e.target.value)}
                  placeholder="ej. Aula virtual, Biblioteca"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tipo</label>
                <select
                  value={eventoTipo}
                  onChange={(e) => setEventoTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="tutoria">Tutoría</option>
                  <option value="clase">Clase</option>
                  <option value="entrega">Entrega</option>
                  <option value="almuerzo">Almuerzo / Descanso</option>
                  <option value="estudio">Estudio libre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hora Inicio</label>
                <input
                  type="time"
                  value={eventoHoraInicio}
                  onChange={(e) => setEventoHoraInicio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hora Fin</label>
                <input
                  type="time"
                  value={eventoHoraFin}
                  onChange={(e) => setEventoHoraFin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveView('menu')}
                className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Volver
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 text-xs font-bold text-white bg-[#184a42] hover:bg-[#133c35] rounded-xl shadow-md"
              >
                Guardar Evento
              </button>
            </div>
          </form>
        )}

        {/* IDEA / OBJETIVO FORM */}
        {activeView === 'idea' && (
          <form onSubmit={handleSaveIdea} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tu objetivo o idea académica</label>
              <input
                autoFocus
                type="text"
                required
                value={ideaTitulo}
                onChange={(e) => setIdeaTitulo(e.target.value)}
                placeholder="ej. Terminar lecturas de la semana 7"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveView('menu')}
                className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Volver
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 text-xs font-bold text-white bg-[#184a42] hover:bg-[#133c35] rounded-xl shadow-md"
              >
                Guardar Idea
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
