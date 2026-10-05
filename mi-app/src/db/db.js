import Dexie from 'dexie';

export const db = new Dexie('JamiDB');

// Define database schema
db.version(2).stores({
  materias: '++id, nombre, profesor, aula, color',
  tareas: '++id, materiaId, fechaLimite, estado, prioridad, esDestacada, esExamen',
  examenes: '++id, materiaId, fechaHora',
  notasRapidas: '++id, materiaId, fecha, categoria, icono, color',
  sesionesConcentracion: '++id, tipo, fecha, tareaId, materiaId, duracion',
  eventos: '++id, titulo, tipo, materiaId, lugar, fecha, horaInicio, horaFin',
  objetivos: '++id, titulo, completado, fecha, categoria',
  calificaciones: '++id, materiaId, fecha',
  documentos: '++id, materiaId, fecha',
  configuracion: 'key'
});

/**
 * Initialize default user preferences without any fake/mock test data
 */
export async function initDefaultConfig() {
  const userConfig = await db.configuracion.get('userName');
  if (!userConfig) {
    await db.configuracion.bulkPut([
      { key: 'userName', value: '' },
      { key: 'userEmail', value: '' },
      { key: 'onboardingComplete', value: false },
      { key: 'theme', value: 'light' },
      { key: 'accent', value: 'bosque' },
      { key: 'notificationTimeOffset', value: 15 },
      { key: 'streakCount', value: 0 },
      { key: 'batteryAlertDismissed', value: false }
    ]);
  }
}

/**
 * Clear any dummy / test data if previously loaded
 */
export async function clearDummyData() {
  await db.transaction('rw', [db.materias, db.tareas, db.examenes, db.notasRapidas, db.sesionesConcentracion, db.eventos, db.objetivos, db.calificaciones, db.documentos], async () => {
    await db.materias.clear();
    await db.tareas.clear();
    await db.examenes.clear();
    await db.notasRapidas.clear();
    await db.sesionesConcentracion.clear();
    await db.eventos.clear();
    await db.objetivos.clear();
    await db.calificaciones.clear();
    await db.documentos.clear();
  });
}
