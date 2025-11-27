import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, CheckCircle, Clock, Users, BarChart3, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const LandingPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
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
      // Create account with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
            role: 'medewerker', // Default role for self-registration
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
        // Create profile in database
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
            ? 'Account succesvol aangemaakt! Je kunt nu inloggen in de demo.'
            : language === 'pl'
            ? 'Konto zostało pomyślnie utworzone! Możesz teraz zalogować się do demo.'
            : 'Account created successfully! You can now log in to the demo.'
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
      title: language === 'nl' ? 'Urenregistratie' : language === 'pl' ? 'Rejestracja godzin' : 'Time Registration',
      description: language === 'nl'
        ? 'Registreer eenvoudig je werkuren per project'
        : language === 'pl'
        ? 'Łatwo rejestruj godziny pracy dla każdego projektu'
        : 'Easily register your work hours per project',
    },
    {
      icon: Users,
      title: language === 'nl' ? 'Team Management' : language === 'pl' ? 'Zarządzanie zespołem' : 'Team Management',
      description: language === 'nl'
        ? 'Beheer je team en projecten op één plek'
        : language === 'pl'
        ? 'Zarządzaj zespołem i projektami w jednym miejscu'
        : 'Manage your team and projects in one place',
    },
    {
      icon: BarChart3,
      title: language === 'nl' ? 'Rapportages' : language === 'pl' ? 'Raporty' : 'Reports',
      description: language === 'nl'
        ? 'Inzicht in uren, kosten en projectvoortgang'
        : language === 'pl'
        ? 'Wgląd w godziny, koszty i postępy projektu'
        : 'Insights into hours, costs and project progress',
    },
  ];

  const benefits = [
    language === 'nl' ? 'Eenvoudige urenregistratie' : language === 'pl' ? 'Prosta rejestracja godzin' : 'Simple time registration',
    language === 'nl' ? 'Projectbeheer' : language === 'pl' ? 'Zarządzanie projektami' : 'Project management',
    language === 'nl' ? 'Magazijnbeheer' : language === 'pl' ? 'Zarządzanie magazynem' : 'Warehouse management',
    language === 'nl' ? 'Schademeldingen' : language === 'pl' ? 'Zgłoszenia szkód' : 'Damage reports',
    language === 'nl' ? 'Team overzichten' : language === 'pl' ? 'Przeglądy zespołu' : 'Team overviews',
    language === 'nl' ? 'Meertalige ondersteuning' : language === 'pl' ? 'Wsparcie wielojęzyczne' : 'Multi-language support',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/image copy copy.png" alt="GouweBouw" className="h-10" />
              <span className="text-xl font-bold text-gray-800">WerkWise</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language selector */}
              <div className="flex space-x-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1 rounded text-sm transition-colors ${
                      language === lang.code
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {lang.flag}
                  </button>
                ))}
              </div>
              <Link
                to="/demo"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <span>{language === 'nl' ? 'Naar Demo' : language === 'pl' ? 'Do Demo' : 'Go to Demo'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {language === 'nl'
                  ? 'Urenregistratie & Projectbeheer'
                  : language === 'pl'
                  ? 'Rejestracja godzin i zarządzanie projektami'
                  : 'Time Registration & Project Management'}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {language === 'nl'
                  ? 'De complete oplossing voor bouwbedrijven. Registreer uren, beheer projecten en houd voorraad bij - allemaal in één platform.'
                  : language === 'pl'
                  ? 'Kompletne rozwiązanie dla firm budowlanych. Rejestruj godziny, zarządzaj projektami i śledź zapasy - wszystko na jednej platformie.'
                  : 'The complete solution for construction companies. Register hours, manage projects and track inventory - all in one platform.'}
              </p>

              {/* Benefits list */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/demo"
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
              >
                <span>{language === 'nl' ? 'Bekijk de Demo' : language === 'pl' ? 'Zobacz Demo' : 'View the Demo'}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Right: Register form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {t('createAccount')}
                </h2>
                <p className="text-gray-600">
                  {language === 'nl'
                    ? 'Maak een gratis account aan om de demo te testen'
                    : language === 'pl'
                    ? 'Utwórz darmowe konto, aby przetestować demo'
                    : 'Create a free account to test the demo'}
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fullName')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={t('fullNamePlaceholder')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('emailAddress')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('emailPlaceholder')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={t('choosePassword')}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                  <Link to="/demo" className="text-red-600 hover:text-red-700 font-medium">
                    {t('login')}
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'nl'
                ? 'Alles wat je nodig hebt'
                : language === 'pl'
                ? 'Wszystko, czego potrzebujesz'
                : 'Everything you need'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'nl'
                ? 'Eén platform voor al je bedrijfsprocessen'
                : language === 'pl'
                ? 'Jedna platforma dla wszystkich procesów biznesowych'
                : 'One platform for all your business processes'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {language === 'nl'
              ? 'Klaar om te beginnen?'
              : language === 'pl'
              ? 'Gotowy, aby zacząć?'
              : 'Ready to get started?'}
          </h2>
          <p className="text-xl text-red-100 mb-8">
            {language === 'nl'
              ? 'Probeer de demo en ontdek hoe WerkWise je bedrijf kan helpen.'
              : language === 'pl'
              ? 'Wypróbuj demo i odkryj, jak WerkWise może pomóc Twojej firmie.'
              : 'Try the demo and discover how WerkWise can help your business.'}
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center space-x-2 bg-white text-red-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold"
          >
            <span>{language === 'nl' ? 'Start de Demo' : language === 'pl' ? 'Uruchom Demo' : 'Start the Demo'}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src="/image copy copy.png" alt="GouweBouw" className="h-8 brightness-0 invert" />
              <span className="text-lg font-bold">WerkWise</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 GouweBouw. {t('allRightsReserved')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
