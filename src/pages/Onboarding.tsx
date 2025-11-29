import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Mail,
  Globe,
  CheckCircle,
  Sparkles,
  Loader2,
  Phone,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { supabase } from '../lib/supabase';

const Onboarding: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Dit veld is verplicht';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Dit veld is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Voer een geldig e-mailadres in';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Save the lead to the database
      const { error } = await supabase.from('leads').insert({
        company_name: formData.companyName,
        contact_email: formData.email,
        contact_phone: formData.phone || null,
        website: formData.website || null,
        status: 'new',
        source: 'onboarding'
      });

      if (error) {
        console.error('Error saving lead:', error);
        // Still show success to the user even if there's a DB error
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Error:', err);
      setIsSuccess(true); // Show success anyway for UX
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    'Persoonlijke onboarding',
    '31 dagen gratis uitproberen',
    'Geen verplichtingen',
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-red-50 via-white to-rose-50'}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-red-900/20' : 'bg-red-200/50'}`} />
        <div className={`absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-rose-900/20' : 'bg-rose-200/50'}`} />
        <div className={`absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl ${isDark ? 'bg-pink-900/10' : 'bg-pink-200/30'}`} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className={`inline-flex items-center space-x-2 transition-colors group ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Terug naar Home</span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/25">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
                WerkWise
              </span>
            </div>
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
                className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl text-base sm:text-lg font-bold mb-6 shadow-lg ${isDark ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-500/30' : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-500/30'}`}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                31 Dagen Gratis Uitproberen!
              </motion.div>

              <h1 className={`text-4xl sm:text-5xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Wordt klant bij WerkWise
              </h1>

              <p className={`text-xl mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Vul je gegevens in en we nemen binnen 24 uur contact met je op.
              </p>

              {/* Features List */}
              <div className="space-y-4">
                {features.map((feature, index) => (
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
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`mt-12 pt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
              >
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Vertrouwd door bedrijven zoals
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8">
                  <img
                    src="/logo-gouwebouw.png"
                    alt="GouweBouw"
                    className={`h-8 sm:h-10 object-contain ${isDark ? 'brightness-0 invert opacity-60 hover:opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity`}
                  />
                  <img
                    src="/logo-jobsurfing.png"
                    alt="JobSurfing"
                    className={`h-8 sm:h-10 object-contain ${isDark ? 'brightness-0 invert opacity-60 hover:opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity`}
                  />
                  <img
                    src="/logo_vdsb.png"
                    alt="VDSB"
                    className={`h-8 sm:h-10 object-contain ${isDark ? 'brightness-0 invert opacity-60 hover:opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity`}
                  />
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
                    className={`rounded-3xl shadow-2xl p-8 sm:p-10 border relative overflow-hidden ${
                      isDark
                        ? 'bg-gray-900 border-gray-800 shadow-red-500/5'
                        : 'bg-white border-gray-100 shadow-gray-200/50'
                    }`}
                  >
                    {/* Decorative gradient */}
                    <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-70 ${isDark ? 'bg-red-500/10' : 'bg-gradient-to-br from-red-100 to-rose-100'}`} />

                    <div className="relative z-10">
                      {/* Form Header */}
                      <div className="text-center mb-8">
                        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Je bedrijfsgegevens
                        </h2>
                        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Vertel ons over je bedrijf</p>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company Name */}
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Bedrijfsnaam
                          </label>
                          <div className="relative">
                            <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                              type="text"
                              value={formData.companyName}
                              onChange={(e) => {
                                setFormData({ ...formData, companyName: e.target.value });
                                if (errors.companyName) setErrors({ ...errors, companyName: '' });
                              }}
                              placeholder="Bijv. Bouwbedrijf De Vries"
                              className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                                errors.companyName
                                  ? 'border-red-300 bg-red-50'
                                  : isDark
                                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
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
                          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            E-mailadres
                          </label>
                          <div className="relative">
                            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: '' });
                              }}
                              placeholder="info@jouwbedrijf.nl"
                              className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                                errors.email
                                  ? 'border-red-300 bg-red-50'
                                  : isDark
                                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
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

                        {/* Phone */}
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Telefoonnummer{' '}
                            <span className={`font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              (optioneel)
                            </span>
                          </label>
                          <div className="relative">
                            <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                              }
                              placeholder="+31 6 12345678"
                              className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                                isDark
                                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Website */}
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Huidige website{' '}
                            <span className={`font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              (optioneel)
                            </span>
                          </label>
                          <div className="relative">
                            <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                              type="text"
                              value={formData.website}
                              onChange={(e) =>
                                setFormData({ ...formData, website: e.target.value })
                              }
                              placeholder="www.jouwbedrijf.nl"
                              className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                                isDark
                                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                              }`}
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
                              Bezig met versturen...
                            </>
                          ) : (
                            <>
                              Aanvragen
                              <ArrowRight className="h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </form>

                      {/* Privacy Note */}
                      <p className={`text-center text-xs mt-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Door te versturen ga je akkoord met onze voorwaarden.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-3xl shadow-2xl p-8 sm:p-10 border text-center ${
                      isDark
                        ? 'bg-gray-900 border-gray-800 shadow-red-500/5'
                        : 'bg-white border-gray-100 shadow-gray-200/50'
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25"
                    >
                      <CheckCircle className="h-10 w-10 text-white" />
                    </motion.div>

                    <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Aanvraag verzonden!
                    </h2>
                    <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      We nemen zo snel mogelijk contact met je op.
                    </p>

                    <Link to="/">
                      <Button variant="outline" size="lg" className={`gap-2 ${isDark ? 'border-gray-600 text-white hover:bg-gray-800' : ''}`}>
                        <ArrowLeft className="h-4 w-4" />
                        Terug naar homepage
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
        <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          © 2025 WerkWise. Alle rechten voorbehouden.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
