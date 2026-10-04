import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Bell,
  Zap,
  BookOpen,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Target,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  Search,
  Folder,
  BarChart2,
  GraduationCap,
  FileText
} from 'lucide-react';
import { db } from '../db/db';
import { JamiLogo } from '../components/JamiLogo';
import { AddActionModal } from '../components/AddActionModal';
import { GlobalSearchModal } from '../components/GlobalSearchModal';

export function Dashboard() {
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const tareas = useLiveQuery(() => db.tareas.toArray(), []);
  const examenes = useLiveQuery(() => db.examenes.toArray(), []);
  const eventos = useLiveQuery(() => db.eventos.toArray(), []);
  const sesiones = useLiveQuery(() => db.sesionesConcentracion.toArray(), []);

  const userConfig = useLiveQuery(async () => {
    const name = await db.configuracion.get('userName');
    return {
      name: name?.value || 'tú'
    };
  }, []);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Format date: "sábado, 4 de octubre"
  const formattedDate = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // Dynamic greeting: Buenos días / Buenas tardes / Buenas noches
  const hour = now.getHours();
  let greeting = 'Buenos días';
  let greetingIcon = '☀️';
  if (hour >= 12 && hour < 19) {
    greeting = 'Buenas tardes';
    greetingIcon = '🌤️';
  } else if (hour >= 19 || hour < 6) {
    greeting = 'Buenas noches';
    greetingIcon = '🌙';
  }

  const pendingTasks = (tareas || []).filter(t => t.estado !== 'hecha');
  const upcomingExams = examenes || [];

  // Find Highlighted Task (Mockup 1: "Tarea destacada")
  const featuredTask = pendingTasks.find(t => t.esDestacada || t.prioridad === 'urgente') || pendingTasks[0];
  const featuredMateria = featuredTask ? (materias || []).find(m => m.id === featuredTask.materiaId) : null;

  // Calculate total focus time this week
  const totalFocusMinutes = (sesiones || []).reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusRemainingMins = totalFocusMinutes % 60;

  // Upcoming Events list (combining manual eventos and today's classes)
  const currentDayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][now.getDay()];
  const todayClasses = [];
  (materias || []).forEach(m => {
    (m.horarios || []).forEach(h => {
      if (h.diaSemana === currentDayName) {
        todayClasses.push({
          id: `class-${m.id}-${h.horaInicio}`,
          titulo: m.nombre,
          lugar: m.aula || 'Aula virtual',
          horaInicio: h.horaInicio,
          tipo: 'clase',
          materiaColor: m.color
        });
      }
    });
  });

  const allUpcomingEvents = [
    ...(eventos || []).map(e => ({ ...e, id: `evt-${e.id}` })),
    ...todayClasses
  ].sort((a, b) => (a.horaInicio || '00:00').localeCompare(b.horaInicio || '00:00'));

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto md:max-w-4xl">
      
      {/* 1. TOP BAR (Mobile visible header) */}
      <div className="flex items-center justify-between pt-1">
        <JamiLogo className="w-8 h-8" textSize="text-2xl" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c302c] transition shadow-2xs"
            title="Buscar en Jami (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/horario')}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c302c] transition shadow-2xs relative"
            title="Avisos"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          <button
            onClick={() => navigate('/ajustes')}
            className="w-10 h-10 rounded-full bg-[#184a42] text-white font-bold text-sm flex items-center justify-center shadow-xs hover:opacity-95 transition"
            title="Perfil y ajustes"
          >
            {userConfig?.name ? userConfig.name.charAt(0).toUpperCase() : 'L'}
          </button>
        </div>
      </div>

      {/* 2. GREETING & DATE */}
      <div className="space-y-0.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#163a34] dark:text-[#e4eee9] tracking-tight">
          {greeting}, {userConfig?.name || 'tú'} {greetingIcon}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">
          Hoy es {formattedDate}
        </p>
      </div>

      {/* 3. QUICK NOTE CALLOUT BANNER (Mockup 1) */}
      <div
        onClick={() => setIsAddOpen(true)}
        className="jami-card p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-[#184a42]/30 transition group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f4ecfb] dark:bg-[#281838] flex items-center justify-center text-[#7a35b8] dark:text-[#d8b4fe] shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-[#184a42] dark:group-hover:text-[#6ee7b7] transition">
              ¿Necesitas anotar algo?
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400">
              Toca el + para una nota rápida
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
      </div>

      {/* 4. THREE SUMMARY CHIPS (Mockup 1) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Tareas */}
        <div
          onClick={() => navigate('/tareas?tab=lista')}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#ebf8f2] dark:bg-[#122720] border border-[#d2efe2] dark:border-[#1b3d33] flex flex-col justify-between cursor-pointer hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-2 text-[#1b7a4e] dark:text-[#6ee7b7]">
            <BookOpen className="w-4 h-4" />
            <span className="text-lg sm:text-xl font-black">{pendingTasks.length}</span>
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-[#145a3a] dark:text-[#a7f3d0] mt-1">
            Tareas
          </span>
        </div>

        {/* Clases */}
        <div
          onClick={() => navigate('/horario')}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#f4ecfb] dark:bg-[#251733] border border-[#e7d5f8] dark:border-[#3d2454] flex flex-col justify-between cursor-pointer hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-2 text-[#7a35b8] dark:text-[#d8b4fe]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-lg sm:text-xl font-black">{todayClasses.length}</span>
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-[#582188] dark:text-[#e9d5ff] mt-1">
            Clases hoy
          </span>
        </div>

        {/* Examen */}
        <div
          onClick={() => navigate('/tareas?tab=examenes')}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#fdf2ea] dark:bg-[#2d1c16] border border-[#fcdcc8] dark:border-[#48281d] flex flex-col justify-between cursor-pointer hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-2 text-[#c8561d] dark:text-[#fdba74]">
            <Calendar className="w-4 h-4" />
            <span className="text-lg sm:text-xl font-black">{upcomingExams.length}</span>
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-[#8c350d] dark:text-[#fed7aa] mt-1">
            Exámenes
          </span>
        </div>
      </div>

      {/* QUICK ACCESS MODULES (Materias, Exámenes, Calificaciones, Documentos, Notas) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Módulos rápidos
          </span>
          <button
            onClick={() => navigate('/mas')}
            className="text-[11px] font-bold text-[#184a42] dark:text-[#6ee7b7] hover:underline"
          >
            Ver más &gt;
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/materias')}
            className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 hover:border-[#184a42]/40 hover:bg-[#ebf8f2]/40 dark:hover:bg-[#182b26] transition group shadow-2xs"
            title="Materias"
          >
            <div className="w-9 h-9 rounded-xl bg-[#ebf8f2] dark:bg-[#1b342e] text-[#184a42] dark:text-[#6ee7b7] flex items-center justify-center transition group-hover:scale-105">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#184a42] dark:group-hover:text-[#6ee7b7] truncate w-full text-center">
              Materias
            </span>
          </button>

          <button
            onClick={() => navigate('/tareas?tab=examenes')}
            className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 hover:border-[#c8561d]/40 hover:bg-[#fdf2ea]/40 dark:hover:bg-[#2d1c16] transition group shadow-2xs"
            title="Exámenes"
          >
            <div className="w-9 h-9 rounded-xl bg-[#fdf2ea] dark:bg-[#361f18] text-[#c8561d] dark:text-[#fdba74] flex items-center justify-center transition group-hover:scale-105">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#c8561d] dark:group-hover:text-[#fdba74] truncate w-full text-center">
              Exámenes
            </span>
          </button>

          <button
            onClick={() => navigate('/estadisticas')}
            className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 hover:border-[#1c6ca1]/40 hover:bg-[#ebf5fb]/40 dark:hover:bg-[#142838] transition group shadow-2xs"
            title="Estadísticas y Calificaciones"
          >
            <div className="w-9 h-9 rounded-xl bg-[#ebf5fb] dark:bg-[#162e40] text-[#1c6ca1] dark:text-[#7dd3fc] flex items-center justify-center transition group-hover:scale-105">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1c6ca1] dark:group-hover:text-[#7dd3fc] truncate w-full text-center">
              Notas/Stats
            </span>
          </button>

          <button
            onClick={() => navigate('/documentos')}
            className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 hover:border-[#7a35b8]/40 hover:bg-[#f4ecfb]/40 dark:hover:bg-[#281838] transition group shadow-2xs"
            title="Documentos y Drive"
          >
            <div className="w-9 h-9 rounded-xl bg-[#f4ecfb] dark:bg-[#2e1a40] text-[#7a35b8] dark:text-[#d8b4fe] flex items-center justify-center transition group-hover:scale-105">
              <Folder className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#7a35b8] dark:group-hover:text-[#d8b4fe] truncate w-full text-center">
              Drive/Docs
            </span>
          </button>

          <button
            onClick={() => navigate('/notas')}
            className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 hover:border-amber-500/40 hover:bg-amber-50/40 dark:hover:bg-[#2d2815] transition group shadow-2xs"
            title="Notas rápidas"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-[#342a15] text-amber-600 dark:text-amber-400 flex items-center justify-center transition group-hover:scale-105">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate w-full text-center">
              Notas
            </span>
          </button>
        </div>
      </div>

      {/* 5. PRÓXIMOS EVENTOS (Mockup 1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            Próximos eventos
          </h2>
          <button
            onClick={() => navigate('/horario')}
            className="text-xs font-semibold text-[#184a42] dark:text-[#6ee7b7] hover:underline"
          >
            Ver calendario &gt;
          </button>
        </div>

        {allUpcomingEvents.length === 0 ? (
          <div className="jami-card p-5 text-center space-y-1.5">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              No tienes eventos ni clases programadas para hoy
            </p>
            <p className="text-[11px] text-slate-400">
              Toca el botón + para añadir una clase, tutoría o entrega.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {allUpcomingEvents.slice(0, 4).map((evt, idx) => {
              // Color styles matching mockup
              const colors = [
                { bg: 'bg-[#fdf2ea]/70 dark:bg-[#2d1c16]/70', border: 'border-[#fcdcc8] dark:border-[#48281d]', text: 'text-[#8c350d] dark:text-[#fdba74]', iconBg: 'bg-[#f8ded1] text-[#c8561d]' },
                { bg: 'bg-[#ebf8f2]/70 dark:bg-[#122720]/70', border: 'border-[#d2efe2] dark:border-[#1b3d33]', text: 'text-[#145a3a] dark:text-[#a7f3d0]', iconBg: 'bg-[#d5f3e5] text-[#1b7a4e]' },
                { bg: 'bg-[#f4ecfb]/70 dark:bg-[#251733]/70', border: 'border-[#e7d5f8] dark:border-[#3d2454]', text: 'text-[#582188] dark:text-[#e9d5ff]', iconBg: 'bg-[#ead6fa] text-[#7a35b8]' },
                { bg: 'bg-[#ebf5fb]/70 dark:bg-[#13222e]/70', border: 'border-[#cce7f8] dark:border-[#1d374a]', text: 'text-[#144d73] dark:text-[#bae6fd]', iconBg: 'bg-[#d4ebf9] text-[#1c6ca1]' }
              ];
              const c = colors[idx % colors.length];

              return (
                <div
                  key={evt.id}
                  className={`p-3.5 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        {evt.titulo}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {evt.lugar}
                      </div>
                    </div>
                  </div>

                  <span className="font-bold text-xs text-slate-700 dark:text-slate-200">
                    {evt.horaInicio}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. TAREA DESTACADA (Mockup 1) */}
      <div className="space-y-2">
        {featuredTask ? (
          <div
            onClick={() => navigate('/tareas')}
            className="p-4 rounded-2xl bg-[#fdf2ea] dark:bg-[#2d1c16] border border-[#fcdcc8] dark:border-[#48281d] flex items-center justify-between gap-3 cursor-pointer hover:border-[#c8561d]/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fae0d3] dark:bg-[#43231a] flex items-center justify-center text-[#c8561d] shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#c8561d]">
                  Tarea destacada
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-[#c8561d] transition">
                  {featuredTask.texto}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {featuredMateria?.nombre || 'General'} • {featuredTask.fechaLimite || 'Hoy'} • {featuredTask.horaLimite || '16:00'}
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#c8561d] group-hover:translate-x-0.5 transition" />
          </div>
        ) : (
          <div className="jami-card p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                No tienes tareas pendientes
              </div>
              <div className="text-[11px] text-slate-400">
                ¡Todo al día! Pulsa el botón + para registrar una nueva tarea.
              </div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="text-xs font-bold text-[#184a42] hover:underline"
            >
              + Añadir
            </button>
          </div>
        )}
      </div>

      {/* 7. TU PROGRESO SEMANAL (Mockup 1) */}
      <div className="jami-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
            Tu progreso semanal
          </h2>
          <button
            onClick={() => navigate('/sesiones')}
            className="text-xs font-semibold text-[#184a42] dark:text-[#6ee7b7] hover:underline"
          >
            Ver más &gt;
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalFocusMinutes > 0 ? `${focusHours}h ${focusRemainingMins}m` : '0h 0m'}
          </span>
          <span className="text-xs text-slate-400">enfoque completado</span>
        </div>

        {/* Segmented Progress Bars (Mockup 1) */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          <div className="h-2 rounded-full bg-[#1c6ca1]" />
          <div className="h-2 rounded-full bg-[#1b7a4e]" />
          <div className="h-2 rounded-full bg-[#7a35b8]" />
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Add Modal */}
      <AddActionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
