import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Mail,
  Globe,
  CheckCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';

const Onboarding: React.FC = () => {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const translations = {
    nl: {
      backToHome: 'Terug naar Home',
      title: 'Wordt klant bij WerkWise',
      subtitle: 'Vul je gegevens in en we nemen binnen 24 uur contact met je op.',
      step1Title: 'Je bedrijfsgegevens',
      step1Subtitle: 'Vertel ons over je bedrijf',
      companyName: 'Bedrijfsnaam',
      companyNamePlaceholder: 'Bijv. Bouwbedrijf De Vries',
      email: 'E-mailadres',
      emailPlaceholder: 'info@jouwbedrijf.nl',
      website: 'Huidige website',
      websiteOptional: '(optioneel)',
      websitePlaceholder: 'www.jouwbedrijf.nl',
      next: 'Volgende',
      submit: 'Aanvragen',
      submitting: 'Bezig met versturen...',
      successTitle: 'Aanvraag verzonden!',
      successMessage: 'We nemen zo snel mogelijk contact met je op.',
      backToHomepage: 'Terug naar homepage',
      requiredField: 'Dit veld is verplicht',
      invalidEmail: 'Voer een geldig e-mailadres in',
      features: [
        'Persoonlijke onboarding',
        'Gratis proefperiode',
        'Geen verplichtingen',
      ],
    },
    en: {
      backToHome: 'Back to Home',
      title: 'Become a WerkWise customer',
      subtitle: "Fill in your details and we'll contact you within 24 hours.",
      step1Title: 'Your company details',
      step1Subtitle: 'Tell us about your company',
      companyName: 'Company name',
      companyNamePlaceholder: 'E.g. Construction Co.',
      email: 'Email address',
      emailPlaceholder: 'info@yourcompany.com',
      website: 'Current website',
      websiteOptional: '(optional)',
      websitePlaceholder: 'www.yourcompany.com',
      next: 'Next',
      submit: 'Submit',
      submitting: 'Submitting...',
      successTitle: 'Request submitted!',
      successMessage: "We'll contact you as soon as possible.",
      backToHomepage: 'Back to homepage',
      requiredField: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      features: [
        'Personal onboarding',
        'Free trial period',
        'No obligations',
      ],
    },
    pl: {
      backToHome: 'Powrót do strony głównej',
      title: 'Zostań klientem WerkWise',
      subtitle: 'Wypełnij dane, a skontaktujemy się w ciągu 24 godzin.',
      step1Title: 'Dane Twojej firmy',
      step1Subtitle: 'Opowiedz nam o swojej firmie',
      companyName: 'Nazwa firmy',
      companyNamePlaceholder: 'Np. Firma Budowlana',
      email: 'Adres e-mail',
      emailPlaceholder: 'info@twojafirma.pl',
      website: 'Obecna strona internetowa',
      websiteOptional: '(opcjonalnie)',
      websitePlaceholder: 'www.twojafirma.pl',
      next: 'Dalej',
      submit: 'Wyślij',
      submitting: 'Wysyłanie...',
      successTitle: 'Zapytanie wysłane!',
      successMessage: 'Skontaktujemy się tak szybko, jak to możliwe.',
      backToHomepage: 'Powrót do strony głównej',
      requiredField: 'To pole jest wymagane',
      invalidEmail: 'Wprowadź prawidłowy adres e-mail',
      features: [
        'Osobiste wdrożenie',
        'Bezpłatny okres próbny',
        'Bez zobowiązań',
      ],
    },
  };

  const t = translations[language] || translations.nl;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = t.requiredField;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.requiredField;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{t.backToHome}</span>
          </Link>

          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              WerkWise
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Side - Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              >
                <Sparkles className="h-4 w-4" />
                {language === 'nl'
                  ? 'Gratis proefperiode'
                  : language === 'pl'
                  ? 'Bezpłatny okres próbny'
                  : 'Free trial period'}
              </motion.div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {t.title}
              </h1>

              <p className="text-xl text-gray-600 mb-10">{t.subtitle}</p>

              {/* Features List */}
              <div className="space-y-4">
                {t.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 pt-8 border-t border-gray-200"
              >
                <p className="text-sm text-gray-500 mb-4">
                  {language === 'nl'
                    ? 'Vertrouwd door 100+ bedrijven'
                    : language === 'pl'
                    ? 'Zaufało nam ponad 100 firm'
                    : 'Trusted by 100+ companies'}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-16 h-8 bg-gray-200 rounded-lg"
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100 relative overflow-hidden"
                  >
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-70" />

                    <div className="relative z-10">
                      {/* Form Header */}
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                          <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {t.step1Title}
                        </h2>
                        <p className="text-gray-500">{t.step1Subtitle}</p>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t.companyName}
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.companyName}
                              onChange={(e) => {
                                setFormData({ ...formData, companyName: e.target.value });
                                if (errors.companyName) setErrors({ ...errors, companyName: '' });
                              }}
                              placeholder={t.companyNamePlaceholder}
                              className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 ${
                                errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                              }`}
                            />
                          </div>
                          {errors.companyName && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-500"
                            >
                              {errors.companyName}
                            </motion.p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t.email}
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: '' });
                              }}
                              placeholder={t.emailPlaceholder}
                              className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 ${
                                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                              }`}
                            />
                          </div>
                          {errors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-500"
                            >
                              {errors.email}
                            </motion.p>
                          )}
                        </div>

                        {/* Website */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t.website}{' '}
                            <span className="font-normal text-gray-400">
                              {t.websiteOptional}
                            </span>
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.website}
                              onChange={(e) =>
                                setFormData({ ...formData, website: e.target.value })
                              }
                              placeholder={t.websitePlaceholder}
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          size="lg"
                          className="w-full gap-2 h-14 text-lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              {t.submitting}
                            </>
                          ) : (
                            <>
                              {t.submit}
                              <ArrowRight className="h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </form>

                      {/* Privacy Note */}
                      <p className="text-center text-xs text-gray-400 mt-6">
                        {language === 'nl'
                          ? 'Door te versturen ga je akkoord met onze voorwaarden.'
                          : language === 'pl'
                          ? 'Wysyłając, zgadzasz się z naszymi warunkami.'
                          : 'By submitting, you agree to our terms.'}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200"
                    >
                      <CheckCircle className="h-10 w-10 text-white" />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {t.successTitle}
                    </h2>
                    <p className="text-gray-600 mb-8">{t.successMessage}</p>

                    <Link to="/">
                      <Button variant="outline" size="lg" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t.backToHomepage}
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-8 px-4">
        <p className="text-xs text-gray-400">
          © 2025 WerkWise. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
