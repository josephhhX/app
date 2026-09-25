import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  List,
  Grid,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { db } from '../db/db';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORAS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00'
];

export function Horario() {
  const [viewMode, setViewMode] = useState('hoy'); // 'hoy' | 'semanal'
  const materias = useLiveQuery(() => db.materias.toArray(), []);

  const now = new Date();
  const currentDayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Get list of today's classes sorted by start time
  const getTodayClasses = () => {
    if (!materias) return [];
    const list = [];
    materias.forEach(m => {
      if (m.horarios) {
        m.horarios.forEach(h => {
          if (h.diaSemana === currentDayName) {
            const [startH, startM] = h.horaInicio.split(':').map(Number);
            const [endH, endM] = h.horaFin.split(':').map(Number);
            const startMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;

            const isCurrent = currentMinutes >= startMins && currentMinutes < endMins;
            const isPassed = currentMinutes >= endMins;

            list.push({
              materia: m,
              horaInicio: h.horaInicio,
              horaFin: h.horaFin,
              startMins,
              endMins,
              isCurrent,
              isPassed
            });
          }
        });
      }
    });
    list.sort((a, b) => a.startMins - b.startMins);
    return list;
  };

  // Find class matching day & hour for grid cell
  const getClassForGridCell = (dia, hora) => {
    if (!materias) return null;
    const [cellH] = hora.split(':').map(Number);

    for (const m of materias) {
      if (m.horarios) {
        for (const h of m.horarios) {
          if (h.diaSemana === dia) {
            const [startH] = h.horaInicio.split(':').map(Number);
            const [endH] = h.horaFin.split(':').map(Number);
            if (cellH >= startH && cellH < endH) {
              return { materia: m, slot: h, isStart: cellH === startH };
            }
          }
        }
      }
    }
    return null;
  };

  const todayClasses = getTodayClasses();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Horario de Clases</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vista semanal interactiva y lista del día optimizada para celular.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setViewMode('hoy')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              viewMode === 'hoy'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Vista Hoy</span>
          </button>

          <button
            onClick={() => setViewMode('semanal')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              viewMode === 'semanal'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Vista Semanal</span>
          </button>
        </div>
      </div>

      {/* VISTA HOY (Mobile optimized timeline) */}
      {viewMode === 'hoy' && (
        <div className="space-y-4">
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
              Hoy es {currentDayName}, {now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </div>
            <span className="text-xs font-semibold bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
              {todayClasses.length} {todayClasses.length === 1 ? 'clase' : 'clases'} hoy
            </span>
          </div>

          {todayClasses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
                ¡Día Libre! No tienes clases programadas hoy
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Aprovecha para revisar tus tareas o estudiar en el modo concentración.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {todayClasses.map((item, index) => {
                const { materia, horaInicio, horaFin, isCurrent, isPassed } = item;

                return (
                  <div
                    key={index}
                    className={`relative p-5 rounded-3xl border transition shadow-sm ${
                      isCurrent
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                        : isPassed
                        ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-6 top-6 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-950 ${
                        isCurrent ? 'bg-indigo-600 ring-4 ring-indigo-500/30 animate-pulse' : 'bg-slate-400'
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-3 h-12 rounded-lg shrink-0"
                          style={{ backgroundColor: materia.color || '#6366f1' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold uppercase rounded tracking-wider animate-bounce">
                                Clase en curso
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {horaInicio} - {horaFin}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">
                            {materia.nombre}
                          </h3>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-slate-100 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span><strong>Aula:</strong> {materia.aula || 'Por definir'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-500" />
                          <span><strong>Prof:</strong> {materia.profesor || 'Por definir'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA SEMANAL (Weekly Grid) */}
      {viewMode === 'semanal' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-xs font-bold text-slate-400 uppercase w-20">Hora</th>
                {DIAS.map(d => (
                  <th
                    key={d}
                    className={`p-3 text-xs font-bold text-center uppercase ${
                      d === currentDayName ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORAS.map(h => (
                <tr key={h} className="border-b border-slate-100 dark:border-slate-800/60 h-14">
                  <td className="p-2 text-xs font-semibold text-slate-400 font-mono align-top pt-3">
                    {h}
                  </td>

                  {DIAS.map(d => {
                    const match = getClassForGridCell(d, h);
                    if (!match) {
                      return <td key={d} className="p-1 border-r border-slate-100 dark:border-slate-800/40" />;
                    }

                    const { materia, slot, isStart } = match;

                    return (
                      <td key={d} className="p-1 border-r border-slate-100 dark:border-slate-800/40 align-top">
                        {isStart && (
                          <div
                            className="p-2 rounded-xl text-white shadow-sm space-y-0.5 overflow-hidden text-xs"
                            style={{ backgroundColor: materia.color || '#6366f1' }}
                          >
                            <div className="font-bold truncate">{materia.nombre}</div>
                            <div className="text-[10px] opacity-90 truncate">{slot.horaInicio} - {slot.horaFin}</div>
                            {materia.aula && <div className="text-[10px] opacity-90 truncate">📍 {materia.aula}</div>}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
