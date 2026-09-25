import Dexie from 'dexie';

export const db = new Dexie('AcademixDB');

// Define database schema
db.version(1).stores({
  materias: '++id, nombre, profesor, aula, color',
  tareas: '++id, materiaId, fechaLimite, estado, prioridad, esExamen',
  examenes: '++id, materiaId, fechaHora',
  notasRapidas: '++id, materiaId, fecha',
  sesionesConcentracion: '++id, tipo, fecha, tareaId',
  calificaciones: '++id, materiaId, fecha',
  documentos: '++id, materiaId, fecha',
  configuracion: 'key'
});

/**
 * Seed sample data if database is empty on first startup
 */
export async function initSeedData() {
  const count = await db.materias.count();
  if (count === 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);
    const inThreeDaysStr = inThreeDays.toISOString().split('T')[0];

    // Seed Materias
    const m1 = await db.materias.add({
      nombre: 'Cálculo Multivariable',
      profesor: 'Dr. Roberto Gómez',
      aula: 'Edificio B - Aula 204',
      color: '#6366f1', // Indigo
      horarios: [
        { diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '10:00' },
        { diaSemana: 'Miércoles', horaInicio: '08:00', horaFin: '10:00' }
      ],
      notas: 'Sílabo: 3 Parciales (60%), Proyecto Final (20%), Tareas (20%). Enlace al libro digital en el aula virtual.'
    });

    const m2 = await db.materias.add({
      nombre: 'Programación Web Avanzada',
      profesor: 'Ing. Elena Rostova',
      aula: 'Laboratorio de Cómputo 3',
      color: '#10b981', // Emerald
      horarios: [
        { diaSemana: 'Martes', horaInicio: '10:00', horaFin: '12:00' },
        { diaSemana: 'Jueves', horaInicio: '10:00', horaFin: '12:00' }
      ],
      notas: 'Entregables todos los viernes a la medianoche. Usar GitHub para control de versiones.'
    });

    const m3 = await db.materias.add({
      nombre: 'Física Universitaria II',
      profesor: 'Dra. María Fernández',
      aula: 'Edificio A - Aula 102',
      color: '#f59e0b', // Amber
      horarios: [
        { diaSemana: 'Lunes', horaInicio: '10:00', horaFin: '12:00' },
        { diaSemana: 'Viernes', horaInicio: '08:00', horaFin: '10:00' }
      ],
      notas: 'Traer calculadora científica y guía de laboratorio impresa a cada clase práctica.'
    });

    // Seed Tareas
    await db.tareas.bulkAdd([
      {
        materiaId: m1,
        texto: 'Resolver Guía 3: Integrales triples y sistemas de coordenadas',
        fechaLimite: tomorrowStr,
        estado: 'pendiente',
        prioridad: 'alta',
        recurrente: false,
        subtareas: [
          { id: '1', texto: 'Ejercicios 1 al 10', completada: true },
          { id: '2', texto: 'Ejercicios 11 al 20', completada: false },
          { id: '3', texto: 'Revisar respuestas con el profesor', completada: false }
        ],
        enlaceDrive: 'https://drive.google.com'
      },
      {
        materiaId: m2,
        texto: 'Diseñar arquitectura PWA para proyecto semestral',
        fechaLimite: inThreeDaysStr,
        estado: 'en progreso',
        prioridad: 'alta',
        recurrente: false,
        subtareas: [
          { id: '1', texto: 'Definir modelo Dexie IndexedDB', completada: true },
          { id: '2', texto: 'Configurar Manifest y Service Worker', completada: true },
          { id: '3', texto: 'Implementar notificaciones locales', completada: false }
        ],
        enlaceDrive: ''
      },
      {
        materiaId: m3,
        texto: 'Informe Lab 2: Ley de Gauss y Campo Eléctrico',
        fechaLimite: todayStr,
        estado: 'pendiente',
        prioridad: 'media',
        recurrente: false,
        subtareas: [],
        enlaceDrive: ''
      }
    ]);

    // Seed Exámenes
    await db.examenes.add({
      materiaId: m1,
      titulo: 'Parcial 1 - Derivadas Parciales e Integrales',
      fechaHora: `${inThreeDaysStr}T08:00`,
      aula: 'Edificio B - Aula 204',
      temas: 'Capítulos 11 al 13 del Thomas Calculus.',
      nota: null
    });

    // Seed Calificaciones
    await db.calificaciones.bulkAdd([
      { materiaId: m1, descripcion: 'Quiz 1', nota: 18, fecha: '2026-09-10', porcentaje: 10 },
      { materiaId: m2, descripcion: 'Práctica 1 (React Core)', nota: 19, fecha: '2026-09-15', porcentaje: 15 },
      { materiaId: m3, descripcion: 'Informe Lab 1', nota: 16, fecha: '2026-09-12', porcentaje: 10 }
    ]);

    // Seed Nota Rápida
    await db.notasRapidas.add({
      texto: 'Preguntar al profesor Gómez sobre la prórroga del laboratorio de Física.',
      fecha: new Date().toISOString(),
      materiaId: m3
    });

    // Seed Configuration
    await db.configuracion.put({ key: 'theme', value: 'auto' });
    await db.configuracion.put({ key: 'notificationTimeOffset', value: 15 }); // 15 mins before class
    await db.configuracion.put({ key: 'streakCount', value: 3 });
    await db.configuracion.put({ key: 'lastCompletedDate', value: todayStr });
    await db.configuracion.put({ key: 'batteryAlertDismissed', value: false });
  }
}
