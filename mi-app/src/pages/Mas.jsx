import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Library, BarChart2, Settings, ChevronRight, NotebookPen } from 'lucide-react';

const tools = [
  { label: 'Materias', description: 'Organiza tus asignaturas y horarios', icon: BookOpen, path: '/materias', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  { label: 'Biblioteca', description: 'Documentos, recursos y enlaces', icon: Library, path: '/documentos', tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' },
  { label: 'Estadísticas', description: 'Revisa tu actividad y avance', icon: BarChart2, path: '/estadisticas', tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
  { label: 'Notas rápidas', description: 'Ideas y apuntes al instante', icon: NotebookPen, path: '/notas', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
];

export function Mas() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1b7a4e]">Tu espacio</p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#163a34] dark:text-[#e4eee9]">Más herramientas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Todo lo que necesitas para mantener tu estudio en orden.</p>
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map(({ label, description, icon: Icon, path, tone }) => (
          <button key={path} onClick={() => navigate(path)} className="jami-card p-4 flex items-center gap-3.5 text-left hover:border-[#184a42]/35 hover:-translate-y-0.5 transition-all group">
            <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tone}`}><Icon className="w-5 h-5" /></span>
            <span className="min-w-0 flex-1"><span className="block font-extrabold text-sm text-slate-800 dark:text-slate-100">{label}</span><span className="block mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</span></span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
          </button>
        ))}
      </section>
      <section className="jami-card overflow-hidden">
        <button onClick={() => navigate('/ajustes')} className="w-full p-4 sm:p-5 flex items-center gap-3.5 text-left hover:bg-slate-50 dark:hover:bg-[#182a26] transition group">
          <span className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center"><Settings className="w-5 h-5" /></span>
          <span className="min-w-0 flex-1"><span className="block font-extrabold text-sm text-slate-800 dark:text-slate-100">Configuración</span><span className="block mt-0.5 text-xs text-slate-500 dark:text-slate-400">Perfil, apariencia, avisos y copias de seguridad</span></span>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>
      </section>
    </div>
  );
}
