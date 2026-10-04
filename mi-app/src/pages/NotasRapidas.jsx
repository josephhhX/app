import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  FileText,
  Search,
  MoreVertical,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  FlaskConical,
  HelpCircle,
  CheckSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { db } from '../db/db';
import { AddActionModal } from '../components/AddActionModal';

export function NotasRapidas() {
  const [filterTab, setFilterTab] = useState('todas'); // 'todas', 'hoy', 'semana'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [convertingNote, setConvertingNote] = useState(null);

  const notas = useLiveQuery(() => db.notasRapidas.toArray(), []);
  const materias = useLiveQuery(() => db.materias.toArray(), []);

  // Filter notes
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredNotas = (notas || []).filter(n => {
    if (searchQuery.trim() && !n.texto.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterTab === 'hoy') {
      return n.fecha && n.fecha.startsWith(todayStr);
    }
    return true;
  });

  const deleteNota = async (id) => {
    if (window.confirm('¿Eliminar esta nota?')) {
      await db.notasRapidas.delete(id);
    }
  };

  const convertToTask = async (nota) => {
    await db.tareas.add({
      texto: nota.texto,
      materiaId: null,
      fechaLimite: todayStr,
      horaLimite: '16:00',
      estado: 'pendiente',
      prioridad: 'media',
      esDestacada: false,
      subtareas: []
    });
    alert('✓ ¡Nota convertida en Tarea exitosamente!');
  };

  const getNoteStyle = (categoria, color) => {
    switch (categoria) {
      case 'Ideas':
        return {
          bg: 'bg-[#fef9e7]',
          border: 'border-[#fcf0b8]',
          iconBg: 'bg-[#faefba] text-[#966f10]',
          icon: Lightbulb
        };
      case 'Fórmulas':
        return {
          bg: 'bg-[#ebf5fb]',
          border: 'border-[#cce7f8]',
          iconBg: 'bg-[#d4ebf9] text-[#1c6ca1]',
          icon: FlaskConical
        };
      case 'Libros':
        return {
          bg: 'bg-[#ebf8f2]',
          border: 'border-[#d2efe2]',
          iconBg: 'bg-[#d5f3e5] text-[#1b7a4e]',
          icon: CheckSquare
        };
      case 'Dudas':
        return {
          bg: 'bg-[#fdeef2]',
          border: 'border-[#fad3dc]',
          iconBg: 'bg-[#f8d0db] text-[#b33254]',
          icon: HelpCircle
        };
      default:
        return {
          bg: 'bg-[#f4ecfb]',
          border: 'border-[#e7d5f8]',
          iconBg: 'bg-[#ead6fa] text-[#7a35b8]',
          icon: FileText
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto md:max-w-4xl">
      
      {/* 1. HEADER (Mockup 6) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#163a34] dark:text-[#e4eee9] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#184a42]" />
          <span>Notas rápidas</span>
        </h1>

        <button
          onClick={() => setIsAddOpen(true)}
          className="p-2 rounded-xl bg-white dark:bg-[#14221f] border border-slate-200/80 dark:border-slate-800 text-[#184a42] dark:text-[#6ee7b7] font-bold text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva nota</span>
        </button>
      </div>

      {/* 2. FILTER PILLS (Todas, Hoy, Esta semana) */}
      <div className="flex items-center gap-2 text-xs font-bold">
        <button
          onClick={() => setFilterTab('todas')}
          className={`px-4 py-2 rounded-full transition ${
            filterTab === 'todas'
              ? 'bg-[#184a42] text-white shadow-xs'
              : 'bg-white dark:bg-[#14221f] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterTab('hoy')}
          className={`px-4 py-2 rounded-full transition ${
            filterTab === 'hoy'
              ? 'bg-[#184a42] text-white shadow-xs'
              : 'bg-white dark:bg-[#14221f] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          Hoy
        </button>
      </div>

      {/* 3. COLORFUL PASTEL NOTE CARDS LIST (Mockup 6) */}
      <div className="space-y-3">
        {filteredNotas.length === 0 ? (
          <div className="jami-card p-10 text-center space-y-2">
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No tienes notas rápidas todavía
            </p>
            <p className="text-xs text-slate-400">
              Escribe ideas, dudas o fórmulas al instante usando el botón +.
            </p>
          </div>
        ) : (
          filteredNotas.map(nota => {
            const style = getNoteStyle(nota.categoria, nota.color);
            const Icon = style.icon;

            const noteDate = new Date(nota.fecha);
            const timeStr = noteDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={nota.id}
                className={`p-4 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-between gap-3 shadow-xs group`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-900 truncate">
                      {nota.texto}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{nota.categoria || 'Nota'}</span>
                      <span>•</span>
                      <span>{timeStr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => convertToTask(nota)}
                    className="text-[11px] font-bold text-[#184a42] hover:underline hidden sm:inline"
                    title="Convertir a tarea"
                  >
                    Hacer tarea
                  </button>
                  <button
                    onClick={() => deleteNota(nota.id)}
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

      {/* 4. CONVIERTE NOTAS EN TAREAS BANNER (Mockup 6 bottom) */}
      <div className="p-4 rounded-2xl bg-[#ebf5fb] border border-[#cce7f8] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#d4ebf9] text-[#1c6ca1] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-[#144d73]">
              Convierte notas en tareas
            </div>
            <div className="text-[11px] text-slate-500">
              Puedes añadir fecha, materia y prioridad desde el botón de cada nota.
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddActionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} defaultMode="menu" />
    </div>
  );
}
