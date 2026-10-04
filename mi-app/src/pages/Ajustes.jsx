import React, { useEffect, useRef, useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Laptop,
  Bell,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  User
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../db/db';

export function Ajustes() {
  const { theme, setTheme } = useTheme();
  const { permission, requestPermission, offsetMinutes, updateOffsetMinutes } = useNotification();

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileName, setProfileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    db.configuracion.get('userName').then((item) => setProfileName(item?.value || ''));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    const name = profileName.trim();
    if (!name) return;
    await db.configuracion.put({ key: 'userName', value: name });
    setMessage('Perfil actualizado.');
    setError('');
  };

  // Export JSON Backup
  const exportBackup = async () => {
    try {
      const data = {
        materias: await db.materias.toArray(),
        tareas: await db.tareas.toArray(),
        examenes: await db.examenes.toArray(),
        notasRapidas: await db.notasRapidas.toArray(),
        sesionesConcentracion: await db.sesionesConcentracion.toArray(),
        calificaciones: await db.calificaciones.toArray(),
        documentos: await db.documentos.toArray(),
        configuracion: await db.configuracion.toArray(),
        exportedAt: new Date().toISOString()
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `academix_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setMessage('¡Copia de seguridad exportada con éxito como JSON!');
      setError('');
    } catch (e) {
      console.error(e);
      setError('Error al exportar la copia de seguridad.');
    }
  };

  // Restore JSON Backup
  const handleFileRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);

        if (!parsed.materias && !parsed.tareas) {
          throw new Error('El archivo no parece una copia de seguridad válida de AcademiX.');
        }

        // Wipe tables and restore
        await db.transaction('rw', [db.materias, db.tareas, db.examenes, db.notasRapidas, db.sesionesConcentracion, db.calificaciones, db.documentos, db.configuracion], async () => {
          await db.materias.clear();
          await db.tareas.clear();
          await db.examenes.clear();
          await db.notasRapidas.clear();
          await db.sesionesConcentracion.clear();
          await db.calificaciones.clear();
          await db.documentos.clear();
          await db.configuracion.clear();

          if (parsed.materias) await db.materias.bulkAdd(parsed.materias);
          if (parsed.tareas) await db.tareas.bulkAdd(parsed.tareas);
          if (parsed.examenes) await db.examenes.bulkAdd(parsed.examenes);
          if (parsed.notasRapidas) await db.notasRapidas.bulkAdd(parsed.notasRapidas);
          if (parsed.sesionesConcentracion) await db.sesionesConcentracion.bulkAdd(parsed.sesionesConcentracion);
          if (parsed.calificaciones) await db.calificaciones.bulkAdd(parsed.calificaciones);
          if (parsed.documentos) await db.documentos.bulkAdd(parsed.documentos);
          if (parsed.configuracion) await db.configuracion.bulkAdd(parsed.configuracion);
        });

        setMessage('¡Datos restaurados correctamente!');
        setError('');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        console.error(err);
        setError(`Error al restaurar: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Completely Wipe Data
  const wipeAllData = async () => {
    if (window.confirm('⚠️ ¿ATENCIÓN: Estás seguro de borrar TODOS los datos de la aplicación? Esta acción es irreversible.')) {
      await db.delete();
      await db.open();
      setMessage('¡Todos los datos locales han sido borrados!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Ajustes & Copia de Seguridad</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personaliza la apariencia, notificaciones y gestiona tus datos locales.
        </p>
      </div>

      {/* Notifications / Feedback Messages */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PERFIL */}
      <form onSubmit={saveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"><User className="w-5 h-5 text-[#184a42]" /><span>Perfil</span></h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="block flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Nombre
            <input required maxLength="40" value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#184a42]/20" />
          </label>
          <button type="submit" className="px-4 py-2.5 bg-[#184a42] hover:bg-[#133c35] text-white rounded-xl font-bold text-xs transition">Guardar perfil</button>
        </div>
      </form>

      {/* SECTION 1: APARIENCIA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <span>Apariencia y Tema</span>
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-semibold transition ${
              theme === 'light'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            <span>Modo Claro</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-semibold transition ${
              theme === 'dark'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Moon className="w-6 h-6 text-indigo-400" />
            <span>Modo Oscuro</span>
          </button>

          <button
            onClick={() => setTheme('auto')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-semibold transition ${
              theme === 'auto'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Laptop className="w-6 h-6 text-emerald-500" />
            <span>Automático</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: NOTIFICACIONES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Configuración de Notificaciones Local-First</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                Permiso de Notificaciones del Navegador
              </div>
              <div className="mt-0.5">
                Estado actual: <span className={`font-semibold uppercase ${permission === 'granted' ? 'text-emerald-500' : 'text-amber-500'}`}>{permission}</span>
              </div>
            </div>

            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 transition"
              >
                Solicitar Permiso
              </button>
            )}
          </div>

          {/* Time Offset Picker */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aviso anticipado para inicio de clases:
            </label>
            <select
              value={offsetMinutes}
              onChange={(e) => updateOffsetMinutes(Number(e.target.value))}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value={10}>10 minutos antes</option>
              <option value={15}>15 minutos antes (Recomendado)</option>
              <option value={30}>30 minutos antes</option>
            </select>
          </div>

          {/* Android battery instruction notice */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-2xl space-y-2">
            <div className="font-bold flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Optimizaciones de Batería en Android</span>
            </div>
            <p className="leading-relaxed">
              En dispositivos Android (Samsung, Xiaomi, Motorola, Huawei), el sistema operativo puede pausar el Service Worker si la app permanece en segundo plano. Para garantizar notificaciones precisas:
            </p>
            <ol className="list-decimal list-inside space-y-1 font-medium pl-1">
              <li>Abre Ajustes de tu teléfono → Aplicaciones → Chrome / AcademiX</li>
              <li>Ve a <strong>Batería</strong> → Selecciona <strong>"Sin restricciones"</strong> o desactiva la optimización de batería.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* SECTION 3: BACKUP & RESTORE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Respaldo y Restauración de Datos (JSON)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tus datos se guardan 100% en el navegador (IndexedDB). Exporta tu copia JSON periódicamente para no perder información al borrar datos de navegación o cambiar de dispositivo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={exportBackup}
            className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Copia de Seguridad (.JSON)</span>
          </button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileRestore}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>Restaurar desde Archivo (.JSON)</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 justify-between items-center text-xs">
          <button
            onClick={wipeAllData}
            className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Borrar todos los datos locales</span>
          </button>
        </div>
      </div>
    </div>
  );
}
