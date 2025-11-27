import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { registerLocale } from 'react-datepicker';
import { nl } from 'date-fns/locale';
import App from './App.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Onboarding from './pages/Onboarding.tsx';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { SystemSettingsProvider } from './contexts/SystemSettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/demo/*" element={<App />} />
              </Routes>
            </SystemSettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
