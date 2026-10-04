import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronRight,
  Plus,
  Utensils,
  BookOpen,
  Coffee,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { db } from '../db/db';
import { AddActionModal } from '../components/AddActionModal';

export function Horario() {
  const [viewTab, setViewTab] = useState('semana'); // 'semana' | 'mes'
  const [selectedDayIndex, setSelectedDayIndex] = useState(5); // Default to Saturday (matching mockup 4 de octubre)
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const eventos = useLiveQuery(() => db.eventos.toArray(), []);

  const daysHeader = [
    { label: 'L', num: 29, dayName: 'Lunes' },
    { label: 'M', num: 30, dayName: 'Martes' },
    { label: 'X', num: 1, dayName: 'Miércoles' },
    { label: 'J', num: 2, dayName: 'Jueves' },
    { label: 'V', num: 3, dayName: 'Viernes' },
    { label: 'S', num: 4, dayName: 'Sábado' },
    { label: 'D', num: 5, dayName: 'Domingo' }
  ];

  const currentSelectedDay = daysHeader[selectedDayIndex];

  // Get classes for the selected day from materias
  const dayClasses = [];
  (materias || []).forEach(m => {
    (m.horarios || []).forEach(h => {
      if (h.diaSemana === currentSelectedDay.dayName) {
        dayClasses.push({
          id: `materia-${m.id}-${h.horaInicio}`,
          titulo: m.nombre,
          lugar: m.aula || 'Aula virtual',
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
          tipo: 'clase',
          materiaColor: m.color
        });
      }
    });
  });

  // Get manual events for this day
  const manualEvents = (eventos || []).map(e => ({
    id: `evt-${e.id}`,
    rawId: e.id,
    titulo: e.titulo,
    lugar: e.lugar || 'Campus',
    horaInicio: e.horaInicio || '08:00',
    horaFin: e.horaFin || '10:00',
    tipo: e.tipo || 'evento',
    isManual: true
  }));

  const allDayEvents = [...dayClasses, ...manualEvents].sort((a, b) =>
    (a.horaInicio || '00:00').localeCompare(b.horaInicio || '00:00')
  );

  const deleteManualEvent = async (id) => {
    if (window.confirm('¿Eliminar este evento?')) {
      await db.eventos.delete(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto md:max-w-4xl">
      
      {/* 1. HEADER (Mockup 5) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#163a34] dark:text-[#e4eee9]">
          Horario
        </h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="text-xs font-bold text-[#184a42] dark:text-[#6ee7b7] flex items-center gap-1 hover:underline"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir evento</span>
        </button>
      </div>

      {/* 2. SWITCHER PILLS (Semana / Mes) */}
      <div className="flex items-center p-1 rounded-full bg-[#ebf2ee] dark:bg-[#142722] text-xs font-bold max-w-xs mx-auto">
        <button
          onClick={() => setViewTab('semana')}
          className={`flex-1 py-2 rounded-full transition text-center ${
            viewTab === 'semana'
              ? 'bg-[#184a42] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Semana
        </button>
        <button
          onClick={() => setViewTab('mes')}
          className={`flex-1 py-2 rounded-full transition text-center ${
            viewTab === 'mes'
              ? 'bg-[#184a42] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Mes
        </button>
      </div>

      {/* 3. DAYS SELECTOR ROW (Mockup 5) */}
      <div className="grid grid-cols-7 gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#14221f] border border-[#e8eeea] dark:border-[#1e302d] text-center shadow-xs">
        {daysHeader.map((d, index) => {
          const isSelected = selectedDayIndex === index;
          return (
            <button
              key={index}
              onClick={() => setSelectedDayIndex(index)}
              className="flex flex-col items-center gap-1.5 py-1.5 group transition"
            >
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600">
                {d.label}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  isSelected
                    ? 'bg-[#184a42] text-white shadow-xs scale-105'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {d.num}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. TIMELINE OF EVENTS (Mockup 5) */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Agenda para el {currentSelectedDay.dayName}
        </div>

        {allDayEvents.length === 0 ? (
          <div className="jami-card p-8 text-center space-y-2">
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No hay clases ni eventos programados para este día
            </p>
            <p className="text-xs text-slate-400">
              Usa el botón superior para agregar un evento o clase.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allDayEvents.map((evt, idx) => {
              // Soft pastel styling matching mockup 5
              const colorSchemes = [
                { bg: 'bg-[#fdf2ea]', border: 'border-[#fcdcc8]', iconBg: 'bg-[#fae0d3] text-[#c8561d]', icon: BookOpen },
                { bg: 'bg-[#ebf8f2]', border: 'border-[#d2efe2]', iconBg: 'bg-[#d5f3e5] text-[#1b7a4e]', icon: BookOpen },
                { bg: 'bg-[#f8faf8] dark:bg-[#182723]', border: 'border-slate-200 dark:border-slate-800', iconBg: 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300', icon: Utensils },
                { bg: 'bg-[#f4ecfb]', border: 'border-[#e7d5f8]', iconBg: 'bg-[#ead6fa] text-[#7a35b8]', icon: BookOpen },
                { bg: 'bg-[#ebf5fb]', border: 'border-[#cce7f8]', iconBg: 'bg-[#d4ebf9] text-[#1c6ca1]', icon: Coffee }
              ];
              const c = colorSchemes[idx % colorSchemes.length];
              const IconComponent = c.icon;

              return (
                <div key={evt.id} className="flex items-center gap-4">
                  {/* Left Column: Time */}
                  <span className="w-12 text-xs font-extrabold text-slate-400 text-right shrink-0">
                    {evt.horaInicio}
                  </span>

                  {/* Right Event Card */}
                  <div className={`flex-1 p-3.5 sm:p-4 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-between gap-3 shadow-xs`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                          {evt.titulo}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {evt.lugar} {evt.horaFin ? `• Hasta las ${evt.horaFin}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {evt.isManual && (
                        <button
                          onClick={() => deleteManualEvent(evt.rawId)}
                          className="p-1 text-slate-400 hover:text-red-500 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. VER HORARIO COMPLETO (Mockup 5 bottom link) */}
        <div className="text-center pt-3">
          <button
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="text-xs font-bold text-[#184a42] dark:text-[#6ee7b7] hover:underline"
          >
            {showFullSchedule ? 'Ocultar horario completo ▴' : 'Ver horario completo >'}
          </button>
        </div>

        {/* Full Weekly Grid when expanded */}
        {showFullSchedule && (
          <div className="jami-card p-4 overflow-x-auto space-y-3 animate-fade-in mt-3">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Distribución Semanal de Materias
            </h3>
            <table className="w-full text-xs text-left min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2">Materia</th>
                  <th className="py-2">Profesor</th>
                  <th className="py-2">Aula</th>
                  <th className="py-2">Horarios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(materias || []).map(m => (
                  <tr key={m.id}>
                    <td className="py-2.5 font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color || '#184a42' }} />
                      <span>{m.nombre}</span>
                    </td>
                    <td className="py-2.5 text-slate-500">{m.profesor || 'Por definir'}</td>
                    <td className="py-2.5 text-slate-500">{m.aula || 'Aula virtual'}</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">
                      {m.horarios?.map((h, i) => (
                        <span key={i} className="inline-block mr-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {h.diaSemana}: {h.horaInicio}-{h.horaFin}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add Modal */}
      <AddActionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} defaultMode="evento" />
    </div>
  );
}
