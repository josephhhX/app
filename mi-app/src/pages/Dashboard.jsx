import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Zap,
  Flame,
  Plus,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Trash2,
  ExternalLink,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { useStreak } from '../context/StreakContext';
import { BatteryOptimizationBanner } from '../components/BatteryOptimizationBanner';

export function Dashboard() {
  const navigate = useNavigate();
  const { streak, triggerStreakCheck } = useStreak();

  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const tareas = useLiveQuery(() => db.tareas.toArray(), []);
  const examenes = useLiveQuery(() => db.examenes.toArray(), []);
  const notas = useLiveQuery(() => db.notasRapidas.toArray(), []);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for class countdown
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Next / Current Class
  const currentDayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][currentTime.getDay()];
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;

  let activeOrNextClass = null;

  if (materias) {
    const todayClasses = [];
    materias.forEach(m => {
      if (m.horarios) {
        m.horarios.forEach(h => {
          if (h.diaSemana === currentDayName) {
            const [startH, startM] = h.horaInicio.split(':').map(Number);
            const [endH, endM] = h.horaFin.split(':').map(Number);
            const startMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;

            todayClasses.push({
              materia: m,
              horaInicio: h.horaInicio,
              horaFin: h.horaFin,
              startMins,
              endMins
            });
          }
        });
      }
    });

    todayClasses.sort((a, b) => a.startMins - b.startMins);

    // Find currently active class or next upcoming class today
    const currentClass = todayClasses.find(c => currentMinutes >= c.startMins && currentMinutes < c.endMins);
    if (currentClass) {
      activeOrNextClass = { ...currentClass, isCurrent: true };
    } else {
      const nextClass = todayClasses.find(c => c.startMins > currentMinutes);
      if (nextClass) {
        activeOrNextClass = { ...nextClass, isCurrent: false };
      }
    }
  }

  // Format countdown string for next class
  const getCountdownString = (item) => {
    if (!item) return '';
    if (item.isCurrent) {
      const endSecs = item.endMins * 60;
      const curSecs = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
      const diffSecs = Math.max(0, Math.floor(endSecs - curSecs));
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      return `Finaliza en ${mins}m ${secs}s`;
    } else {
      const startSecs = item.startMins * 60;
      const curSecs = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
      const diffSecs = Math.max(0, Math.floor(startSecs - curSecs));
      const hours = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;
      if (hours > 0) return `Empieza en ${hours}h ${mins}m`;
      return `Empieza en ${mins}m ${secs}s`;
    }
  };

  // Stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = tareas ? tareas.filter(t => t.estado !== 'hecha') : [];
  const overdueTasks = pendingTasks.filter(t => t.fechaLimite && t.fechaLimite < todayStr);
  const dueTodayTasks = pendingTasks.filter(t => t.fechaLimite && t.fechaLimite === todayStr);

  const toggleTaskStatus = async (task) => {
    const nextStatus = task.estado === 'hecha' ? 'pendiente' : 'hecha';
    await db.tareas.update(task.id, { estado: nextStatus });
    if (nextStatus === 'hecha') {
      triggerStreakCheck();
    }
  };

  const deleteNota = async (id) => {
    await db.notasRapidas.delete(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Android Battery Optimization Advice */}
      <BatteryOptimizationBanner />

      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-200 text-xs sm:text-sm font-semibold mb-1 capitalize">
            <Calendar className="w-4 h-4" />
            <span>
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ¡Hola de nuevo! 🎓
          </h1>
          <p className="mt-1 text-indigo-100 text-sm sm:text-base">
            Aquí tienes el resumen de tu jornada académica. Mantén la concentración y el ritmo.
          </p>

          {/* Next Class Countdown Highlight Card */}
          {activeOrNextClass ? (
            <div className="mt-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-12 rounded-lg shrink-0 shadow-inner"
                  style={{ backgroundColor: activeOrNextClass.materia.color || '#3b82f6' }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                      {activeOrNextClass.isCurrent ? 'Clase En Curso' : 'Próxima Clase'}
                    </span>
                    <span className="text-xs text-indigo-200 font-medium">
                      {activeOrNextClass.horaInicio} - {activeOrNextClass.horaFin}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-white mt-0.5">
                    {activeOrNextClass.materia.nombre}
                  </h3>
                  <div className="text-xs text-indigo-100 font-medium">
                    {activeOrNextClass.materia.aula || 'Aula no especificada'} • Prof: {activeOrNextClass.materia.profesor || 'Por definir'}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-900/60 border border-indigo-400/30 px-4 py-2 rounded-xl text-center self-stretch sm:self-auto flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="font-extrabold text-sm sm:text-base text-amber-300 tracking-wide">
                  {getCountdownString(activeOrNextClass)}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-indigo-100 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No tienes más clases programadas para hoy. ¡Excelente tiempo para adelantar tareas!</span>
            </div>
          )}
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/tareas')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Tareas Pendientes</span>
            <AlertCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {pendingTasks.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {dueTodayTasks.length} vencen hoy
          </div>
        </div>

        <div
          onClick={() => navigate('/tareas')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Tareas Vencidas</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-red-500 transition">
            {overdueTasks.length}
          </div>
          <div className="mt-1 text-[11px] text-red-500 font-medium">
            {overdueTasks.length > 0 ? 'Requieren atención urgente' : '¡Todo al día!'}
          </div>
        </div>

        <div
          onClick={() => navigate('/materias')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Materias Inscritas</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition">
            {materias ? materias.length : 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Ver horarios y syllabus
          </div>
        </div>

        <div
          onClick={() => navigate('/concentracion')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Racha de Estudio</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {streak} <span className="text-sm font-normal">días</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            ¡Sigue así diariamente!
          </div>
        </div>
      </div>

      {/* Dashboard Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Urgent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Tareas Próximas a Vencer</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ordenadas por urgencia y prioridad
                </p>
              </div>
              <button
                onClick={() => navigate('/tareas')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                🎉 ¡No tienes tareas pendientes! Tómate un respiro o crea nuevas.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 5).map(task => {
                  const materia = materias?.find(m => m.id === task.materiaId);
                  const isOverdue = task.fechaLimite && task.fechaLimite < todayStr;
                  const isToday = task.fechaLimite === todayStr;

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 border rounded-2xl transition flex items-start justify-between gap-3 ${
                        isOverdue
                          ? 'bg-red-500/5 border-red-500/30'
                          : isToday
                          ? 'bg-amber-500/5 border-amber-500/30'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.estado === 'hecha'}
                          onChange={() => toggleTaskStatus(task)}
                          className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {task.texto}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                            {materia && (
                              <span
                                className="px-2 py-0.5 rounded-md font-semibold text-[11px] text-white"
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

                            {task.fechaLimite && (
                              <span
                                className={`font-medium ${
                                  isOverdue
                                    ? 'text-red-600 dark:text-red-400 font-bold'
                                    : isToday
                                    ? 'text-amber-600 dark:text-amber-400 font-bold'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                📅 {isOverdue ? 'Vencida (' + task.fechaLimite + ')' : isToday ? 'Vence hoy' : task.fechaLimite}
                              </span>
                            )}

                            {task.enlaceDrive && (
                              <a
                                href={task.enlaceDrive}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Drive</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Quick Notes & Exams */}
        <div className="space-y-6">
          {/* Upcoming Exams Countdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-red-500" />
                <span>Próximos Exámenes</span>
              </h2>
            </div>

            {(!examenes || examenes.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No tienes exámenes registrados aún.
              </p>
            ) : (
              <div className="space-y-3">
                {examenes.slice(0, 3).map(ex => {
                  const materia = materias?.find(m => m.id === ex.materiaId);
                  const examDate = new Date(ex.fechaHora);
                  const diffDays = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={ex.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                          {diffDays <= 0 ? '¡HOY!' : `Faltan ${diffDays} días`}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {examDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                        {ex.titulo}
                      </h4>
                      {materia && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {materia.nombre} • {ex.aula || materia.aula}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Notes Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Notas Rápida</span>
              </h2>
            </div>

            {(!notas || notas.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Sin notas de captura rápida.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {notas.map(n => {
                  const materia = materias?.find(m => m.id === n.materiaId);
                  return (
                    <div
                      key={n.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl relative group text-xs"
                    >
                      <button
                        onClick={() => deleteNota(n.id)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-slate-800 dark:text-slate-200 pr-5 leading-relaxed">
                        {n.texto}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{new Date(n.fecha).toLocaleDateString('es-ES')}</span>
                        {materia && (
                          <span className="font-semibold text-indigo-500">
                            {materia.nombre}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
