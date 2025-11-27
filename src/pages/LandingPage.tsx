import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Briefcase, Clock, Package,
  Wrench, Zap, Play, ChevronRight,
  Building2, TrendingUp, Bell, Globe, Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';

const LandingPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [titleNumber, setTitleNumber] = useState(0);

  // Animated words for hero
  const animatedWords = useMemo(() => {
    if (language === 'nl') {
      return ['Urenregistratie', 'Projectbeheer', 'Voorraadbeheer', 'Administratie', 'Facturatie'];
    } else if (language === 'pl') {
      return ['Rejestracja godzin', 'Projekty', 'Magazyn', 'Administracja', 'Fakturowanie'];
    }
    return ['Time Tracking', 'Project Management', 'Inventory', 'Administration', 'Invoicing'];
  }, [language]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleNumber((prev) => (prev + 1) % animatedWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [animatedWords.length]);

  const languages = [
    { code: 'nl' as const, name: 'NL', flag: '🇳🇱' },
    { code: 'en' as const, name: 'EN', flag: '🇬🇧' },
    { code: 'pl' as const, name: 'PL', flag: '🇵🇱' },
  ];

  const stats = [
    { value: '50%', label: language === 'nl' ? 'Tijdsbesparing' : language === 'pl' ? 'Oszczędność czasu' : 'Time Saved' },
    { value: '100%', label: language === 'nl' ? 'Digitaal' : language === 'pl' ? 'Cyfrowo' : 'Digital' },
    { value: '24/7', label: language === 'nl' ? 'Toegang' : language === 'pl' ? 'Dostęp' : 'Access' },
    { value: '3', label: language === 'nl' ? 'Talen' : language === 'pl' ? 'Języki' : 'Languages' },
  ];

  const steps = [
    {
      num: '01',
      title: language === 'nl' ? 'Registreer je bedrijf' : language === 'pl' ? 'Zarejestruj firmę' : 'Register your company',
      desc: language === 'nl' ? 'Maak een account aan en configureer je bedrijfsgegevens.' : language === 'pl' ? 'Utwórz konto i skonfiguruj dane firmy.' : 'Create an account and configure your company details.',
    },
    {
      num: '02',
      title: language === 'nl' ? 'Voeg je team toe' : language === 'pl' ? 'Dodaj zespół' : 'Add your team',
      desc: language === 'nl' ? 'Nodig medewerkers uit en wijs rollen toe.' : language === 'pl' ? 'Zaproś pracowników i przypisz role.' : 'Invite employees and assign roles.',
    },
    {
      num: '03',
      title: language === 'nl' ? 'Start met werken' : language === 'pl' ? 'Zacznij pracować' : 'Start working',
      desc: language === 'nl' ? 'Registreer uren, beheer projecten en voorraad.' : language === 'pl' ? 'Rejestruj godziny, zarządzaj projektami i zapasami.' : 'Track hours, manage projects and inventory.',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                WerkWise
              </span>
            </motion.div>

            <div className="flex items-center space-x-3">
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
              <Link to="/demo">
                <Button size="default" variant="outline" className="gap-2">
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === 'nl' ? 'Open Demo' : language === 'pl' ? 'Otwórz Demo' : 'Open Demo'}</span>
                </Button>
              </Link>
              <Link to="/onboarding">
                <Button size="default" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === 'nl' ? 'Wordt Klant' : language === 'pl' ? 'Zostań klientem' : 'Become a Customer'}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Zap className="h-4 w-4" />
                  {language === 'nl' ? 'De slimme keuze voor je bedrijf' : language === 'pl' ? 'Mądry wybór dla Twojej firmy' : 'The smart choice for your business'}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4"
              >
                {language === 'nl' ? (
                  <>Doe makkelijk je</>
                ) : language === 'pl' ? (
                  <>Łatwo zarządzaj</>
                ) : (
                  <>Easily manage your</>
                )}
              </motion.h1>

              {/* Animated words */}
              <div className="h-20 sm:h-24 lg:h-28 relative mb-6 flex items-center justify-center lg:justify-start">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={titleNumber}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
                  >
                    {animatedWords[titleNumber]}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                {language === 'nl'
                  ? 'WerkWise combineert urenregistratie, projectbeheer, voorraadbeheer en facturatie in één krachtig platform. Speciaal voor de bouw- en installatiebranche.'
                  : language === 'pl'
                  ? 'WerkWise łączy rejestrację godzin, zarządzanie projektami, magazynem i fakturowanie w jednej platformie. Specjalnie dla branży budowlanej.'
                  : 'WerkWise combines time tracking, project management, inventory and invoicing in one powerful platform. Built for construction and installation companies.'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/onboarding">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    <Sparkles className="h-5 w-5" />
                    {language === 'nl' ? 'Wordt Klant' : language === 'pl' ? 'Zostań klientem' : 'Become a Customer'}
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                    <Play className="h-5 w-5" />
                    {language === 'nl' ? 'Open Demo' : language === 'pl' ? 'Otwórz Demo' : 'Open Demo'}
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="grid grid-cols-4 gap-4 mt-12 pt-8 border-t border-gray-100"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: App Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:pl-8"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl shadow-indigo-300/50 p-8 max-w-lg mx-auto lg:ml-auto relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                  {/* Mock Dashboard Preview */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Dashboard</div>
                        <div className="text-indigo-200 text-sm">{language === 'nl' ? 'Real-time overzicht' : language === 'pl' ? 'Przegląd w czasie rzeczywistym' : 'Real-time overview'}</div>
                      </div>
                    </div>

                    {/* Mock stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">12</div>
                        <div className="text-indigo-200 text-sm">{language === 'nl' ? 'Actieve projecten' : language === 'pl' ? 'Aktywne projekty' : 'Active projects'}</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">248</div>
                        <div className="text-indigo-200 text-sm">{language === 'nl' ? 'Uren deze maand' : language === 'pl' ? 'Godzin w tym miesiącu' : 'Hours this month'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Feature highlights */}
                  <div className="space-y-3">
                    {[
                      { icon: Clock, text: language === 'nl' ? 'Urenregistratie in seconden' : language === 'pl' ? 'Rejestracja w sekundach' : 'Time tracking in seconds' },
                      { icon: Building2, text: language === 'nl' ? 'Projectvoortgang real-time' : language === 'pl' ? 'Postęp projektu w czasie rzeczywistym' : 'Real-time project progress' },
                      { icon: Package, text: language === 'nl' ? 'Automatisch voorraadbeheer' : language === 'pl' ? 'Automatyczne zarządzanie zapasami' : 'Automatic inventory management' },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-3 text-white"
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <Link to="/onboarding" className="block">
                      <Button size="lg" className="w-full bg-white text-indigo-600 hover:bg-gray-100 gap-2">
                        <Sparkles className="h-5 w-5" />
                        {language === 'nl' ? 'Start Nu - Gratis' : language === 'pl' ? 'Zacznij teraz - za darmo' : 'Start Now - Free'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {language === 'nl'
                ? 'Eén platform, alles geregeld'
                : language === 'pl'
                ? 'Jedna platforma, wszystko załatwione'
                : 'One platform, everything sorted'}
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              {language === 'nl'
                ? 'Stop met schakelen tussen apps. WerkWise doet alles.'
                : language === 'pl'
                ? 'Przestań przełączać się między aplikacjami.'
                : 'Stop switching between apps. WerkWise does it all.'}
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Large Card - Urenregistratie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                  {language === 'nl' ? 'Urenregistratie' : language === 'pl' ? 'Rejestracja godzin' : 'Time Tracking'}
                </h3>
                <p className="text-indigo-100 text-lg mb-8 max-w-md">
                  {language === 'nl'
                    ? 'Registreer uren in seconden. Voeg materialen, kilometers en foto\'s toe met één klik.'
                    : language === 'pl'
                    ? 'Rejestruj godziny w sekundach. Dodawaj materiały, kilometry i zdjęcia jednym kliknięciem.'
                    : 'Track hours in seconds. Add materials, kilometers and photos with one click.'}
                </p>

                {/* Mini UI Preview */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/80 text-sm">{language === 'nl' ? 'Vandaag gewerkt' : language === 'pl' ? 'Przepracowane dziś' : 'Worked today'}</span>
                    <span className="text-white font-bold">8:30</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Projectbeheer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-500 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {language === 'nl' ? 'Projectbeheer' : language === 'pl' ? 'Projekty' : 'Projects'}
              </h3>
              <p className="text-gray-500 text-sm">
                {language === 'nl' ? 'Real-time voortgang & budgetten' : language === 'pl' ? 'Postęp i budżety w czasie rzeczywistym' : 'Real-time progress & budgets'}
              </p>
            </motion.div>

            {/* Voorraadbeheer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-500 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {language === 'nl' ? 'Voorraad' : language === 'pl' ? 'Magazyn' : 'Inventory'}
              </h3>
              <p className="text-gray-500 text-sm">
                {language === 'nl' ? 'Automatisch bijhouden & alerts' : language === 'pl' ? 'Automatyczne śledzenie i alerty' : 'Auto tracking & alerts'}
              </p>
            </motion.div>

            {/* Wide Card - Financieel Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {language === 'nl' ? 'Financieel Dashboard' : language === 'pl' ? 'Panel finansowy' : 'Financial Dashboard'}
                  </h3>
                  <p className="text-emerald-100">
                    {language === 'nl' ? 'Omzet, winst en KPI\'s in één overzicht' : language === 'pl' ? 'Przychody, zyski i KPI w jednym widoku' : 'Revenue, profit and KPIs at a glance'}
                  </p>
                </div>

                {/* Mini Chart */}
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: 0.1 * i }}
                      className="w-4 bg-white/30 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Gereedschap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wrench className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {language === 'nl' ? 'Gereedschap' : language === 'pl' ? 'Narzędzia' : 'Tools'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {language === 'nl' ? 'Track locaties & onderhoud' : language === 'pl' ? 'Śledź lokalizacje i konserwację' : 'Track locations & maintenance'}
                </p>
              </div>
            </motion.div>

            {/* Notificaties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-rose-100 rounded-full blur-xl" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {language === 'nl' ? 'Notificaties' : language === 'pl' ? 'Powiadomienia' : 'Notifications'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {language === 'nl' ? 'Mis nooit een deadline' : language === 'pl' ? 'Nigdy nie przegap terminu' : 'Never miss a deadline'}
                </p>

                {/* Notification dot */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-4 right-4 w-3 h-3 bg-rose-500 rounded-full"
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/demo">
              <Button variant="outline" size="lg" className="gap-2 group">
                {language === 'nl' ? 'Bekijk alles in de demo' : language === 'pl' ? 'Zobacz wszystko w demo' : 'See everything in the demo'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {language === 'nl' ? 'Hoe het werkt' : language === 'pl' ? 'Jak to działa' : 'How it works'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {language === 'nl'
                ? 'In 3 stappen aan de slag'
                : language === 'pl'
                ? 'Zacznij w 3 krokach'
                : 'Get started in 3 steps'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-8xl font-bold text-indigo-100 absolute -top-4 -left-2">{step.num}</div>
                <div className="relative pt-8 pl-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2">
                    <ChevronRight className="h-8 w-8 text-indigo-200" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {language === 'nl'
                ? 'Klaar om je administratie te vereenvoudigen?'
                : language === 'pl'
                ? 'Gotowy uprościć swoją administrację?'
                : 'Ready to simplify your administration?'}
            </h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              {language === 'nl'
                ? 'Begin vandaag nog en bespaar uren per week op administratief werk.'
                : language === 'pl'
                ? 'Zacznij już dziś i oszczędź godziny tygodniowo na pracy administracyjnej.'
                : 'Start today and save hours per week on administrative work.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboarding">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-2xl w-full sm:w-auto gap-2">
                  <Sparkles className="h-5 w-5" />
                  {language === 'nl' ? 'Wordt Klant' : language === 'pl' ? 'Zostań klientem' : 'Become a Customer'}
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto gap-2">
                  <Play className="h-5 w-5" />
                  {language === 'nl' ? 'Open Demo' : language === 'pl' ? 'Otwórz Demo' : 'Open Demo'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">WerkWise</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                {language === 'nl' ? 'Functies' : language === 'pl' ? 'Funkcje' : 'Features'}
              </a>
              <Link to="/demo" className="text-gray-400 hover:text-white transition-colors">
                Demo
              </Link>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Globe className="h-4 w-4" />
              <span>NL | EN | PL</span>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 WerkWise. {t('allRightsReserved')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
