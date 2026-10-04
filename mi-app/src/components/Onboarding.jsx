import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { db } from '../db/db';
import { JamiLogo } from './JamiLogo';

export function Onboarding({ onComplete }) {
  const [name, setName] = useState('');
  const save = async (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    await db.configuracion.bulkPut([{ key: 'userName', value: cleanName }, { key: 'onboardingComplete', value: true }]);
    onComplete();
  };
  return <div className="min-h-screen bg-[#f8faf8] dark:bg-[#0e1816] p-5 flex items-center justify-center"><div className="w-full max-w-md jami-card p-7 sm:p-9 shadow-xl shadow-[#184a42]/10 animate-fade-in"><JamiLogo className="w-10 h-10" textSize="text-3xl" /><div className="mt-9 space-y-3"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#ebf8f2] px-3 py-1 text-xs font-bold text-[#1b7a4e] dark:bg-[#18372f] dark:text-[#8ee6bd]"><Sparkles className="w-3.5 h-3.5" /> Empieza a tu ritmo</span><h1 className="text-3xl font-black tracking-tight text-[#163a34] dark:text-[#e4eee9]">¿Cómo te llamas?</h1><p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">Usaremos tu nombre para hacer este espacio un poco más tuyo. Todo se guarda solo en este dispositivo.</p></div><form onSubmit={save} className="mt-7 space-y-4"><label className="block text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="onboarding-name">Tu nombre</label><input id="onboarding-name" autoFocus required maxLength="40" value={name} onChange={(event) => setName(event.target.value)} placeholder="Escribe tu nombre" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#184a42] focus:ring-4 focus:ring-[#184a42]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" /><button type="submit" className="jami-btn-primary w-full rounded-2xl px-4 py-3.5 text-sm font-extrabold flex items-center justify-center gap-2">Continuar <ArrowRight className="w-4 h-4" /></button></form></div></div>;
}
