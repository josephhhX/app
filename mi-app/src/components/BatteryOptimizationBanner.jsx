import React from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export function BatteryOptimizationBanner() {
  const { batteryAlertDismissed, dismissBatteryAlert } = useNotification();

  if (batteryAlertDismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong>Consejo Android:</strong> Para garantizar que las notificaciones de clases y tareas lleguen a tiempo, desactiva la <em>Optimización de Batería</em> para esta PWA / Chrome en los ajustes de tu teléfono.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={dismissBatteryAlert}
          className="p-1 hover:bg-amber-500/20 rounded transition text-amber-700 dark:text-amber-300"
          title="Descartar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
