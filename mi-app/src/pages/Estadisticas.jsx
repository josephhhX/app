import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  BarChart2,
  Award,
  Plus,
  Trash2,
  TrendingUp,
  CheckSquare,
  Clock,
  BookOpen,
  X
} from 'lucide-react';
import { db } from '../db/db';

export function Estadisticas() {
  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const calificaciones = useLiveQuery(() => db.calificaciones.toArray(), []);
  const tareas = useLiveQuery(() => db.tareas.toArray(), []);
  const sesiones = useLiveQuery(() => db.sesionesConcentracion.toArray(), []);

  // Modal State for adding a Grade
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materiaId, setMateriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [nota, setNota] = useState('');
  const [porcentaje, setPorcentaje] = useState(10);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const openAddModal = (mId = '') => {
    setMateriaId(mId || (materias && materias.length > 0 ? materias[0].id : ''));
    setDescripcion('');
    setNota('');
    setPorcentaje(10);
    setFecha(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveCalificacion = async (e) => {
    e.preventDefault();
    if (!materiaId || nota === '') return;

    await db.calificaciones.add({
      materiaId: Number(materiaId),
      descripcion: descripcion.trim() || 'Evaluación',
      nota: Number(nota),
      porcentaje: Number(porcentaje) || 0,
      fecha
    });

    setIsModalOpen(false);
  };

  const deleteCalificacion = async (id) => {
    if (window.confirm('¿Eliminar esta nota?')) {
      await db.calificaciones.delete(id);
    }
  };

  // Calculate Weighted Average per Subject
  const getSubjectStats = (mId) => {
    if (!calificaciones) return { avg: null, count: 0 };
    const list = calificaciones.filter(c => c.materiaId === mId);
    if (list.length === 0) return { avg: null, count: 0 };

    const totalWeight = list.reduce((acc, c) => acc + (c.porcentaje || 0), 0);
    if (totalWeight > 0) {
      const weightedSum = list.reduce((acc, c) => acc + Number(c.nota) * (c.porcentaje || 0), 0);
      return { avg: (weightedSum / totalWeight).toFixed(2), count: list.length };
    } else {
      const sum = list.reduce((acc, c) => acc + Number(c.nota), 0);
      return { avg: (sum / list.length).toFixed(2), count: list.length };
    }
  };

  // Calculate Overall GPA Average
  const getOverallGPA = () => {
    if (!calificaciones || calificaciones.length === 0) return '0.0';
    const sum = calificaciones.reduce((acc, c) => acc + Number(c.nota), 0);
    return (sum / calificaciones.length).toFixed(2);
  };

  // Stats
  const completedTasksCount = tareas ? tareas.filter(t => t.estado === 'hecha').length : 0;
  const pendingTasksCount = tareas ? tareas.filter(t => t.estado !== 'hecha').length : 0;
  const totalFocusMinutes = sesiones ? sesiones.reduce((acc, s) => acc + (s.duracion || 0), 0) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Estadísticas & Calificaciones</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registro de notas por materia, promedios ponderados y métricas de rendimiento.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nota</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-tr from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/10">
          <div className="text-xs font-semibold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Promedio General</span>
          </div>
          <div className="mt-2 text-4xl font-black">
            {getOverallGPA()} <span className="text-lg text-indigo-200 font-normal">/ 20</span>
          </div>
          <div className="mt-1 text-xs text-indigo-100">
            Basado en {calificaciones ? calificaciones.length : 0} evaluaciones registradas
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <span>Tareas Completadas</span>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {completedTasksCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {pendingTasksCount} tareas pendientes
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Tiempo Total en Concentración</span>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {totalFocusMinutes} <span className="text-sm font-normal text-slate-500">min</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {(totalFocusMinutes / 60).toFixed(1)} horas de estudio enfocado
          </div>
        </div>
      </div>

      {/* Grades Breakdown per Subject */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Calificaciones por Materia</span>
        </h2>

        {(!materias || materias.length === 0) ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Registra primero materias para asignarles notas.
          </p>
        ) : (
          <div className="space-y-6">
            {materias.map(m => {
              const stats = getSubjectStats(m.id);
              const itemCalifs = calificaciones ? calificaciones.filter(c => c.materiaId === m.id) : [];

              return (
                <div key={m.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: m.color || '#6366f1' }} />
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {m.nombre}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        Promedio: <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{stats.avg ? `${stats.avg} / 20` : 'Sin notas'}</strong>
                      </span>
                      <button
                        onClick={() => openAddModal(m.id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        + Nota
                      </button>
                    </div>
                  </div>

                  {itemCalifs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                      {itemCalifs.map(c => (
                        <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{c.descripcion}</div>
                            <div className="text-[10px] text-slate-400">{c.fecha} • Peso: {c.porcentaje}%</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                              {c.nota}
                            </span>
                            <button onClick={() => deleteCalificacion(c.id)} className="text-slate-400 hover:text-red-500 p-0.5">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grade Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>Registrar Calificación</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCalificacion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Materia *</label>
                <select
                  required
                  value={materiaId}
                  onChange={(e) => setMateriaId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                >
                  <option value="">Seleccionar materia...</option>
                  {materias?.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Descripción de la evaluación *</label>
                <input
                  type="text"
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="ej. Parcial 1, Quiz 2, Proyecto Final"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nota Obtenida *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    required
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="ej. 18.5"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Ponderación / Peso (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={porcentaje}
                    onChange={(e) => setPorcentaje(e.target.value)}
                    placeholder="ej. 20"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">Guardar Nota</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
