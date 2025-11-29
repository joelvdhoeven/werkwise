import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { registerLocale } from 'react-datepicker';
import { nl } from 'date-fns/locale';
import { Capacitor } from '@capacitor/core';
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

// Check if running as a native mobile app
const isNativeApp = Capacitor.isNativePlatform();

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
                  {/* On native mobile app, redirect root to /demo */}
                  <Route path="/" element={isNativeApp ? <Navigate to="/demo" replace /> : <LandingPage />} />
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
                  <Route path="*" element={isNativeApp ? <Navigate to="/demo" replace /> : <NotFound />} />
                </Routes>
              </TimerProvider>
            </SystemSettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
