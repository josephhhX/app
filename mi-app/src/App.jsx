import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { db, initDefaultConfig } from './db/db';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { TimerProvider } from './context/TimerContext';
import { StreakProvider } from './context/StreakContext';
import { Navigation } from './components/Navigation';
import { Onboarding } from './components/Onboarding';

import { Dashboard } from './pages/Dashboard';
import { Materias } from './pages/Materias';
import { Tareas } from './pages/Tareas';
import { Horario } from './pages/Horario';
import { Concentracion } from './pages/Concentracion';
import { NotasRapidas } from './pages/NotasRapidas';
import { Mas } from './pages/Mas';
import { Ajustes } from './pages/Ajustes';
import { Estadisticas } from './pages/Estadisticas';
import { Documentos } from './pages/Documentos';

export function App() {
  const [needsOnboarding, setNeedsOnboarding] = useState(null);

  useEffect(() => {
    const prepareApp = async () => {
      await initDefaultConfig();
      const user = await db.configuracion.get('userName');
      const onboarding = await db.configuracion.get('onboardingComplete');
      setNeedsOnboarding(!onboarding?.value || !user?.value?.trim());
    };
    prepareApp().catch(console.error);
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <TimerProvider>
          <StreakProvider>
            <BrowserRouter>
              {needsOnboarding === null ? null : needsOnboarding ? (
                <Onboarding onComplete={() => setNeedsOnboarding(false)} />
              ) : <Navigation>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/horario" element={<Horario />} />
                  <Route path="/tareas" element={<Tareas />} />
                  <Route path="/sesiones" element={<Concentracion />} />
                  <Route path="/concentracion" element={<Concentracion />} />
                  <Route path="/notas" element={<NotasRapidas />} />
                  <Route path="/mas" element={<Mas />} />
                  <Route path="/ajustes" element={<Ajustes />} />
                  <Route path="/materias" element={<Materias />} />
                  <Route path="/documentos" element={<Documentos />} />
                  <Route path="/estadisticas" element={<Estadisticas />} />
                </Routes>
              </Navigation>}
            </BrowserRouter>
          </StreakProvider>
        </TimerProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
