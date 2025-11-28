import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { AuthSwitch } from '../components/ui/auth-switch';
import { ThemeToggle } from '../components/ui/theme-toggle';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError(language === 'nl' ? 'Vul alle velden in' : language === 'pl' ? 'Wypełnij wszystkie pola' : 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error: any) {
      const errorMessage = error.message || (language === 'nl' ? 'Inloggen mislukt' : language === 'pl' ? 'Logowanie nie powiodło się' : 'Login failed');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError(language === 'nl' ? 'Vul alle velden in' : language === 'pl' ? 'Wypełnij wszystkie pola' : 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError(t('wachtwoordMinimaal6'));
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: 'medewerker',
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError(t('emailAlreadyExists'));
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            naam: name,
            email: email,
            role: 'medewerker',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        setSuccess(
          language === 'nl'
            ? 'Account succesvol aangemaakt! Je kunt nu inloggen.'
            : language === 'pl'
            ? 'Konto zostało pomyślnie utworzone! Możesz teraz się zalogować.'
            : 'Account created successfully! You can now log in.'
        );
      }
    } catch (err: any) {
      setError(err.message || t('foutOpgetreden'));
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    { code: 'nl' as const, name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'pl' as const, name: 'Polski', flag: '🇵🇱' },
  ];

  const translations = {
    login: t('login'),
    register: t('register'),
    email: t('emailAddress'),
    emailPlaceholder: t('emailPlaceholder'),
    password: t('password'),
    passwordPlaceholder: t('passwordPlaceholder'),
    choosePassword: t('choosePassword'),
    fullName: t('fullName'),
    fullNamePlaceholder: t('fullNamePlaceholder'),
    loggingIn: t('loggingIn'),
    registering: t('registering'),
    createAccount: t('createAccount'),
    forgotPassword: language === 'nl' ? 'Wachtwoord vergeten?' : language === 'pl' ? 'Zapomniałeś hasła?' : 'Forgot password?',
  };

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

      <div className="max-w-md w-full relative z-10">
        {/* Back to Home Link + Theme Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className={`inline-flex items-center space-x-2 transition-colors group ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>{language === 'nl' ? 'Terug naar Home' : language === 'pl' ? 'Powrót do strony głównej' : 'Back to Home'}</span>
          </Link>
          <ThemeToggle />
        </div>

        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {language === 'nl' ? 'Wachtwoord vergeten?' : language === 'pl' ? 'Zapomniałeś hasła?' : 'Forgot password?'}
              </h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'nl'
                  ? 'Neem contact op met een administrator om je wachtwoord te resetten.'
                  : language === 'pl'
                  ? 'Skontaktuj się z administratorem, aby zresetować hasło.'
                  : 'Contact an administrator to reset your password.'}
              </p>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-2.5 px-4 rounded-xl hover:from-red-700 hover:to-rose-700 transition-colors font-medium"
              >
                {language === 'nl' ? 'Sluiten' : language === 'pl' ? 'Zamknij' : 'Close'}
              </button>
            </div>
          </div>
        )}

        <AuthSwitch
          language={language}
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
          error={error}
          success={success}
          translations={translations}
        />

        {/* Demo Login Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={() => handleLogin('demouser@werkwise.nl', 'werkwise')}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2 ${
              isDark
                ? 'border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400'
                : 'border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Bezig met inloggen...</span>
              </span>
            ) : (
              'Login als Medewerker'
            )}
          </button>
          <button
            onClick={() => handleLogin('adminuser@werkwise.nl', 'demowerkwise')}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2 ${
              isDark
                ? 'border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400'
                : 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Bezig met inloggen...</span>
              </span>
            ) : (
              'Login als Admin'
            )}
          </button>
        </div>

        {/* Language Selection */}
        <div className="mt-8 text-center">
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('selectLanguage')}</p>
          <div className="flex justify-center space-x-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm transition-all ${
                  language === lang.code
                    ? isDark
                      ? 'bg-red-500/20 text-red-400 font-medium'
                      : 'bg-red-100 text-red-700 font-medium'
                    : isDark
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            © 2025 WerkWise. {t('allRightsReserved')}
          </p>
          <div className={`mt-2 text-xs ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
            <span>{t('version')} 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
