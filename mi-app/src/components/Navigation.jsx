import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  CheckSquare,
  Clock,
  Menu,
  Plus,
  Flame,
  Search,
  Bell,
  Sun,
  Moon,
  BookOpen,
  FileText,
  BarChart2,
  Folder,
  Settings
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { JamiLogo } from './JamiLogo';
import { AddActionModal } from './AddActionModal';
import { useTheme } from '../context/ThemeContext';

export function Navigation({ children }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const userConfig = useLiveQuery(async () => {
    const nameItem = await db.configuracion.get('userName');
    const emailItem = await db.configuracion.get('userEmail');
    const streakItem = await db.configuracion.get('streakCount');
    return {
      name: nameItem?.value || 'Tu perfil',
      email: emailItem?.value || 'Estudiante',
      streak: streakItem ? streakItem.value : 0
    };
  }, []);

  const desktopNavItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/horario', label: 'Horario', icon: Calendar },
    { path: '/tareas', label: 'Tareas & Kanban', icon: CheckSquare },
    { path: '/materias', label: 'Materias', icon: BookOpen },
    { path: '/sesiones', label: 'Sesiones', icon: Clock },
    { path: '/notas', label: 'Notas rápidas', icon: FileText },
    { path: '/estadisticas', label: 'Estadísticas', icon: BarChart2 },
    { path: '/documentos', label: 'Biblioteca / Drive', icon: Folder },
    { path: '/mas', label: 'Más', icon: Menu },
    { path: '/ajustes', label: 'Configuración', icon: Settings }
  ];

  const mobileNavItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/horario', label: 'Plan', icon: Calendar },
    { path: '/tareas', label: 'Tareas', icon: CheckSquare },
    { path: '/sesiones', label: 'Sesiones', icon: Clock },
    { path: '/mas', label: 'Más', icon: Menu }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8faf8] dark:bg-[#0e1816] text-slate-800 dark:text-slate-100">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#14221f] border-r border-[#e8eeea] dark:border-[#1e302d] shrink-0 sticky top-0 h-screen z-30 justify-between p-5">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <JamiLogo className="w-9 h-9" textSize="text-2xl" />
          </div>

          {/* Quick Action Button Desktop */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-full py-3 px-4 bg-[#184a42] hover:bg-[#133c35] text-white font-bold rounded-2xl shadow-md shadow-[#184a42]/15 flex items-center justify-center gap-2 text-sm transition active:scale-98"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Añadir nuevo</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#eaf4f1] dark:bg-[#1b342e] text-[#184a42] dark:text-[#6ee7b7] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-[#182b26] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info: User & Theme Switch */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => navigate('/ajustes')}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#182b26] transition cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#184a42] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {userConfig?.name ? userConfig.name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs truncate text-slate-800 dark:text-slate-100">
              {userConfig?.name || 'Tu perfil'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {userConfig?.email || 'Estudiante'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-2 pt-1 text-slate-500">
            <span>Tema</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              title="Alternar modo"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Mockup: 5 tabs) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#14221f]/95 backdrop-blur-md border-t border-[#e8eeea] dark:border-[#1e302d] grid grid-cols-5 px-1 py-2 shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 transition text-[11px] font-medium ${
                isActive
                  ? 'text-[#184a42] dark:text-[#6ee7b7] font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* FLOATING ACTION BUTTON (FAB) FOR MOBILE & DESKTOP */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-5 md:right-8 z-40 w-14 h-14 rounded-full bg-[#184a42] hover:bg-[#133c35] text-white shadow-xl shadow-[#184a42]/30 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 border-2 border-white/20"
        title="Añadir"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Universal Add Modal / BottomSheet */}
      <AddActionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
