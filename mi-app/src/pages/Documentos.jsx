import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Folder,
  ExternalLink,
  Plus,
  Trash2,
  File,
  FileText,
  Upload,
  BookOpen,
  X,
  HardDrive
} from 'lucide-react';
import { db } from '../db/db';

const MAX_FILE_SIZE_MB = 3; // IndexedDB safety limit

export function Documentos() {
  const materias = useLiveQuery(() => db.materias.toArray(), []);
  const documentos = useLiveQuery(() => db.documentos.toArray(), []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docType, setDocType] = useState('drive'); // 'drive' | 'local'
  const [materiaId, setMateriaId] = useState('');
  const [nombre, setNombre] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const openAddModal = (mId = '') => {
    setMateriaId(mId || (materias && materias.length > 0 ? materias[0].id : ''));
    setNombre('');
    setDriveUrl('');
    setFileData(null);
    setFileName('');
    setFileSizeStr('');
    setErrorMsg('');
    setDocType('drive');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`El archivo supera el límite recomendado de ${MAX_FILE_SIZE_MB}MB para almacenamiento local IndexedDB.`);
      return;
    }

    setErrorMsg('');
    setFileName(file.name);
    setFileSizeStr((file.size / 1024 / 1024).toFixed(2) + ' MB');

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileData(event.target.result); // Base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (docType === 'drive' && !driveUrl.trim()) return;
    if (docType === 'local' && !fileData) {
      setErrorMsg('Por favor selecciona un archivo local.');
      return;
    }

    await db.documentos.add({
      materiaId: materiaId ? Number(materiaId) : null,
      nombre: nombre.trim(),
      tipo: docType,
      url: docType === 'drive' ? driveUrl.trim() : null,
      fileData: docType === 'local' ? fileData : null,
      fileName: docType === 'local' ? fileName : null,
      fileSize: docType === 'local' ? fileSizeStr : null,
      fecha: new Date().toISOString()
    });

    setIsModalOpen(false);
  };

  const deleteDoc = async (id) => {
    if (window.confirm('¿Eliminar este documento?')) {
      await db.documentos.delete(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Folder className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Documentos & Enlaces Drive</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organiza tus carpetas de Google Drive por materia y adjunta archivos locales ligeros.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="px-4 py-2.5 bg-[#184a42] hover:bg-[#133c35] text-white font-semibold rounded-xl shadow-lg shadow-[#184a42]/20 transition flex items-center justify-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Enlace / Adjunto</span>
        </button>
      </div>

      {/* Subject-Wise Document Collections */}
      {(!documentos || documentos.length === 0) ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Folder className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
            No tienes documentos ni enlaces guardados
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Guarda aquí las carpetas de Google Drive o PDF de sílabos para tenerlos a un solo clic.
          </p>
          <button
            onClick={() => openAddModal()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            + Guardar primer recurso
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias?.map(m => {
            const materiaDocs = documentos.filter(d => d.materiaId === m.id);
            if (materiaDocs.length === 0) return null;

            return (
              <div key={m.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color || '#6366f1' }} />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {m.nombre}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {materiaDocs.length} {materiaDocs.length === 1 ? 'recurso' : 'recursos'}
                  </span>
                </div>

                <div className="space-y-2">
                  {materiaDocs.map(doc => (
                    <div key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 group">
                      <div className="flex items-center gap-2.5 truncate">
                        {doc.tipo === 'drive' ? (
                          <Folder className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <HardDrive className="w-4 h-4 text-indigo-500 shrink-0" />
                        )}
                        <div className="truncate">
                          <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {doc.nombre}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {doc.tipo === 'drive' ? 'Google Drive Link' : `Archivo Local (${doc.fileSize})`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {doc.tipo === 'drive' ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition"
                            title="Abrir en Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <a
                            href={doc.fileData}
                            download={doc.fileName || doc.nombre}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition text-xs font-bold"
                            title="Descargar archivo"
                          >
                            Descargar
                          </a>
                        )}
                        <button
                          onClick={() => deleteDoc(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600" />
                <span>Añadir Documento o Enlace</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDocType('drive')}
                  className={`py-2 rounded-lg transition ${docType === 'drive' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Enlace Google Drive
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('local')}
                  className={`py-2 rounded-lg transition ${docType === 'local' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Archivo Local (&lt;3MB)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Materia *</label>
                <select
                  required
                  value={materiaId}
                  onChange={(e) => setMateriaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                >
                  <option value="">Seleccionar materia...</option>
                  {materias?.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre del recurso / título *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Carpeta de Libros Digitales"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {docType === 'drive' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">URL de Google Drive *</label>
                  <input
                    type="url"
                    required
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Seleccionar archivo local</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {fileName && (
                    <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                      ✓ Seleccionado: {fileName} ({fileSizeStr})
                    </p>
                  )}
                  {errorMsg && (
                    <p className="mt-1 text-[11px] text-red-500 font-semibold">{errorMsg}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">Guardar Recurso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
