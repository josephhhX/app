import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, CheckSquare, Calendar, FileText, ExternalLink } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';

export function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const tareas = useLiveQuery(() => db.tareas.toArray(), []);
  const examenes = useLiveQuery(() => db.examenes.toArray(), []);
  const notas = useLiveQuery(() => db.notasRapidas.toArray(), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open signal
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredMaterias = q
    ? (materias || []).filter(m => m.nombre?.toLowerCase().includes(q) || m.profesor?.toLowerCase().includes(q) || m.aula?.toLowerCase().includes(q))
    : [];

  const filteredTareas = q
    ? (tareas || []).filter(t => t.texto?.toLowerCase().includes(q))
    : [];

  const filteredExamenes = q
    ? (examenes || []).filter(e => e.titulo?.toLowerCase().includes(q) || e.temas?.toLowerCase().includes(q))
    : [];

  const filteredNotas = q
    ? (notas || []).filter(n => n.texto?.toLowerCase().includes(q))
    : [];

  const hasResults = filteredMaterias.length > 0 || filteredTareas.length > 0 || filteredExamenes.length > 0 || filteredNotas.length > 0;

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar materias, tareas, exámenes, notas..."
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!query && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Escribe algo para empezar a buscar en toda la aplicación...
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No se encontraron resultados para "{query}"
            </div>
          )}

          {/* Materias */}
          {filteredMaterias.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Materias ({filteredMaterias.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredMaterias.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSelect('/materias')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color || '#6366f1' }} />
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {m.nombre}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Prof: {m.profesor || 'N/A'} • {m.aula || 'Sin aula'}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tareas */}
          {filteredTareas.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tareas ({filteredTareas.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredTareas.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect('/tareas')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {t.texto}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className={`capitalize font-semibold ${t.prioridad === 'alta' ? 'text-red-500' : t.prioridad === 'media' ? 'text-amber-500' : 'text-blue-500'}`}>
                          {t.prioridad}
                        </span>
                        <span>• Límite: {t.fechaLimite}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exámenes */}
          {filteredExamenes.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-500" />
                <span>Exámenes ({filteredExamenes.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredExamenes.map(e => (
                  <button
                    key={e.id}
                    onClick={() => handleSelect('/tareas')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {e.titulo}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Fecha: {new Date(e.fechaHora).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {filteredNotas.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Notas Rápida ({filteredNotas.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredNotas.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleSelect('/')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between group"
                  >
                    <div className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
                      {n.texto}
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
