import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { AuthSwitch } from '../components/ui/auth-switch';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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

        <AuthSwitch
          language={language}
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
          error={error}
          success={success}
          translations={translations}
        />

        {/* Language Selection */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-3">{t('selectLanguage')}</p>
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

        {/* Footer */}
        <div className="mt-6 text-center">
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
