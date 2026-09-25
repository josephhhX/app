import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  Timer,
  BarChart2,
  Folder,
  Settings,
  Flame,
  Search,
  Zap,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useStreak } from '../context/StreakContext';
import { QuickCaptureModal } from './QuickCaptureModal';
import { GlobalSearchModal } from './GlobalSearchModal';

export function Navigation({ children }) {
  const { theme, setTheme } = useTheme();
  const { streak } = useStreak();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/materias', label: 'Materias', icon: BookOpen },
    { path: '/tareas', label: 'Tareas', icon: CheckSquare },
    { path: '/horario', label: 'Horario', icon: Calendar },
    { path: '/concentracion', label: 'Concentración', icon: Timer },
    { path: '/estadisticas', label: 'Estadísticas', icon: BarChart2 },
    { path: '/documentos', label: 'Drive & Docs', icon: Folder },
    { path: '/ajustes', label: 'Ajustes', icon: Settings },
  ];

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('auto');
    else setTheme('light');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 h-screen z-30">
        {/* App Logo */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 font-black text-lg">
              A
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-tight text-slate-900 dark:text-white">
                AcademiX
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                PWA Local-First
              </span>
            </div>
          </div>
        </div>

        {/* Quick Capture Button */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => setIsCaptureOpen(true)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 text-sm"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Captura Rápida</span>
          </button>
          
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium rounded-xl transition flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Buscar...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-400">Ctrl K</kbd>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info: Streak & Theme */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Streak Widget */}
          <div className="flex items-center justify-between bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-3 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>Racha de estudio</span>
            </div>
            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">
              {streak} días 🔥
            </span>
          </div>

          {/* Theme Switch */}
          <button
            onClick={cycleTheme}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <span className="flex items-center gap-2">
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
              {theme === 'auto' && <Laptop className="w-4 h-4 text-emerald-500" />}
              <span className="capitalize">Modo: {theme}</span>
            </span>
            <span className="text-[10px] text-slate-400">Cambiar</span>
          </button>
        </div>
      </aside>

      {/* Top Mobile Bar */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            A
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            AcademiX
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{streak}d</span>
          </div>

          {/* Search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Capture Button */}
          <button
            onClick={() => setIsCaptureOpen(true)}
            className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20 active:scale-95 transition"
            title="Captura rápida"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={cycleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
            {theme === 'auto' && <Laptop className="w-4 h-4 text-emerald-500" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Bottom Navigation Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 px-1 py-1.5 shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 rounded-xl transition text-[10px] font-medium ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Modals */}
      <QuickCaptureModal isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
