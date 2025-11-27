import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Briefcase, Clock, Package,
  Wrench, Zap, Play, ChevronRight,
  Building2, TrendingUp, Bell, Sparkles, Check
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ui/theme-toggle';

const LandingPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [titleNumber, setTitleNumber] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  // Animated words for hero (Dutch only)
  const animatedWords = ['Urenregistratie', 'Projectbeheer', 'Voorraadbeheer', 'Administratie', 'Facturatie'];

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleNumber((prev) => (prev + 1) % animatedWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [animatedWords.length]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: '50%', label: 'Tijdsbesparing' },
    { value: '100%', label: 'Digitaal' },
    { value: '24/7', label: 'Toegang' },
    { value: '3', label: 'Talen' },
  ];

  const features = [
    {
      icon: Clock,
      title: 'Urenregistratie',
      description: 'Registreer werkuren met materialen, kilometers en foto\'s. Automatische goedkeuringsflow.',
      highlight: '8:30 uur vandaag',
    },
    {
      icon: Building2,
      title: 'Projectbeheer',
      description: 'Beheer projecten met voortgang, budgetten en real-time inzicht in de status.',
      highlight: '12 actieve projecten',
    },
    {
      icon: Package,
      title: 'Voorraadbeheer',
      description: 'Multi-locatie voorraad met automatische afboekingen en lage voorraad alerts.',
      highlight: '2 alerts actief',
    },
    {
      icon: Wrench,
      title: 'Gereedschap',
      description: 'Track speciaal gereedschap met onderhoudschema\'s en beschikbaarheid.',
      highlight: '24 items getrackt',
    },
    {
      icon: TrendingUp,
      title: 'Financieel',
      description: 'Real-time inzicht in omzet, winst en KPI\'s met uitgebreide rapportages.',
      highlight: '+23% deze maand',
    },
    {
      icon: Bell,
      title: 'Notificaties',
      description: 'Automatische meldingen voor goedkeuringen, deadlines en alerts.',
      highlight: '3 nieuwe items',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Registreer je bedrijf',
      desc: 'Maak een account aan en configureer je bedrijfsgegevens.',
    },
    {
      num: '02',
      title: 'Voeg je team toe',
      desc: 'Nodig medewerkers uit en wijs rollen toe.',
    },
    {
      num: '03',
      title: 'Start met werken',
      desc: 'Registreer uren, beheer projecten en voorraad.',
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-950' : 'bg-white'} overflow-hidden`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        isDark
          ? 'bg-gray-950/80 backdrop-blur-xl border-b border-gray-800'
          : 'bg-white/80 backdrop-blur-xl border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                WerkWise
              </span>
            </motion.div>

            <div className="flex items-center space-x-3">
              <ThemeToggle className="hidden sm:flex" />
              <Link to="/demo">
                <Button size="default" variant="outline" className={`gap-2 ${isDark ? 'border-gray-600 text-white hover:bg-gray-800' : ''}`}>
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">Demo</span>
                </Button>
              </Link>
              <Link to="/onboarding">
                <Button size="default" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Start</span>
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
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl transition-colors duration-500 ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100 opacity-50'}`} />
          <div className={`absolute top-60 -left-40 w-80 h-80 rounded-full blur-3xl transition-colors duration-500 ${isDark ? 'bg-purple-900/30' : 'bg-purple-100 opacity-50'}`} />
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
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
                  isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  <Zap className="h-4 w-4" />
                  De slimme keuze voor je bedrijf
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Doe makkelijk je
              </motion.h1>

              {/* Animated words */}
              <div className="h-24 sm:h-28 lg:h-32 relative mb-6 flex items-center justify-center lg:justify-start pb-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={titleNumber}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
                  >
                    {animatedWords[titleNumber]}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`text-xl mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                WerkWise combineert urenregistratie, projectbeheer, voorraadbeheer en facturatie in één krachtig platform.
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
                    Wordt Klant
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button size="lg" variant="outline" className={`w-full sm:w-auto gap-2 ${isDark ? 'border-gray-600 text-white hover:bg-gray-800' : ''}`}>
                    <Play className="h-5 w-5" />
                    Open Demo
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className={`grid grid-cols-4 gap-4 mt-12 pt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-indigo-500">{stat.value}</div>
                    <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
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
              <div className={`rounded-3xl shadow-2xl p-8 max-w-lg mx-auto lg:ml-auto relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 shadow-indigo-500/10'
                  : 'bg-gradient-to-br from-indigo-600 to-purple-700 shadow-indigo-300/50'
              }`}>
                {/* Decorative elements */}
                <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${isDark ? 'bg-indigo-500/10' : 'bg-white/10'}`} />
                <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 ${isDark ? 'bg-purple-500/10' : 'bg-purple-400/20'}`} />

                <div className="relative">
                  {/* Mock Dashboard Preview */}
                  <div className={`backdrop-blur-sm rounded-2xl p-6 mb-6 border ${
                    isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/10 border-white/20'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-white/20'}`}>
                        <Briefcase className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-white'}`} />
                      </div>
                      <div>
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-white'}`}>Dashboard</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-indigo-200'}`}>
                          Real-time overzicht
                        </div>
                      </div>
                    </div>

                    {/* Mock stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700/50' : 'bg-white/10'}`}>
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>12</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-indigo-200'}`}>
                          Actieve projecten
                        </div>
                      </div>
                      <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700/50' : 'bg-white/10'}`}>
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>248</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-indigo-200'}`}>
                          Uren deze maand
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature highlights */}
                  <div className="space-y-3">
                    {[
                      { icon: Clock, text: 'Urenregistratie in seconden' },
                      { icon: Building2, text: 'Projectvoortgang real-time' },
                      { icon: Package, text: 'Automatisch voorraadbeheer' },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-white'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-indigo-500/20' : 'bg-white/20'}`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
                    <Link to="/onboarding" className="block">
                      <Button size="lg" className={`w-full gap-2 ${isDark ? '' : 'bg-white text-indigo-600 hover:bg-gray-100'}`}>
                        <Sparkles className="h-5 w-5" />
                        Start Nu - Gratis
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Interactive Showcase */}
      <section className={`py-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-3xl ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-100/50'}`} />
          <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Eén platform, alles geregeld
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Stop met schakelen tussen apps. WerkWise doet alles.
            </p>
          </motion.div>

          {/* Interactive Feature Cards */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Feature List */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setActiveFeature(index)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? isDark
                        ? 'bg-indigo-500/10 border border-indigo-500/30'
                        : 'bg-white border border-indigo-100 shadow-lg shadow-indigo-100/50'
                      : isDark
                        ? 'bg-gray-800/50 border border-gray-800 hover:bg-gray-800'
                        : 'bg-white/50 border border-gray-100 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      activeFeature === index
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {feature.highlight}
                      </p>
                    </div>
                    {activeFeature === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right: Feature Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:pl-8"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-3xl p-8 ${
                    isDark
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-100 shadow-xl shadow-gray-200/50'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6">
                    {React.createElement(features[activeFeature].icon, { className: "h-8 w-8 text-white" })}
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {features[activeFeature].title}
                  </h3>
                  <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {features[activeFeature].description}
                  </p>

                  {/* Mock UI Element */}
                  <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Status
                      </span>
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {features[activeFeature].highlight}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${60 + activeFeature * 7}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>

                  <Link to="/demo" className="mt-6 block">
                    <Button variant="outline" className={`w-full gap-2 ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}>
                      Bekijk in demo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`py-24 transition-colors duration-500 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
              isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-700'
            }`}>
              Hoe het werkt
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              In 3 stappen aan de slag
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
                <div className={`text-8xl font-bold absolute -top-4 -left-2 ${isDark ? 'text-gray-800' : 'text-indigo-100'}`}>{step.num}</div>
                <div className="relative pt-8 pl-4">
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2">
                    <ChevronRight className={`h-8 w-8 ${isDark ? 'text-gray-700' : 'text-indigo-200'}`} />
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
              Klaar om je administratie te vereenvoudigen?
            </h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              Begin vandaag nog en bespaar uren per week op administratief werk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboarding">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-2xl w-full sm:w-auto gap-2">
                  <Sparkles className="h-5 w-5" />
                  Wordt Klant
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto gap-2">
                  <Play className="h-5 w-5" />
                  Open Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 transition-colors duration-500 ${isDark ? 'bg-gray-950 border-t border-gray-800' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-xl font-bold text-white">WerkWise</span>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                Functies
              </a>
              <Link to="/demo" className="text-gray-400 hover:text-white transition-colors">
                Demo
              </Link>
            </div>
            <ThemeToggle />
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 WerkWise. Alle rechten voorbehouden.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
