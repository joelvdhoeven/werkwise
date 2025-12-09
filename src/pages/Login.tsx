import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ui/theme-toggle';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState<'admin' | 'medewerker' | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async (type: 'admin' | 'medewerker') => {
    setError('');
    setIsLoading(type);

    try {
      if (type === 'admin') {
        await login('adminuser@werkwise.nl', 'demowerkwise');
      } else {
        await login('demouser@werkwise.nl', 'werkwise');
      }
    } catch (error: any) {
      const errorMessage = error.message || (language === 'nl' ? 'Inloggen mislukt' : language === 'pl' ? 'Logowanie nie powiodło się' : 'Login failed');
      setError(errorMessage);
    } finally {
      setIsLoading(null);
    }
  };

  const languages = [
    { code: 'nl' as const, name: 'NL', flag: '🇳🇱' },
    { code: 'en' as const, name: 'EN', flag: '🇬🇧' },
    { code: 'pl' as const, name: 'PL', flag: '🇵🇱' },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
      isDark
        ? 'bg-gray-950'
        : 'bg-gradient-to-br from-red-50 via-white to-rose-50'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-red-900/20' : 'bg-red-200/50'}`} />
        <div className={`absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-rose-900/20' : 'bg-rose-200/50'}`} />
        <div className={`absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl ${isDark ? 'bg-pink-900/10' : 'bg-pink-200/30'}`} />
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Branding */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="mb-6 flex items-center justify-center gap-4">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30"
            >
              <span className="text-white font-bold text-3xl">W</span>
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent mb-3">
            WerkWise
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'nl' ? 'Smart Workforce Management' : language === 'pl' ? 'Inteligentne zarządzanie pracownikami' : 'Smart Workforce Management'}
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`rounded-3xl shadow-2xl overflow-hidden ${
            isDark
              ? 'bg-gray-900/80 border border-gray-800 backdrop-blur-xl'
              : 'bg-white/80 border border-gray-100 backdrop-blur-xl shadow-gray-200/50'
          }`}
        >
          <div className="p-8">
            <h2 className={`text-xl font-semibold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'nl' ? 'Welkom terug!' : language === 'pl' ? 'Witaj ponownie!' : 'Welcome back!'}
            </h2>
            <p className={`text-sm text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {language === 'nl' ? 'Kies je account type om in te loggen' : language === 'pl' ? 'Wybierz typ konta, aby się zalogować' : 'Choose your account type to login'}
            </p>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl text-sm text-center ${isDark ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-100 text-red-600'}`}
              >
                {error}
              </motion.div>
            )}

            {/* Login Buttons */}
            <div className="space-y-4">
              {/* Admin Login */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLogin('admin')}
                disabled={isLoading !== null}
                className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                  isDark
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/30 hover:shadow-red-900/50'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading === 'admin' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{language === 'nl' ? 'Bezig met inloggen...' : language === 'pl' ? 'Logowanie...' : 'Logging in...'}</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>{language === 'nl' ? 'Login als Admin' : language === 'pl' ? 'Zaloguj jako Admin' : 'Login as Admin'}</span>
                  </>
                )}
              </motion.button>

              {/* Medewerker Login */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLogin('medewerker')}
                disabled={isLoading !== null}
                className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 border-2 ${
                  isDark
                    ? 'border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading === 'medewerker' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{language === 'nl' ? 'Bezig met inloggen...' : language === 'pl' ? 'Logowanie...' : 'Logging in...'}</span>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5" />
                    <span>{language === 'nl' ? 'Login als Medewerker' : language === 'pl' ? 'Zaloguj jako Pracownik' : 'Login as Employee'}</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Language Selection Footer */}
          <div className={`px-8 py-4 border-t ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex items-center justify-center gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    language === lang.code
                      ? isDark
                        ? 'bg-red-500/20 text-red-400 font-medium'
                        : 'bg-red-100 text-red-700 font-medium'
                      : isDark
                        ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            © 2025 WerkWise. {language === 'nl' ? 'Alle rechten voorbehouden.' : language === 'pl' ? 'Wszelkie prawa zastrzeżone.' : 'All rights reserved.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
