import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Clock, Package,
  Wrench, Zap, Play, ChevronRight,
  Building2, TrendingUp, Bell, Sparkles, Check,
  Users, BarChart3, CalendarDays, CheckCircle2,
  ArrowUpRight, Activity, FileText, Euro
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ui/theme-toggle';

const LandingPage: React.FC = () => {
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

            {/* Right: App Preview - Realistic Dashboard Mock */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:pl-4 perspective-1000"
            >
              <div className={`rounded-2xl shadow-2xl overflow-hidden max-w-xl mx-auto lg:ml-auto relative ${
                isDark
                  ? 'bg-gray-900 border border-gray-800 shadow-black/50'
                  : 'bg-white border border-gray-200 shadow-gray-300/50'
              }`}>
                {/* Browser-like header */}
                <div className={`px-4 py-3 flex items-center gap-2 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className={`flex-1 mx-4 px-3 py-1 rounded-md text-xs ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-500'}`}>
                    app.werkwise.nl/dashboard
                  </div>
                </div>

                {/* App Content */}
                <div className="flex">
                  {/* Mini Sidebar */}
                  <div className={`w-14 py-4 flex flex-col items-center gap-3 border-r ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    {[Clock, Building2, Package, Users, FileText].map((Icon, i) => (
                      <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                        <Icon className={`h-4 w-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      </div>
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h3>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>November 2025</p>
                      </div>
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                        <Activity className="h-3 w-3" />
                        Live
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { icon: Building2, label: 'Projecten', value: '12', change: '+2', color: 'indigo' },
                        { icon: Clock, label: 'Uren', value: '248', change: '+18', color: 'purple' },
                        { icon: Euro, label: 'Omzet', value: '€24.5k', change: '+12%', color: 'emerald' },
                        { icon: CheckCircle2, label: 'Goedgekeurd', value: '96%', change: '+4%', color: 'blue' },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              stat.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-500' :
                              stat.color === 'purple' ? 'bg-purple-500/20 text-purple-500' :
                              stat.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-500' :
                              'bg-blue-500/20 text-blue-500'
                            }`}>
                              <stat.icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                              <ArrowUpRight className="h-2.5 w-2.5" />
                              {stat.change}
                            </span>
                          </div>
                          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                          <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Mini Chart */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Weekoverzicht</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Uren</span>
                      </div>
                      <div className="flex items-end gap-1 h-12">
                        {[65, 45, 80, 55, 90, 70, 40].map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: 0.9 + i * 0.05, duration: 0.4 }}
                            className={`flex-1 rounded-sm ${
                              i === 4
                                ? 'bg-gradient-to-t from-indigo-500 to-purple-500'
                                : isDark ? 'bg-gray-700' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2">
                        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day, i) => (
                          <span key={i} className={`text-[9px] flex-1 text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{day}</span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Recente activiteit</span>
                        <CalendarDays className={`h-3 w-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: 'Jan de Vries', action: '8u geregistreerd', time: '2 min' },
                          { name: 'Project Almere', action: 'Status: actief', time: '15 min' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                              i === 0
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                                : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {item.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-[10px] font-medium truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.name}</div>
                              <div className={`text-[9px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{item.action}</div>
                            </div>
                            <span className={`text-[9px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 1.2, type: "spring" }}
                  className="absolute -right-3 top-20 px-3 py-2 rounded-xl shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-medium">Live data</span>
                  </div>
                </motion.div>

                {/* Floating notification */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1.4, type: "spring" }}
                  className={`absolute -left-3 bottom-16 px-3 py-2 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                    <div>
                      <div className={`text-[10px] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Uren goedgekeurd</div>
                      <div className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Zojuist</div>
                    </div>
                  </div>
                </motion.div>
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
