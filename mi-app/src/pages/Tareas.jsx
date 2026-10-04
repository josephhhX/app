import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Check,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  Star,
  BookOpen,
  X,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Calendar,
  Clock
} from 'lucide-react';
import { db } from '../db/db';
import { AddActionModal } from '../components/AddActionModal';

export function Tareas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [viewMode, setViewMode] = useState(
    tabParam === 'examenes' ? 'examenes' : tabParam === 'kanban' ? 'kanban' : 'lista'
  ); // 'lista' | 'kanban' | 'examenes'

  useEffect(() => {
    if (tabParam === 'examenes') setViewMode('examenes');
    else if (tabParam === 'kanban') setViewMode('kanban');
    else if (tabParam === 'lista') setViewMode('lista');
  }, [tabParam]);

  const handleTabChange = (mode) => {
    setViewMode(mode);
    setSearchParams({ tab: mode });
  };

  const [filterStatus, setFilterStatus] = useState('todas'); // 'todas', 'pendiente', 'en_proceso', 'hecha'
  const [selectedMateria, setSelectedMateria] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Exam Form State
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [examTitulo, setExamTitulo] = useState('');
  const [examMateriaId, setExamMateriaId] = useState('');
  const [examFecha, setExamFecha] = useState(new Date().toISOString().split('T')[0]);
  const [examHora, setExamHora] = useState('09:00');
  const [examAula, setExamAula] = useState('');
  const [examTemas, setExamTemas] = useState('');

  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const tareas = useLiveQuery(() => db.tareas.toArray(), []);
  const examenes = useLiveQuery(() => db.examenes.toArray(), []);

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!examTitulo.trim()) return;
    await db.examenes.add({
      titulo: examTitulo.trim(),
      materiaId: examMateriaId ? Number(examMateriaId) : null,
      fecha: examFecha,
      hora: examHora,
      aula: examAula.trim() || 'Aula por confirmar',
      temas: examTemas.trim(),
      calificacion: null,
      completado: false
    });
    setExamTitulo('');
    setExamAula('');
    setExamTemas('');
    setIsAddExamOpen(false);
  };

  const deleteExam = async (id) => {
    if (window.confirm('¿Eliminar este examen?')) {
      await db.examenes.delete(id);
    }
  };

  // Filter tasks
  const allTasks = tareas || [];
  const filteredTasks = allTasks.filter(t => {
    // Status filter (for list view)
    if (viewMode === 'lista' && filterStatus !== 'todas') {
      if (filterStatus === 'pendiente' && t.estado !== 'pendiente') return false;
      if (filterStatus === 'en_proceso' && t.estado !== 'en progreso') return false;
      if (filterStatus === 'hecha' && t.estado !== 'hecha') return false;
    }
    // Subject filter
    if (selectedMateria !== 'todas' && t.materiaId !== Number(selectedMateria)) {
      return false;
    }
    // Search query
    if (searchQuery.trim() && !t.texto.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const pendientes = allTasks.filter(t => t.estado === 'pendiente' || !t.estado);
  const enProceso = allTasks.filter(t => t.estado === 'en progreso');
  const terminadas = allTasks.filter(t => t.estado === 'hecha');

  const toggleTaskStatus = async (task) => {
    const nextStatus = task.estado === 'hecha' ? 'pendiente' : 'hecha';
    await db.tareas.update(task.id, { estado: nextStatus });
  };

  const setTaskStatus = async (id, estado) => {
    await db.tareas.update(id, { estado });
  };

  const deleteTask = async (id) => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      await db.tareas.delete(id);
    }
  };

  const toggleFeatured = async (task) => {
    await db.tareas.update(task.id, { esDestacada: !task.esDestacada });
  };

  // Helper for priority badges
  const renderPriorityBadge = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
      case 'alta':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#fdf2ea] text-[#c8561d] border border-[#fcdcc8]">
            🔥 Urgente
          </span>
        );
      case 'media':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#fef9e7] text-[#d97706] border border-[#fcf0b8]">
            ⚡ Media
          </span>
        );
      case 'baja':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#ebf8f2] text-[#1b7a4e] border border-[#d2efe2]">
            🌱 Baja
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
            Sin prioridad
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      
      {/* 1. TOP HEADER & SWITCHER */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-[#163a34] dark:text-[#e4eee9]">
          {viewMode === 'lista' ? 'Tareas' : 'Tablero Kanban'}
        </h1>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-xl bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'lista' ? 'kanban' : 'lista')}
            className="p-2 rounded-xl bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800 text-[#184a42] dark:text-[#6ee7b7] font-bold text-xs flex items-center gap-1.5"
            title="Alternar vista"
          >
            {viewMode === 'lista' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            <span className="hidden sm:inline">{viewMode === 'lista' ? 'Kanban' : 'Lista'}</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      {showSearch && (
        <div className="relative animate-fade-in">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarea..."
            className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-[#14221f] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#184a42]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 2. FILTER PILLS (LIST VIEW - Mockup 2) */}
      {viewMode === 'lista' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <button
            onClick={() => setFilterStatus('todas')}
            className={`px-4 py-2 rounded-full transition shrink-0 ${
              filterStatus === 'todas'
                ? 'bg-[#184a42] text-white shadow-xs'
                : 'bg-white dark:bg-[#14221f] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setFilterStatus('pendiente')}
            className={`px-4 py-2 rounded-full transition shrink-0 flex items-center gap-1.5 ${
              filterStatus === 'pendiente'
                ? 'bg-[#184a42] text-white shadow-xs'
                : 'bg-white dark:bg-[#14221f] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <span>Pendientes</span>
            <span className="text-[10px] opacity-80">{pendientes.length}</span>
          </button>

          <button
            onClick={() => setFilterStatus('en_proceso')}
            className={`px-4 py-2 rounded-full transition shrink-0 flex items-center gap-1.5 ${
              filterStatus === 'en_proceso'
                ? 'bg-[#184a42] text-white shadow-xs'
                : 'bg-white dark:bg-[#14221f] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <span>En proceso</span>
            <span className="text-[10px] opacity-80">{enProceso.length}</span>
          </button>

          <button
            onClick={() => setFilterStatus('hecha')}
            className={`px-4 py-2 rounded-full transition shrink-0 ${
              filterStatus === 'hecha'
                ? 'bg-[#184a42] text-white shadow-xs'
                : 'bg-white dark:bg-[#14221f] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            Completadas
          </button>
        </div>
      )}

      {/* 3. KANBAN FILTER (KANBAN VIEW - Mockup 3) */}
      {viewMode === 'kanban' && (
        <div className="flex items-center justify-between">
          <select
            value={selectedMateria}
            onChange={(e) => setSelectedMateria(e.target.value)}
            className="px-3.5 py-1.5 bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="todas">Todas las materias ▾</option>
            {materias?.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* 4. LIST VIEW CONTENT (Mockup 2) */}
      {viewMode === 'lista' && (
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="jami-card p-10 text-center space-y-2">
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                No hay tareas en esta categoría
              </p>
              <p className="text-xs text-slate-400">
                Toca el botón + para añadir tu primera tarea.
              </p>
            </div>
          ) : (
            filteredTasks.map(t => {
              const materia = (materias || []).find(m => m.id === t.materiaId);
              const isDone = t.estado === 'hecha';

              return (
                <div
                  key={t.id}
                  className={`jami-card p-3.5 sm:p-4 flex items-center justify-between gap-3 transition ${
                    isDone ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox (circle) */}
                    <button
                      onClick={() => toggleTaskStatus(t)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                        isDone
                          ? 'bg-[#184a42] border-[#184a42] text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-[#184a42]'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {/* Colored icon square */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: materia?.color || '#1b7a4e' }}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>

                    {/* Title & Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className={`font-bold text-xs sm:text-sm truncate ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {t.texto}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {materia?.nombre || 'General'}
                        </span>
                        <span>•</span>
                        <span>{t.fechaLimite || 'Hoy'}</span>
                        {t.horaLimite && (
                          <>
                            <span>•</span>
                            <span>{t.horaLimite}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Priority Tag & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {renderPriorityBadge(t.prioridad)}

                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. TABLERO KANBAN VIEW (Mockup 3) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
          
          {/* COLUMN 1: PENDIENTE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fdf2ea] dark:bg-[#2d1c16] border border-[#fcdcc8] dark:border-[#48281d]">
              <span className="font-extrabold text-xs text-[#c8561d] dark:text-[#fdba74]">
                Pendiente
              </span>
              <span className="w-5 h-5 rounded-full bg-[#fae0d3] dark:bg-[#43231a] text-[#c8561d] font-black text-[10px] flex items-center justify-center">
                {pendientes.length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[140px]">
              {pendientes.map(t => {
                const materia = (materias || []).find(m => m.id === t.materiaId);
                return (
                  <div key={t.id} className="jami-card p-3.5 space-y-2 relative group">
                    <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                      {t.texto}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{materia?.nombre || 'General'}</span>
                      <button
                        onClick={() => setTaskStatus(t.id, 'en progreso')}
                        className="text-[#184a42] dark:text-[#6ee7b7] font-bold text-[10px] flex items-center gap-0.5 hover:underline"
                        title="Mover a En proceso"
                      >
                        <span>Iniciar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setIsAddOpen(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 hover:border-[#184a42] hover:text-[#184a42] transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir tarjeta</span>
              </button>
            </div>
          </div>

          {/* COLUMN 2: EN PROCESO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ebf5fb] dark:bg-[#13222e] border border-[#cce7f8] dark:border-[#1d374a]">
              <span className="font-extrabold text-xs text-[#1c6ca1] dark:text-[#7dd3fc]">
                En proceso
              </span>
              <span className="w-5 h-5 rounded-full bg-[#d4ebf9] dark:bg-[#1b3447] text-[#1c6ca1] font-black text-[10px] flex items-center justify-center">
                {enProceso.length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[140px]">
              {enProceso.map(t => {
                const materia = (materias || []).find(m => m.id === t.materiaId);
                return (
                  <div key={t.id} className="jami-card p-3.5 space-y-2">
                    <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                      {t.texto}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{materia?.nombre || 'General'}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTaskStatus(t.id, 'pendiente')}
                          className="hover:text-slate-600"
                          title="Volver a pendiente"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setTaskStatus(t.id, 'hecha')}
                          className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                          title="Completar"
                        >
                          <span>Terminar</span>
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setIsAddOpen(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 hover:border-[#184a42] hover:text-[#184a42] transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir tarjeta</span>
              </button>
            </div>
          </div>

          {/* COLUMN 3: TERMINADO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ebf8f2] dark:bg-[#122720] border border-[#d2efe2] dark:border-[#1b3d33]">
              <span className="font-extrabold text-xs text-[#1b7a4e] dark:text-[#6ee7b7]">
                Terminado
              </span>
              <span className="w-5 h-5 rounded-full bg-[#d5f3e5] dark:bg-[#1d4336] text-[#1b7a4e] font-black text-[10px] flex items-center justify-center">
                {terminadas.length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[140px]">
              {terminadas.map(t => {
                const materia = (materias || []).find(m => m.id === t.materiaId);
                return (
                  <div key={t.id} className="jami-card p-3.5 space-y-2 opacity-80">
                    <div className="font-extrabold text-xs line-through text-slate-400">
                      {t.texto}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{materia?.nombre || 'General'}</span>
                      <button
                        onClick={() => setTaskStatus(t.id, 'en progreso')}
                        className="text-xs hover:text-slate-600"
                        title="Reabrir tarea"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setIsAddOpen(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 hover:border-[#184a42] hover:text-[#184a42] transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir tarjeta</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Add Modal */}
      <AddActionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} defaultMode="tarea" />
    </div>
  );
}
