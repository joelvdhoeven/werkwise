import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, CheckCircle, ArrowLeft, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !password) {
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
            name: fullName,
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
            naam: fullName,
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
        setFullName('');
        setEmail('');
        setPassword('');
        setTimeout(() => {
          setIsRegisterMode(false);
          setSuccess('');
        }, 2000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>{language === 'nl' ? 'Terug naar Home' : language === 'pl' ? 'Powrót do strony głównej' : 'Back to Home'}</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent mb-2">
            WerkWise
          </h1>
          <p className="text-gray-600">
            {isRegisterMode
              ? (language === 'nl' ? 'Maak een account aan' : language === 'pl' ? 'Utwórz konto' : 'Create an account')
              : (language === 'nl' ? 'Log in om door te gaan' : language === 'pl' ? 'Zaloguj się, aby kontynuować' : 'Log in to continue')}
          </p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200 border border-gray-100 p-8">
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {language === 'nl' ? 'Wachtwoord vergeten?' : language === 'pl' ? 'Zapomniałeś hasła?' : 'Forgot password?'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'nl'
                    ? 'Neem contact op met een administrator om je wachtwoord te resetten.'
                    : language === 'pl'
                    ? 'Skontaktuj się z administratorem, aby zresetować hasło.'
                    : 'Contact an administrator to reset your password.'}
                </p>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  {language === 'nl' ? 'Sluiten' : language === 'pl' ? 'Zamknij' : 'Close'}
                </button>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setIsRegisterMode(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                !isRegisterMode
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => { setIsRegisterMode(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                isRegisterMode
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('register')}
            </button>
          </div>

          <form onSubmit={isRegisterMode ? handleRegister : handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Full Name (only in register mode) */}
            {isRegisterMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fullName')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegisterMode ? t('choosePassword') : t('passwordPlaceholder')}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-indigo-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{isRegisterMode ? t('registering') : t('loggingIn')}</span>
                </div>
              ) : (
                isRegisterMode ? t('createAccount') : t('login')
              )}
            </button>

            {!isRegisterMode && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {language === 'nl' ? 'Wachtwoord vergeten?' : language === 'pl' ? 'Zapomniałeś hasła?' : 'Forgot password?'}
                </button>
              </div>
            )}
          </form>

          {/* Language Selection */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center mb-3">{t('selectLanguage')}</p>
            <div className="flex justify-center space-x-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm transition-all ${
                    language === lang.code
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 WerkWise. {t('allRightsReserved')}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            <span>{t('version')} 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
