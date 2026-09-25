import React, { useState } from 'react';
import { X, Plus, Zap, CheckSquare, FileText, Calendar } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function QuickCaptureModal({ isOpen, onClose }) {
  const [type, setType] = useState('tarea'); // 'tarea' | 'nota'
  const [texto, setTexto] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [fechaLimite, setFechaLimite] = useState(new Date().toISOString().split('T')[0]);

  const materias = useLiveQuery(() => db.materias.toArray(), []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;

    if (type === 'tarea') {
      await db.tareas.add({
        texto: texto.trim(),
        materiaId: materiaId ? Number(materiaId) : null,
        fechaLimite: fechaLimite || new Date().toISOString().split('T')[0],
        estado: 'pendiente',
        prioridad,
        recurrente: false,
        subtareas: [],
        enlaceDrive: ''
      });
    } else {
      await db.notasRapidas.add({
        texto: texto.trim(),
        fecha: new Date().toISOString(),
        materiaId: materiaId ? Number(materiaId) : null
      });
    }

    setTexto('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300 animate-bounce" />
            <span>Captura Rápida</span>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-indigo-500/30 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-sm font-medium">
            <button
              type="button"
              onClick={() => setType('tarea')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                type === 'tarea'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Nueva Tarea</span>
            </button>
            <button
              type="button"
              onClick={() => setType('nota')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                type === 'nota'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Nota Rápida</span>
            </button>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {type === 'tarea' ? 'Descripción de la tarea' : 'Contenido de la nota'}
            </label>
            <textarea
              autoFocus
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={type === 'tarea' ? 'ej. Entregar ejercicio 4 de Cálculo...' : 'ej. El profesor moverá la fecha del examen...'}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              required
            />
          </div>

          {/* Materia Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Materia asociada (opcional)
            </label>
            <select
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Ninguna / General --</option>
              {materias?.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Extra fields for Tarea */}
          {type === 'tarea' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Prioridad
                </label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
