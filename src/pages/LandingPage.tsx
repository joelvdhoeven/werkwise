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
  const [activePreviewScreen, setActivePreviewScreen] = useState(0);

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
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/25">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
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
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl transition-colors duration-500 ${isDark ? 'bg-violet-900/30' : 'bg-violet-100 opacity-50'}`} />
          <div className={`absolute top-60 -left-40 w-80 h-80 rounded-full blur-3xl transition-colors duration-500 ${isDark ? 'bg-fuchsia-900/30' : 'bg-fuchsia-100 opacity-50'}`} />
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
                  isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-700'
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
                    className="absolute text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent"
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
                    <div className="text-2xl sm:text-3xl font-bold text-violet-500">{stat.value}</div>
                    <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: App Preview - Interactive Dashboard Mock */}
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
                    app.werkwise.nl/{['dashboard', 'uren', 'projecten', 'voorraad', 'team', 'facturen'][activePreviewScreen]}
                  </div>
                </div>

                {/* App Content */}
                <div className="flex">
                  {/* Interactive Sidebar */}
                  <div className={`w-14 py-4 flex flex-col items-center gap-2 border-r ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                    {[
                      { icon: BarChart3, label: 'Dashboard' },
                      { icon: Clock, label: 'Uren' },
                      { icon: Building2, label: 'Projecten' },
                      { icon: Package, label: 'Voorraad' },
                      { icon: Users, label: 'Team' },
                      { icon: FileText, label: 'Facturen' },
                    ].map((item, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setActivePreviewScreen(i)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          activePreviewScreen === i
                            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
                            : isDark
                              ? 'hover:bg-gray-800 text-gray-500 hover:text-gray-300'
                              : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                        }`}
                        title={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                      </motion.button>
                    ))}
                  </div>

                  {/* Main Content - Different screens */}
                  <div className="flex-1 p-3 min-h-[300px]">
                    <AnimatePresence mode="wait">
                      {/* Dashboard Screen */}
                      {activePreviewScreen === 0 && (
                        <motion.div
                          key="dashboard"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
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
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {[
                              { label: 'Projecten', value: '12', change: '+2', color: 'indigo' },
                              { label: 'Uren', value: '248', change: '+18', color: 'purple' },
                              { label: 'Omzet', value: '€24.5k', change: '+12%', color: 'emerald' },
                              { label: 'Goedgekeurd', value: '96%', change: '+4%', color: 'blue' },
                            ].map((stat, i) => (
                              <div key={i} className={`p-2.5 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</span>
                                  <span className="text-[9px] text-emerald-500">{stat.change}</span>
                                </div>
                                <div className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                              </div>
                            ))}
                          </div>
                          <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                            <div className="flex items-end gap-1 h-10">
                              {[65, 45, 80, 55, 90, 70, 40].map((height, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  transition={{ delay: i * 0.05, duration: 0.3 }}
                                  className={`flex-1 rounded-sm ${i === 4 ? 'bg-gradient-to-t from-violet-600 to-fuchsia-600' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Uren Screen */}
                      {activePreviewScreen === 1 && (
                        <motion.div
                          key="uren"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Urenregistratie</h3>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Week 48</p>
                            </div>
                            <button className="px-2 py-1 rounded-lg text-xs bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                              + Nieuw
                            </button>
                          </div>
                          <div className="space-y-2">
                            {[
                              { date: 'Ma 25', hours: '8:00', project: 'Renovatie Centrum', status: 'approved' },
                              { date: 'Di 26', hours: '8:30', project: 'Nieuwbouw Almere', status: 'approved' },
                              { date: 'Wo 27', hours: '7:45', project: 'Onderhoud Station', status: 'pending' },
                            ].map((entry, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-2.5 rounded-xl flex items-center justify-between ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                    {entry.date.split(' ')[0]}
                                  </div>
                                  <div>
                                    <div className={`text-[11px] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{entry.project}</div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{entry.hours} uur</div>
                                  </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${entry.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              </motion.div>
                            ))}
                          </div>
                          <div className={`mt-3 p-2.5 rounded-xl text-center ${isDark ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
                            <span className={`text-xs font-medium ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>Totaal deze week: 32:30 uur</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Projecten Screen */}
                      {activePreviewScreen === 2 && (
                        <motion.div
                          key="projecten"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Projecten</h3>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>12 actief</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {[
                              { name: 'Renovatie Centrum', progress: 75, budget: '€45.000', status: 'actief' },
                              { name: 'Nieuwbouw Almere', progress: 30, budget: '€125.000', status: 'actief' },
                              { name: 'Onderhoud Station', progress: 90, budget: '€18.500', status: 'actief' },
                            ].map((project, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-[11px] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.name}</span>
                                  <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{project.budget}</span>
                                </div>
                                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{project.progress}% voltooid</span>
                                  <span className="text-[9px] text-emerald-500">{project.status}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Voorraad Screen */}
                      {activePreviewScreen === 3 && (
                        <motion.div
                          key="voorraad"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Voorraad</h3>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>3 locaties</p>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                              <Bell className="h-3 w-3" />
                              2 alerts
                            </div>
                          </div>
                          <div className="space-y-2">
                            {[
                              { item: 'Schroeven 4x40mm', qty: 2500, min: 1000, location: 'Magazijn A' },
                              { item: 'PVC Buis 110mm', qty: 45, min: 50, location: 'Magazijn B', alert: true },
                              { item: 'Verf wit 10L', qty: 8, min: 15, location: 'Bus 12', alert: true },
                            ].map((stock, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-2.5 rounded-xl flex items-center justify-between ${
                                  stock.alert
                                    ? isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'
                                    : isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                                }`}
                              >
                                <div>
                                  <div className={`text-[11px] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stock.item}</div>
                                  <div className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stock.location}</div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-[11px] font-bold ${stock.alert ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'}`}>{stock.qty}</div>
                                  <div className={`text-[9px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>min: {stock.min}</div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Team Screen */}
                      {activePreviewScreen === 4 && (
                        <motion.div
                          key="team"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Team</h3>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>8 medewerkers</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {[
                              { name: 'Jan de Vries', role: 'Voorman', status: 'actief', project: 'Renovatie Centrum' },
                              { name: 'Pieter Bakker', role: 'Timmerman', status: 'actief', project: 'Nieuwbouw Almere' },
                              { name: 'Klaas Jansen', role: 'Elektricien', status: 'actief', project: 'Onderhoud Station' },
                            ].map((member, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-2.5 rounded-xl flex items-center gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                  i === 0 ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                  <div className={`text-[11px] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.name}</div>
                                  <div className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{member.role} • {member.project}</div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${member.status === 'actief' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Facturen Screen */}
                      {activePreviewScreen === 5 && (
                        <motion.div
                          key="facturen"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Facturen</h3>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>November 2025</p>
                            </div>
                            <button className="px-2 py-1 rounded-lg text-xs bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                              + Nieuw
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                              <div className={`text-[10px] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Betaald</div>
                              <div className={`text-base font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>€18.450</div>
                            </div>
                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                              <div className={`text-[10px] ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Openstaand</div>
                              <div className={`text-base font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>€6.200</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {[
                              { nr: 'F-2025-089', client: 'Bouwbedrijf Noord', amount: '€4.250', status: 'betaald' },
                              { nr: 'F-2025-090', client: 'Gemeente Almere', amount: '€12.800', status: 'betaald' },
                              { nr: 'F-2025-091', client: 'Van den Berg BV', amount: '€6.200', status: 'open' },
                            ].map((invoice, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-2.5 rounded-xl flex items-center justify-between ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
                              >
                                <div>
                                  <div className={`text-[11px] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{invoice.client}</div>
                                  <div className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{invoice.nr}</div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{invoice.amount}</div>
                                  <div className={`text-[9px] ${invoice.status === 'betaald' ? 'text-emerald-500' : 'text-amber-500'}`}>{invoice.status}</div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
          <div className={`absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-3xl ${isDark ? 'bg-violet-900/20' : 'bg-violet-100/50'}`} />
          <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-fuchsia-900/20' : 'bg-fuchsia-100/50'}`} />
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
                        ? 'bg-violet-500/10 border border-violet-500/30'
                        : 'bg-white border border-violet-100 shadow-lg shadow-violet-100/50'
                      : isDark
                        ? 'bg-gray-800/50 border border-gray-800 hover:bg-gray-800'
                        : 'bg-white/50 border border-gray-100 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      activeFeature === index
                        ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white'
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
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center"
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-6">
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
                        className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"
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
                <div className={`text-8xl font-bold absolute -top-4 -left-2 ${isDark ? 'text-gray-800' : 'text-violet-100'}`}>{step.num}</div>
                <div className="relative pt-8 pl-4">
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2">
                    <ChevronRight className={`h-8 w-8 ${isDark ? 'text-gray-700' : 'text-violet-200'}`} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-violet-600 via-violet-700 to-fuchsia-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl" />
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
            <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
              Begin vandaag nog en bespaar uren per week op administratief werk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboarding">
                <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 shadow-2xl w-full sm:w-auto gap-2">
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
