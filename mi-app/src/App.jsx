import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { initSeedData } from './db/db';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { TimerProvider } from './context/TimerContext';
import { StreakProvider } from './context/StreakContext';
import { Navigation } from './components/Navigation';

import { Dashboard } from './pages/Dashboard';
import { Materias } from './pages/Materias';
import { Tareas } from './pages/Tareas';
import { Horario } from './pages/Horario';
import { Concentracion } from './pages/Concentracion';
import { Estadisticas } from './pages/Estadisticas';
import { Documentos } from './pages/Documentos';
import { Ajustes } from './pages/Ajustes';

export function App() {
  useEffect(() => {
    initSeedData().catch(console.error);
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <TimerProvider>
          <StreakProvider>
            <BrowserRouter>
              <Navigation>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/materias" element={<Materias />} />
                  <Route path="/tareas" element={<Tareas />} />
                  <Route path="/horario" element={<Horario />} />
                  <Route path="/concentracion" element={<Concentracion />} />
                  <Route path="/estadisticas" element={<Estadisticas />} />
                  <Route path="/documentos" element={<Documentos />} />
                  <Route path="/ajustes" element={<Ajustes />} />
                </Routes>
              </Navigation>
            </BrowserRouter>
          </StreakProvider>
        </TimerProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
