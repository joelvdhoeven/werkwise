import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { registerLocale } from 'react-datepicker';
import { nl } from 'date-fns/locale';
import App from './App.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Onboarding from './pages/Onboarding.tsx';
import AgentApp from './pages/AgentApp.tsx';
import NotFound from './pages/NotFound.tsx';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { AgentAuthProvider } from './contexts/AgentAuthContext';
import { SystemSettingsProvider } from './contexts/SystemSettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TimerProvider } from './contexts/TimerContext';
import './index.css';

// Register Dutch locale for DatePicker
registerLocale('nl', nl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SystemSettingsProvider>
              <TimerProvider>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/agent" element={
                    <AgentAuthProvider>
                      <AgentApp />
                    </AgentAuthProvider>
                  } />
                  <Route path="/agent/*" element={
                    <AgentAuthProvider>
                      <AgentApp />
                    </AgentAuthProvider>
                  } />
                  <Route path="/demo/*" element={<App />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TimerProvider>
            </SystemSettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
