import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Check,
  X,
  Repeat,
  ListTodo,
  Award,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { db } from '../db/db';
import { useStreak } from '../context/StreakContext';

export function Tareas() {
  const { triggerStreakCheck } = useStreak();

  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const tareas = useLiveQuery(() => db.tareas.toArray(), []);
  const examenes = useLiveQuery(() => db.examenes.toArray(), []);

  // Filter States
  const [activeTab, setActiveTab] = useState('tareas'); // 'tareas' | 'examenes'
  const [statusFilter, setStatusFilter] = useState('todas'); // 'todas' | 'pendiente' | 'en progreso' | 'hecha'
  const [subjectFilter, setSubjectFilter] = useState('');

  // Tarea Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskTexto, setTaskTexto] = useState('');
  const [taskMateriaId, setTaskMateriaId] = useState('');
  const [taskFechaLimite, setTaskFechaLimite] = useState(new Date().toISOString().split('T')[0]);
  const [taskEstado, setTaskEstado] = useState('pendiente');
  const [taskPrioridad, setTaskPrioridad] = useState('media');
  const [taskRecurrente, setTaskRecurrente] = useState(false);
  const [taskFrecuencia, setTaskFrecuencia] = useState('semanal');
  const [taskEnlaceDrive, setTaskEnlaceDrive] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Exam Modal State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [examTitulo, setExamTitulo] = useState('');
  const [examMateriaId, setExamMateriaId] = useState('');
  const [examFechaHora, setExamFechaHora] = useState(`${new Date().toISOString().split('T')[0]}T08:00`);
  const [examAula, setExamAula] = useState('');
  const [examTemas, setExamTemas] = useState('');

  // --- TAREA HANDLERS ---
  const openTaskModal = (t = null) => {
    if (t) {
      setEditingTaskId(t.id);
      setTaskTexto(t.texto || '');
      setTaskMateriaId(t.materiaId || '');
      setTaskFechaLimite(t.fechaLimite || new Date().toISOString().split('T')[0]);
      setTaskEstado(t.estado || 'pendiente');
      setTaskPrioridad(t.prioridad || 'media');
      setTaskRecurrente(Boolean(t.recurrente));
      setTaskFrecuencia(t.frecuencia || 'semanal');
      setTaskEnlaceDrive(t.enlaceDrive || '');
      setSubtasks(t.subtareas || []);
    } else {
      setEditingTaskId(null);
      setTaskTexto('');
      setTaskMateriaId(materias && materias.length > 0 ? materias[0].id : '');
      setTaskFechaLimite(new Date().toISOString().split('T')[0]);
      setTaskEstado('pendiente');
      setTaskPrioridad('media');
      setTaskRecurrente(false);
      setTaskFrecuencia('semanal');
      setTaskEnlaceDrive('');
      setSubtasks([]);
    }
    setNewSubtaskInput('');
    setIsTaskModalOpen(true);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), texto: newSubtaskInput.trim(), completada: false }]);
    setNewSubtaskInput('');
  };

  const handleToggleSubtaskInModal = (id) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completada: !s.completada } : s));
  };

  const handleRemoveSubtaskInModal = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskTexto.trim()) return;

    const data = {
      texto: taskTexto.trim(),
      materiaId: taskMateriaId ? Number(taskMateriaId) : null,
      fechaLimite: taskFechaLimite,
      estado: taskEstado,
      prioridad: taskPrioridad,
      recurrente: taskRecurrente,
      frecuencia: taskRecurrente ? taskFrecuencia : null,
      enlaceDrive: taskEnlaceDrive.trim(),
      subtareas: subtasks
    };

    if (editingTaskId) {
      await db.tareas.update(editingTaskId, data);
    } else {
      await db.tareas.add(data);
    }

    setIsTaskModalOpen(false);
  };

  const toggleTaskStatus = async (t) => {
    const newStatus = t.estado === 'hecha' ? 'pendiente' : 'hecha';
    await db.tareas.update(t.id, { estado: newStatus });
    if (newStatus === 'hecha') {
      triggerStreakCheck();
    }
  };

  const toggleSubtaskInCard = async (task, subtaskId) => {
    const updatedSubtasks = (task.subtareas || []).map(s =>
      s.id === subtaskId ? { ...s, completada: !s.completada } : s
    );
    await db.tareas.update(task.id, { subtareas: updatedSubtasks });
  };

  const deleteTask = async (id) => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      await db.tareas.delete(id);
    }
  };

  // --- EXAM HANDLERS ---
  const openExamModal = (ex = null) => {
    if (ex) {
      setEditingExamId(ex.id);
      setExamTitulo(ex.titulo || '');
      setExamMateriaId(ex.materiaId || '');
      setExamFechaHora(ex.fechaHora || `${new Date().toISOString().split('T')[0]}T08:00`);
      setExamAula(ex.aula || '');
      setExamTemas(ex.temas || '');
    } else {
      setEditingExamId(null);
      setExamTitulo('');
      setExamMateriaId(materias && materias.length > 0 ? materias[0].id : '');
      setExamFechaHora(`${new Date().toISOString().split('T')[0]}T08:00`);
      setExamAula('');
      setExamTemas('');
    }
    setIsExamModalOpen(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!examTitulo.trim()) return;

    const data = {
      titulo: examTitulo.trim(),
      materiaId: examMateriaId ? Number(examMateriaId) : null,
      fechaHora: examFechaHora,
      aula: examAula.trim(),
      temas: examTemas.trim()
    };

    if (editingExamId) {
      await db.examenes.update(editingExamId, data);
    } else {
      await db.examenes.add(data);
    }

    setIsExamModalOpen(false);
  };

  const deleteExam = async (id) => {
    if (window.confirm('¿Eliminar este examen?')) {
      await db.examenes.delete(id);
    }
  };

  // Filter Tasks
  let filteredTareas = tareas || [];
  if (statusFilter !== 'todas') {
    filteredTareas = filteredTareas.filter(t => t.estado === statusFilter);
  }
  if (subjectFilter) {
    filteredTareas = filteredTareas.filter(t => t.materiaId === Number(subjectFilter));
  }

  // Filter Exams
  let filteredExamenes = examenes || [];
  if (subjectFilter) {
    filteredExamenes = filteredExamenes.filter(e => e.materiaId === Number(subjectFilter));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Tareas & Exámenes</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organiza tus entregables, lista de chequeo de subtareas y fechas de evaluaciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'tareas' ? (
            <button
              onClick={() => openTaskModal()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea</span>
            </button>
          ) : (
            <button
              onClick={() => openExamModal()}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Examen</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs (Tareas vs Exámenes) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tareas')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'tareas'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Tareas ({tareas ? tareas.length : 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('examenes')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'examenes'
                ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Exámenes ({examenes ? examenes.length : 0})</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {activeTab === 'tareas' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none"
            >
              <option value="todas">Todas las tareas</option>
              <option value="pendiente">Pendientes</option>
              <option value="en progreso">En Progreso</option>
              <option value="hecha">Completadas</option>
            </select>
          )}

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none"
          >
            <option value="">Todas las materias</option>
            {materias?.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TAREAS CONTENT TAB */}
      {activeTab === 'tareas' && (
        <div>
          {filteredTareas.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
              <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
                No hay tareas que mostrar
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ajusta los filtros o crea una nueva tarea para comenzar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTareas.map(task => {
                const materia = materias?.find(m => m.id === task.materiaId);
                const subtasksTotal = task.subtareas ? task.subtareas.length : 0;
                const subtasksDone = task.subtareas ? task.subtareas.filter(s => s.completada).length : 0;
                const progressPct = subtasksTotal > 0 ? Math.round((subtasksDone / subtasksTotal) * 100) : 0;

                return (
                  <div
                    key={task.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm transition hover:shadow-md ${
                      task.estado === 'hecha' ? 'opacity-70 bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={task.estado === 'hecha'}
                          onChange={() => toggleTaskStatus(task)}
                          className="mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className={`font-bold text-base ${task.estado === 'hecha' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {task.texto}
                          </h3>

                          {/* Badges & Meta */}
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                            {materia && (
                              <span
                                className="px-2.5 py-0.5 rounded-md font-semibold text-[11px] text-white"
                                style={{ backgroundColor: materia.color || '#6366f1' }}
                              >
                                {materia.nombre}
                              </span>
                            )}

                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] uppercase ${
                                task.prioridad === 'alta'
                                  ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                                  : task.prioridad === 'media'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                              }`}
                            >
                              {task.prioridad}
                            </span>

                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 capitalize">
                              {task.estado}
                            </span>

                            {task.fechaLimite && (
                              <span className="text-slate-500 dark:text-slate-400 font-medium">
                                📅 Límite: {task.fechaLimite}
                              </span>
                            )}

                            {task.recurrente && (
                              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium text-[11px]">
                                <Repeat className="w-3 h-3" />
                                <span>Recurrente ({task.frecuencia})</span>
                              </span>
                            )}

                            {task.enlaceDrive && (
                              <a
                                href={task.enlaceDrive}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Drive</span>
                              </a>
                            )}
                          </div>

                          {/* Subtasks Progress Bar & Checklist */}
                          {subtasksTotal > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                                <span>Subtareas ({subtasksDone}/{subtasksTotal})</span>
                                <span>{progressPct}%</span>
                              </div>

                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2.5">
                                <div
                                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {task.subtareas.map(st => (
                                  <label key={st.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={st.completada}
                                      onChange={() => toggleSubtaskInCard(task, st.id)}
                                      className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
                                    />
                                    <span className={st.completada ? 'line-through text-slate-400' : ''}>
                                      {st.texto}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openTaskModal(task)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EXÁMENES CONTENT TAB */}
      {activeTab === 'examenes' && (
        <div>
          {filteredExamenes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
                No hay exámenes registrados
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Añade tus fechas de parciales o finales para ver la cuenta regresiva.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExamenes.map(ex => {
                const materia = materias?.find(m => m.id === ex.materiaId);
                const examDate = new Date(ex.fechaHora);
                const diffDays = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={ex.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs rounded-md mb-1">
                          {diffDays <= 0 ? '¡HOY!' : `Faltan ${diffDays} días`}
                        </span>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white">
                          {ex.titulo}
                        </h3>
                        {materia && (
                          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {materia.nombre}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openExamModal(ex)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteExam(ex.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div><strong>Fecha y hora:</strong> {examDate.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      <div><strong>Aula:</strong> {ex.aula || materia?.aula || 'Por definir'}</div>
                      {ex.temas && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <strong>Temas a evaluar:</strong>
                          <p className="mt-0.5 text-slate-700 dark:text-slate-300">{ex.temas}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Task Modal (Create / Edit) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <span>{editingTaskId ? 'Editar Tarea' : 'Nueva Tarea'}</span>
              </h2>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Descripción de la tarea *</label>
                <input
                  type="text"
                  required
                  value={taskTexto}
                  onChange={(e) => setTaskTexto(e.target.value)}
                  placeholder="ej. Resolver guía 3 de Cálculo Multivariable"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Materia</label>
                  <select
                    value={taskMateriaId}
                    onChange={(e) => setTaskMateriaId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">General / Ninguna</option>
                    {materias?.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={taskFechaLimite}
                    onChange={(e) => setTaskFechaLimite(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
                  <select
                    value={taskEstado}
                    onChange={(e) => setTaskEstado(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En Progreso</option>
                    <option value="hecha">Completada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Prioridad</label>
                  <select
                    value={taskPrioridad}
                    onChange={(e) => setTaskPrioridad(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              {/* Subtasks Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Subtareas / Lista de Chequeo</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                    placeholder="Añadir ítem..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {subtasks.map(st => (
                    <div key={st.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={st.completada}
                          onChange={() => handleToggleSubtaskInModal(st.id)}
                          className="w-3.5 h-3.5 text-indigo-600 rounded"
                        />
                        <span className={st.completada ? 'line-through text-slate-400' : ''}>{st.texto}</span>
                      </label>
                      <button type="button" onClick={() => handleRemoveSubtaskInModal(st.id)} className="text-slate-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Drive Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Enlace a Google Drive (opcional)</label>
                <input
                  type="url"
                  value={taskEnlaceDrive}
                  onChange={(e) => setTaskEnlaceDrive(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">Guardar Tarea</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Modal (Create / Edit) */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-red-500" />
                <span>{editingExamId ? 'Editar Examen' : 'Registrar Examen'}</span>
              </h2>
              <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Título del Examen *</label>
                <input
                  type="text"
                  required
                  value={examTitulo}
                  onChange={(e) => setExamTitulo(e.target.value)}
                  placeholder="ej. Parcial 1 - Integrales Triples"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Materia</label>
                  <select
                    value={examMateriaId}
                    onChange={(e) => setExamMateriaId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">Seleccionar materia...</option>
                    {materias?.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    value={examFechaHora}
                    onChange={(e) => setExamFechaHora(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Aula / Salón</label>
                <input
                  type="text"
                  value={examAula}
                  onChange={(e) => setExamAula(e.target.value)}
                  placeholder="ej. Edificio B - Aula 204"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Temas / Contenido a Evaluar</label>
                <textarea
                  rows={3}
                  value={examTemas}
                  onChange={(e) => setExamTemas(e.target.value)}
                  placeholder="ej. Capítulos 11 al 13 del libro guía..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsExamModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md">Guardar Examen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
