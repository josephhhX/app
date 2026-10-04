import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  User,
  FileText,
  X,
  Check,
  Calendar,
  Layers
} from 'lucide-react';
import { db } from '../db/db';

const COLOR_PRESETS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function Materias() {
  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const calificaciones = useLiveQuery(() => db.calificaciones.toArray(), []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [profesor, setProfesor] = useState('');
  const [aula, setAula] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [notas, setNotas] = useState('');
  const [horarios, setHorarios] = useState([
    { diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '10:00' }
  ]);

  // Subject Detail View Modal State
  const [selectedMateria, setSelectedMateria] = useState(null);

  const openCreateModal = () => {
    setEditingId(null);
    setNombre('');
    setProfesor('');
    setAula('');
    setColor(COLOR_PRESETS[0]);
    setNotas('');
    setHorarios([{ diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '10:00' }]);
    setIsModalOpen(true);
  };

  const openEditModal = (materia) => {
    setEditingId(materia.id);
    setNombre(materia.nombre || '');
    setProfesor(materia.profesor || '');
    setAula(materia.aula || '');
    setColor(materia.color || COLOR_PRESETS[0]);
    setNotas(materia.notas || '');
    setHorarios(materia.horarios && materia.horarios.length > 0 ? materia.horarios : [{ diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '10:00' }]);
    setIsModalOpen(true);
  };

  const handleAddHorarioSlot = () => {
    setHorarios([...horarios, { diaSemana: 'Martes', horaInicio: '08:00', horaFin: '10:00' }]);
  };

  const handleRemoveHorarioSlot = (index) => {
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const handleHorarioChange = (index, field, value) => {
    const updated = [...horarios];
    updated[index][field] = value;
    setHorarios(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const data = {
      nombre: nombre.trim(),
      profesor: profesor.trim(),
      aula: aula.trim(),
      color,
      notas: notas.trim(),
      horarios
    };

    if (editingId) {
      await db.materias.update(editingId, data);
    } else {
      await db.materias.add(data);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta materia? Se mantendrán las tareas asociadas.')) {
      await db.materias.delete(id);
      if (selectedMateria && selectedMateria.id === id) {
        setSelectedMateria(null);
      }
    }
  };

  // Helper to calculate subject average
  const getSubjectAverage = (materiaId) => {
    if (!calificaciones) return null;
    const itemCalifs = calificaciones.filter(c => c.materiaId === materiaId);
    if (itemCalifs.length === 0) return null;
    const sum = itemCalifs.reduce((acc, c) => acc + Number(c.nota), 0);
    return (sum / itemCalifs.length).toFixed(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Materias & Asignaturas</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestiona tus cursos, profesores, aulas, syllabus y múltiples bloques de horarios.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#184a42] hover:bg-[#133c35] text-white font-semibold rounded-xl shadow-lg shadow-[#184a42]/20 transition flex items-center justify-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Materia</span>
        </button>
      </div>

      {/* Grid of Materia Cards */}
      {(!materias || materias.length === 0) ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
            No tienes materias registradas
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Crea tu primera materia para asociar tareas, exámenes y verla en el tablero de horarios.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            + Crear primera materia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map(m => {
            const avg = getSubjectAverage(m.id);
            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                {/* Visual Color Top Strip */}
                <div
                  className="h-3.5 w-full"
                  style={{ backgroundColor: m.color || '#6366f1' }}
                />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Header: Title & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => setSelectedMateria(m)}
                        className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition cursor-pointer"
                      >
                        {m.nombre}
                      </h3>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Teacher & Classroom */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {m.profesor && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{m.profesor}</span>
                        </div>
                      )}
                      {m.aula && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{m.aula}</span>
                        </div>
                      )}
                    </div>

                    {/* Schedule Slots Badges */}
                    <div className="mt-4">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Horarios</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.horarios && m.horarios.length > 0 ? (
                          m.horarios.map((h, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300"
                            >
                              <strong>{h.diaSemana}:</strong> {h.horaInicio} - {h.horaFin}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin horarios asignados</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer: Grade average & Syllabus button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    {avg ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Promedio:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          {avg} / 20
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Sin notas aún</span>
                    )}

                    <button
                      onClick={() => setSelectedMateria(m)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Detalles</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form for Create / Edit Materia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingId ? 'Editar Materia' : 'Nueva Materia'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Nombre de la materia *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Cálculo Multivariable"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Profesor & Aula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Profesor / Docente
                  </label>
                  <input
                    type="text"
                    value={profesor}
                    onChange={(e) => setProfesor(e.target.value)}
                    placeholder="ej. Dr. Roberto Gómez"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Aula / Salón / Laboratorio
                  </label>
                  <input
                    type="text"
                    value={aula}
                    onChange={(e) => setAula(e.target.value)}
                    placeholder="ej. Edificio B - Aula 204"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Color Identifier */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Color Identificador
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition flex items-center justify-center ${
                        color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent"
                    title="Color personalizado"
                  />
                </div>
              </div>

              {/* Horarios (Multiple Time Blocks) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Bloques de Horario de Clases
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHorarioSlot}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar horario</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {horarios.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <select
                        value={slot.diaSemana}
                        onChange={(e) => handleHorarioChange(index, 'diaSemana', e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-none"
                      >
                        {DIAS_SEMANA.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <input
                        type="time"
                        value={slot.horaInicio}
                        onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                        className="px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none"
                      />

                      <span className="text-xs text-slate-400">a</span>

                      <input
                        type="time"
                        value={slot.horaFin}
                        onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)}
                        className="px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none"
                      />

                      {horarios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHorarioSlot(index)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Notas Generales / Sílabo / Criterios de Evaluación
                </label>
                <textarea
                  rows={4}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Escribe aquí los temas principales, ponderaciones, enlaces a la bibliografía..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20"
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Materia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Detail View Modal */}
      {selectedMateria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div
              className="p-6 text-white relative"
              style={{ backgroundColor: selectedMateria.color || '#6366f1' }}
            >
              <button
                onClick={() => setSelectedMateria(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black">{selectedMateria.nombre}</h2>
              <p className="text-xs text-white/80 mt-1">
                Prof: {selectedMateria.profesor || 'No asignado'} • {selectedMateria.aula || 'Sin aula'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Horarios de Clase
                </h4>
                <div className="space-y-1">
                  {selectedMateria.horarios?.map((h, i) => (
                    <div key={i} className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      • {h.diaSemana}: {h.horaInicio} a {h.horaFin}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Notas de la Materia / Sílabo
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedMateria.notas || 'No se han ingresado notas adicionales para esta materia.'}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedMateria(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
