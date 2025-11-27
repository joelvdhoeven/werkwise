import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, User, CheckCircle, Clock, Users,
  BarChart3, ArrowRight, Check, Briefcase, Shield, Zap,
  Building2, ClipboardList, Package
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const LandingPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const languages = [
    { code: 'nl' as const, name: 'NL', flag: '🇳🇱' },
    { code: 'en' as const, name: 'EN', flag: '🇬🇧' },
    { code: 'pl' as const, name: 'PL', flag: '🇵🇱' },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError(language === 'nl' ? 'Vul alle velden in' : language === 'pl' ? 'Wypełnij wszystkie pola' : 'Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError(t('wachtwoordMinimaal6'));
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
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
            naam: formData.fullName,
            email: formData.email,
            role: 'medewerker',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        setSuccess(
          language === 'nl'
            ? 'Account succesvol aangemaakt! Je kunt nu inloggen.'
            : language === 'pl'
            ? 'Konto zostało pomyślnie utworzone! Możesz teraz zalogować się.'
            : 'Account created successfully! You can now log in.'
        );
        setFormData({ fullName: '', email: '', password: '' });
      }
    } catch (err: any) {
      setError(err.message || t('foutOpgetreden'));
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Clock,
      title: language === 'nl' ? 'Urenregistratie' : language === 'pl' ? 'Rejestracja godzin' : 'Time Tracking',
      description: language === 'nl'
        ? 'Registreer werkuren per project met één klik. Overzichtelijk en efficiënt.'
        : language === 'pl'
        ? 'Rejestruj godziny pracy jednym kliknięciem. Przejrzyście i wydajnie.'
        : 'Track work hours per project with one click. Clear and efficient.',
    },
    {
      icon: Building2,
      title: language === 'nl' ? 'Projectbeheer' : language === 'pl' ? 'Zarządzanie projektami' : 'Project Management',
      description: language === 'nl'
        ? 'Beheer al je projecten op één centrale plek met real-time voortgang.'
        : language === 'pl'
        ? 'Zarządzaj wszystkimi projektami w jednym miejscu z postępem w czasie rzeczywistym.'
        : 'Manage all projects in one central place with real-time progress.',
    },
    {
      icon: Users,
      title: language === 'nl' ? 'Teambeheer' : language === 'pl' ? 'Zarządzanie zespołem' : 'Team Management',
      description: language === 'nl'
        ? 'Houd overzicht over je team, rollen en productiviteit.'
        : language === 'pl'
        ? 'Miej przegląd swojego zespołu, ról i produktywności.'
        : 'Keep overview of your team, roles and productivity.',
    },
    {
      icon: Package,
      title: language === 'nl' ? 'Voorraadbeheer' : language === 'pl' ? 'Zarządzanie zapasami' : 'Inventory Management',
      description: language === 'nl'
        ? 'Beheer voorraad en materialen met automatische meldingen.'
        : language === 'pl'
        ? 'Zarządzaj zapasami i materiałami z automatycznymi powiadomieniami.'
        : 'Manage inventory and materials with automatic notifications.',
    },
    {
      icon: BarChart3,
      title: language === 'nl' ? 'Rapportages' : language === 'pl' ? 'Raporty' : 'Reports & Analytics',
      description: language === 'nl'
        ? 'Gedetailleerde rapporten en inzichten voor betere beslissingen.'
        : language === 'pl'
        ? 'Szczegółowe raporty i wglądy dla lepszych decyzji.'
        : 'Detailed reports and insights for better decisions.',
    },
    {
      icon: Shield,
      title: language === 'nl' ? 'Veilig & Betrouwbaar' : language === 'pl' ? 'Bezpieczne i niezawodne' : 'Secure & Reliable',
      description: language === 'nl'
        ? 'Enterprise-grade beveiliging voor al je bedrijfsdata.'
        : language === 'pl'
        ? 'Bezpieczeństwo klasy korporacyjnej dla wszystkich danych firmowych.'
        : 'Enterprise-grade security for all your business data.',
    },
  ];

  const stats = [
    { value: '10K+', label: language === 'nl' ? 'Geregistreerde uren' : language === 'pl' ? 'Zarejestrowane godziny' : 'Hours tracked' },
    { value: '500+', label: language === 'nl' ? 'Projecten' : language === 'pl' ? 'Projekty' : 'Projects' },
    { value: '99.9%', label: language === 'nl' ? 'Uptime' : language === 'pl' ? 'Dostępność' : 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                WerkWise
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      language === lang.code
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
              <Link
                to="/demo"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm flex items-center space-x-2 shadow-lg shadow-indigo-200"
              >
                <span>{language === 'nl' ? 'Naar App' : language === 'pl' ? 'Do aplikacji' : 'Go to App'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                <span>{language === 'nl' ? 'Slim werken, beter presteren' : language === 'pl' ? 'Pracuj mądrze, osiągaj więcej' : 'Work smart, perform better'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {language === 'nl' ? (
                  <>Alles voor je <span className="text-indigo-600">workforce</span> in één platform</>
                ) : language === 'pl' ? (
                  <>Wszystko dla Twojej <span className="text-indigo-600">firmy</span> na jednej platformie</>
                ) : (
                  <>Everything for your <span className="text-indigo-600">workforce</span> in one platform</>
                )}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {language === 'nl'
                  ? 'WerkWise is de complete oplossing voor urenregistratie, projectbeheer en voorraadbeheer. Speciaal ontwikkeld voor de bouw- en installatiebranche.'
                  : language === 'pl'
                  ? 'WerkWise to kompletne rozwiązanie do rejestracji godzin, zarządzania projektami i zapasami. Specjalnie zaprojektowane dla branży budowlanej i instalacyjnej.'
                  : 'WerkWise is the complete solution for time tracking, project management and inventory control. Specially designed for construction and installation companies.'}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-10">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-indigo-600">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center space-x-2 bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all text-lg font-semibold shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-0.5"
                >
                  <span>{language === 'nl' ? 'Start Demo' : language === 'pl' ? 'Rozpocznij Demo' : 'Start Demo'}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-200 transition-all text-lg font-semibold"
                >
                  <span>{language === 'nl' ? 'Meer informatie' : language === 'pl' ? 'Więcej informacji' : 'Learn more'}</span>
                </a>
              </div>
            </div>

            {/* Right: Register Form */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 p-8 max-w-md mx-auto lg:ml-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('createAccount')}
                  </h2>
                  <p className="text-gray-600">
                    {language === 'nl'
                      ? 'Maak een gratis account aan'
                      : language === 'pl'
                      ? 'Utwórz darmowe konto'
                      : 'Create a free account'}
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fullName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder={t('fullNamePlaceholder')}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('emailAddress')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('emailPlaceholder')}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={t('choosePassword')}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg shadow-indigo-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{t('registering')}</span>
                      </div>
                    ) : (
                      t('createAccount')
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    {language === 'nl'
                      ? 'Al een account?'
                      : language === 'pl'
                      ? 'Masz już konto?'
                      : 'Already have an account?'}{' '}
                    <Link to="/demo" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                      {t('login')}
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {language === 'nl'
                ? 'Alles wat je nodig hebt'
                : language === 'pl'
                ? 'Wszystko, czego potrzebujesz'
                : 'Everything you need'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'nl'
                ? 'Eén platform voor al je bedrijfsprocessen, van urenregistratie tot voorraadbeheer.'
                : language === 'pl'
                ? 'Jedna platforma dla wszystkich procesów biznesowych, od rejestracji godzin po zarządzanie zapasami.'
                : 'One platform for all your business processes, from time tracking to inventory management.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                  <feature.icon className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {language === 'nl'
              ? 'Klaar om efficiënter te werken?'
              : language === 'pl'
              ? 'Gotowy do wydajniejszej pracy?'
              : 'Ready to work more efficiently?'}
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            {language === 'nl'
              ? 'Probeer WerkWise vandaag nog en ontdek hoe je bedrijf kan profiteren van slimmer werken.'
              : language === 'pl'
              ? 'Wypróbuj WerkWise już dziś i odkryj, jak Twoja firma może skorzystać z mądrzejszej pracy.'
              : 'Try WerkWise today and discover how your business can benefit from smarter working.'}
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-10 py-4 rounded-xl hover:bg-gray-100 transition-all text-lg font-bold shadow-2xl hover:-translate-y-0.5"
          >
            <span>{language === 'nl' ? 'Start Nu Gratis' : language === 'pl' ? 'Zacznij za darmo' : 'Start Free Now'}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">WerkWise</span>
            </div>
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                {language === 'nl' ? 'Features' : language === 'pl' ? 'Funkcje' : 'Features'}
              </a>
              <Link to="/demo" className="text-gray-400 hover:text-white transition-colors">
                Demo
              </Link>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 WerkWise. {t('allRightsReserved')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
