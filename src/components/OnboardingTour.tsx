import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Users,
  Play,
  Rocket,
  Crown,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderOpen,
  Package,
  Wrench,
  AlertTriangle,
  Ticket,
  Settings,
  BarChart3,
  Home,
  FileText,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface TourStep {
  id: string;
  title: string;
  description: string;
  pageId: string;
  icon: React.ReactNode;
  color: string;
}

interface OnboardingTourProps {
  setActiveSection: (section: string) => void;
  activeSection: string;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ setActiveSection, activeSection }) => {
  const { theme } = useTheme();
  const { profile, login, logout } = useAuth();
  const isDark = theme === 'dark';
  const isAdmin = profile?.role === 'admin' || profile?.role === 'kantoorpersoneel' || profile?.role === 'superuser';

  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('werkwise_tour_open');
    return saved !== 'false';
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem('werkwise_tour_completed') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Define steps based on user role with icons and colors
  // Order matches sidebar navigation exactly
  const adminSteps: TourStep[] = [
    // Overzicht
    { id: 'dashboard', title: 'Dashboard', description: 'Je command center met realtime statistieken en overzichten.', pageId: 'dashboard', icon: <Home className="h-5 w-5" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'financieel', title: 'Financieel Dashboard', description: 'Inzicht in omzet, kosten en winst op projectniveau.', pageId: 'financieel-dashboard', icon: <BarChart3 className="h-5 w-5" />, color: 'from-emerald-500 to-green-500' },
    { id: 'voorraad-dashboard', title: 'Voorraad Dashboard', description: 'Overzicht van voorraadwaarde, lage voorraad alerts en trends.', pageId: 'voorraad-dashboard', icon: <Package className="h-5 w-5" />, color: 'from-indigo-500 to-blue-500' },
    // Werk
    { id: 'projecten', title: 'Projecten', description: 'Beheer projecten, voortgang en medewerkers.', pageId: 'projecten', icon: <FolderOpen className="h-5 w-5" />, color: 'from-orange-500 to-amber-500' },
    { id: 'uren', title: 'Urenregistratie', description: 'Gebruik de timer of voer handmatig uren in.', pageId: 'urenregistratie', icon: <Clock className="h-5 w-5" />, color: 'from-purple-500 to-violet-500' },
    // Voorraad & Gereedschap
    { id: 'voorraad-afboeken', title: 'Voorraad Afboeken', description: 'Boek materialen direct af op projecten.', pageId: 'voorraad-afboeken', icon: <Package className="h-5 w-5" />, color: 'from-pink-500 to-rose-500' },
    { id: 'voorraadbeheer', title: 'Voorraadbeheer', description: 'Beheer je volledige voorraad en locaties.', pageId: 'voorraadbeheer', icon: <Package className="h-5 w-5" />, color: 'from-cyan-500 to-teal-500' },
    { id: 'gereedschap', title: 'Speciaal Gereedschap', description: 'Track gereedschap, onderhoud en uitleningen.', pageId: 'speciaal-gereedschap', icon: <Wrench className="h-5 w-5" />, color: 'from-yellow-500 to-orange-500' },
    // Meldingen & Support
    { id: 'schade', title: 'Schademeldingen', description: 'Registreer en volg schademeldingen op.', pageId: 'schademeldingen', icon: <AlertTriangle className="h-5 w-5" />, color: 'from-red-500 to-rose-500' },
    { id: 'tickets', title: 'Ticket Omgeving', description: 'Maak tickets voor interne communicatie.', pageId: 'ticket-omgeving', icon: <Ticket className="h-5 w-5" />, color: 'from-teal-500 to-cyan-500' },
    // Beheer
    { id: 'gebruikers', title: 'Gebruikersbeheer', description: 'Beheer gebruikers, rollen en permissies.', pageId: 'gebruikers', icon: <Users className="h-5 w-5" />, color: 'from-violet-500 to-purple-500' },
    { id: 'facturen', title: 'Factuur Instellingen', description: 'Configureer factuurlayout, bedrijfsgegevens en exporteer projectfacturen.', pageId: 'factuur-instellingen', icon: <FileText className="h-5 w-5" />, color: 'from-emerald-500 to-teal-500' },
    { id: 'instellingen', title: 'Instellingen', description: 'Personaliseer je WerkWise ervaring en beheer verlofaanvragen.', pageId: 'instellingen', icon: <Settings className="h-5 w-5" />, color: 'from-gray-500 to-slate-500' },
    { id: 'systeem', title: 'Module Beheer', description: 'Beheer modules, demo data en geavanceerde systeemopties.', pageId: 'module-beheer', icon: <Sliders className="h-5 w-5" />, color: 'from-rose-500 to-red-500' },
    // Final step - back to dashboard
    { id: 'start', title: 'Aan de Slag!', description: 'Je bent klaar om te beginnen. Welkom bij WerkWise!', pageId: 'dashboard', icon: <Rocket className="h-5 w-5" />, color: 'from-red-500 to-rose-500' },
  ];

  // Order matches sidebar navigation for simple users
  const medewerkerSteps: TourStep[] = [
    { id: 'dashboard', title: 'Dashboard', description: 'Je persoonlijke overzicht met statistieken.', pageId: 'dashboard', icon: <Home className="h-5 w-5" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'projecten', title: 'Projecten', description: 'Bekijk je toegewezen projecten.', pageId: 'projecten', icon: <FolderOpen className="h-5 w-5" />, color: 'from-orange-500 to-amber-500' },
    { id: 'uren', title: 'Urenregistratie', description: 'Registreer je uren met de timer.', pageId: 'urenregistratie', icon: <Clock className="h-5 w-5" />, color: 'from-purple-500 to-violet-500' },
    { id: 'voorraad', title: 'Voorraad Afboeken', description: 'Boek gebruikte materialen af.', pageId: 'voorraad-afboeken', icon: <Package className="h-5 w-5" />, color: 'from-pink-500 to-rose-500' },
    { id: 'gereedschap', title: 'Speciaal Gereedschap', description: 'Bekijk en leen gereedschap.', pageId: 'speciaal-gereedschap', icon: <Wrench className="h-5 w-5" />, color: 'from-yellow-500 to-orange-500' },
    { id: 'schade', title: 'Schademeldingen', description: 'Meld schade direct vanuit het veld.', pageId: 'schademeldingen', icon: <AlertTriangle className="h-5 w-5" />, color: 'from-red-500 to-rose-500' },
    { id: 'instellingen', title: 'Instellingen', description: 'Vraag vakantie of verlof aan.', pageId: 'instellingen', icon: <Settings className="h-5 w-5" />, color: 'from-gray-500 to-slate-500' },
    // Final step - back to dashboard
    { id: 'start', title: 'Aan de Slag!', description: 'Je bent klaar om te beginnen. Welkom bij WerkWise!', pageId: 'dashboard', icon: <Rocket className="h-5 w-5" />, color: 'from-red-500 to-rose-500' },
  ];

  const steps = isAdmin ? adminSteps : medewerkerSteps;
  const isLastStep = currentStep === steps.length - 1;
  const [showCompletion, setShowCompletion] = useState(false);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('werkwise_tour_open', isOpen.toString());
  }, [isOpen]);

  // Navigate to current step's page
  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      setActiveSection(steps[currentStep].pageId);

      // Collapse all sidebar sections on the final step
      if (currentStep === steps.length - 1) {
        window.dispatchEvent(new Event('sidebar-collapse-all'));
      }
    }
  }, [currentStep, isOpen, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (isLastStep) {
      // Go back to dashboard and show completion screen
      setActiveSection('dashboard');
      setShowCompletion(true);
    }
  };

  const handlePrev = () => {
    if (showCompletion) {
      // Go back from completion screen to last step
      setShowCompletion(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setHasCompletedTour(true);
    localStorage.setItem('werkwise_tour_completed', 'true');
  };

  const handleSwitchRole = async () => {
    setIsLoading(true);
    try {
      // First logout
      await logout();

      // Then login with the other demo account
      if (isAdmin) {
        // Currently admin, switch to medewerker
        await login('demouser@werkwise.nl', 'werkwise');
      } else {
        // Currently medewerker, switch to admin
        await login('adminuser@werkwise.nl', 'demowerkwise');
      }

      // Reset tour state
      setCurrentStep(0);
      setShowCompletion(false);
      setHasCompletedTour(false);
      localStorage.removeItem('werkwise_tour_completed');
    } catch (error) {
      console.error('Switch role error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleReopen = () => {
    setIsOpen(true);
    setCurrentStep(0);
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleReopen}
        className="fixed bottom-4 right-4 z-50 p-4 rounded-2xl shadow-2xl bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 text-white group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <Sparkles className="h-6 w-6 relative z-10" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`fixed bottom-4 right-4 left-4 sm:left-auto z-50 sm:w-[380px] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
        style={{
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)'
        }}
      >
        {/* Header - Compact on mobile */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-rose-600 to-pink-600" />
          <div className="hidden sm:block absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNGMwIDItMiA0LTIgNHMtMi0yLTItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

          {/* Floating particles - hidden on mobile */}
          <motion.div
            animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="hidden sm:block absolute top-4 right-16 w-3 h-3 bg-white/30 rounded-full blur-sm"
          />
          <motion.div
            animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="hidden sm:block absolute top-12 right-8 w-2 h-2 bg-white/40 rounded-full blur-sm"
          />
          <motion.div
            animate={{ y: [-5, 15, -5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="hidden sm:block absolute bottom-4 left-20 w-4 h-4 bg-white/20 rounded-full blur-sm"
          />

          <div className="relative p-3 sm:p-5">
            {/* Mobile: Simple compact header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Icon hidden on mobile */}
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="hidden sm:flex w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl items-center justify-center border border-white/30"
                >
                  {isAdmin ? <Crown className="h-6 w-6 text-white" /> : <Zap className="h-6 w-6 text-white" />}
                </motion.div>
                <div>
                  {/* Mobile: Just step counter, Desktop: Full title */}
                  <h2 className="text-white font-bold text-sm sm:text-lg flex items-center gap-2">
                    <span className="sm:hidden">Stap {currentStep + 1}/{steps.length}</span>
                    <span className="hidden sm:inline">Rondleiding</span>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="hidden sm:inline"
                    >
                      <Sparkles className="h-4 w-4 text-yellow-300" />
                    </motion.span>
                  </h2>
                  <p className="text-white/70 text-xs sm:text-sm">
                    <span className="sm:hidden">{steps[currentStep].title}</span>
                    <span className="hidden sm:inline">{isAdmin ? 'Admin modus' : 'Medewerker modus'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg sm:rounded-xl transition-colors text-white/80 hover:text-white"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Progress bar - simplified on mobile */}
            <div className="mt-2 sm:mt-4">
              <div className="flex gap-1 sm:gap-1.5">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      showCompletion || index <= currentStep
                        ? 'bg-white shadow-lg shadow-white/50'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              <p className="hidden sm:block text-white/60 text-xs mt-2 text-center">
                {showCompletion ? 'Voltooid!' : `Stap ${currentStep + 1} van ${steps.length}`}
              </p>
            </div>
          </div>
        </div>

        {/* Content - Compact on mobile */}
        <div className="p-3 sm:p-5">
          <AnimatePresence mode="wait">
            {!showCompletion ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step Icon - Hidden on mobile, show title/desc differently */}
                <div className="hidden sm:flex items-center gap-4 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center text-white shadow-lg`}
                    style={{
                      boxShadow: `0 10px 20px -5px rgba(0,0,0,0.2)`
                    }}
                  >
                    {steps[currentStep].icon}
                  </motion.div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {steps[currentStep].title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Bekijk nu live
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile description - shorter */}
                <p className={`text-xs sm:text-sm mb-3 sm:mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {steps[currentStep].description}
                </p>

                {/* Navigation - Compact on mobile */}
                <div className="flex gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                      currentStep === 0
                        ? isDark ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Vorige</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="flex-[2] sm:flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all flex items-center justify-center gap-1 sm:gap-2 group"
                  >
                    {isLastStep ? 'Voltooien' : 'Volgende'}
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              /* Last Step - Premium CTA */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                {/* Celebration animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="relative w-24 h-24 mx-auto mb-5"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 rounded-3xl rotate-6 opacity-20" />
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 rounded-3xl -rotate-6 opacity-20" />
                  <div className="relative w-full h-full bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl shadow-red-500/30">
                    <Rocket className="h-10 w-10 text-white" />
                  </div>
                  {/* Sparkles around */}
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2"
                  >
                    <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 0.8, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute -bottom-1 -left-2"
                  >
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                </motion.div>

                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Rondleiding Voltooid!
                </h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Je hebt alle functies ontdekt. Klaar om te starten?
                </p>

                <div className="space-y-3">
                  {/* Primary CTA */}
                  <Link
                    to="/onboarding"
                    onClick={handleComplete}
                    className="block w-full py-4 px-5 rounded-2xl text-base font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative flex items-center justify-center gap-2">
                      <Rocket className="h-5 w-5" />
                      31 Dagen Gratis Uitproberen
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>

                  {/* Switch Role Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSwitchRole}
                    disabled={isLoading}
                    className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border-2 ${
                      isDark
                        ? 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                        />
                        <span>Wisselen...</span>
                      </>
                    ) : (
                      <>
                        {isAdmin ? <Users className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
                        {isAdmin ? 'Bekijk als Medewerker' : 'Bekijk als Admin'}
                      </>
                    )}
                  </motion.button>

                  {/* Back button */}
                  <button
                    onClick={handlePrev}
                    className={`w-full py-2.5 text-sm transition-colors ${
                      isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <ChevronLeft className="h-4 w-4" />
                      Terug naar vorige stap
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mini progress dots at bottom - Hidden on mobile */}
        <div className={`hidden sm:flex px-5 pb-4 justify-center gap-1.5 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setShowCompletion(false);
                setCurrentStep(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                showCompletion
                  ? isDark ? 'bg-gray-600' : 'bg-gray-300'
                  : index === currentStep
                    ? 'w-6 bg-gradient-to-r from-red-500 to-rose-500'
                    : index < currentStep
                      ? isDark ? 'bg-gray-600' : 'bg-gray-300'
                      : isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
