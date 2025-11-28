import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Sparkles, Users, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface TourStep {
  id: string;
  title: string;
  description: string;
  pageId: string;
}

interface OnboardingTourProps {
  setActiveSection: (section: string) => void;
  activeSection: string;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ setActiveSection, activeSection }) => {
  const { theme } = useTheme();
  const { profile, logout } = useAuth();
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

  // Define steps based on user role
  const adminSteps: TourStep[] = [
    { id: 'dashboard', title: 'Dashboard', description: 'Overzicht van je bedrijf met statistieken, recente activiteiten en snelle acties.', pageId: 'dashboard' },
    { id: 'financieel', title: 'Financieel Dashboard', description: 'Inzicht in omzet, kosten en winst. Bekijk financiële rapporten en trends.', pageId: 'financieel-dashboard' },
    { id: 'uren', title: 'Urenregistratie', description: 'Registreer gewerkte uren, gebruik de timer of bekijk het overzicht van alle registraties.', pageId: 'urenregistratie' },
    { id: 'projecten', title: 'Projecten', description: 'Beheer al je projecten, bekijk voortgang en toegewezen medewerkers.', pageId: 'projecten' },
    { id: 'voorraad-afboeken', title: 'Voorraad Afboeken', description: 'Boek materialen af op projecten en houd je voorraad bij.', pageId: 'voorraad-afboeken' },
    { id: 'voorraadbeheer', title: 'Voorraadbeheer', description: 'Beheer je volledige voorraad, locaties en producten.', pageId: 'voorraadbeheer' },
    { id: 'gereedschap', title: 'Speciaal Gereedschap', description: 'Beheer speciaal gereedschap, onderhoud en uitleningen.', pageId: 'speciaal-gereedschap' },
    { id: 'schade', title: 'Schademeldingen', description: 'Registreer en beheer schademeldingen van projecten.', pageId: 'schademeldingen' },
    { id: 'tickets', title: 'Ticket Omgeving', description: 'Maak support tickets aan en communiceer met het team.', pageId: 'ticket-omgeving' },
    { id: 'gebruikers', title: 'Gebruikersbeheer', description: 'Beheer gebruikers, rollen en permissies.', pageId: 'gebruikers' },
    { id: 'instellingen', title: 'Instellingen', description: 'Pas je persoonlijke instellingen en voorkeuren aan.', pageId: 'instellingen' },
  ];

  const medewerkerSteps: TourStep[] = [
    { id: 'dashboard', title: 'Dashboard', description: 'Je persoonlijke overzicht met statistieken en recente activiteiten.', pageId: 'dashboard' },
    { id: 'uren', title: 'Urenregistratie', description: 'Registreer je gewerkte uren met de timer of handmatig invoeren.', pageId: 'urenregistratie' },
    { id: 'projecten', title: 'Projecten', description: 'Bekijk de projecten waar je aan werkt.', pageId: 'projecten' },
    { id: 'voorraad', title: 'Voorraad Afboeken', description: 'Boek materialen af die je gebruikt op projecten.', pageId: 'voorraad-afboeken' },
    { id: 'gereedschap', title: 'Speciaal Gereedschap', description: 'Bekijk en leen speciaal gereedschap.', pageId: 'speciaal-gereedschap' },
    { id: 'schade', title: 'Schademeldingen', description: 'Meld schade die je tegenkomt op projecten.', pageId: 'schademeldingen' },
    { id: 'tickets', title: 'Ticket Omgeving', description: 'Vraag hulp of meld problemen via tickets.', pageId: 'ticket-omgeving' },
    { id: 'instellingen', title: 'Instellingen', description: 'Pas je persoonlijke instellingen aan.', pageId: 'instellingen' },
  ];

  const steps = isAdmin ? adminSteps : medewerkerSteps;
  const isLastStep = currentStep === steps.length - 1;

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('werkwise_tour_open', isOpen.toString());
  }, [isOpen]);

  // Navigate to current step's page
  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      setActiveSection(steps[currentStep].pageId);
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setHasCompletedTour(true);
    localStorage.setItem('werkwise_tour_completed', 'true');
  };

  const handleSwitchRole = async () => {
    // Log out and redirect to login page where they can choose another role
    await logout();
    window.location.href = '/demo';
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleReopen = () => {
    setIsOpen(true);
    setCurrentStep(0);
  };

  // Don't show if tour is closed and completed
  if (!isOpen && hasCompletedTour) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={handleReopen}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg ${
          isDark
            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
            : 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
        }`}
      >
        <Play className="h-5 w-5" />
      </motion.button>
    );
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={handleReopen}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg ${
          isDark
            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
            : 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
        }`}
      >
        <Sparkles className="h-5 w-5" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed bottom-4 right-4 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Rondleiding</span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-white/80 mt-2">
            Stap {currentStep + 1} van {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-4">
          {!isLastStep ? (
            <>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {steps[currentStep].title}
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {steps[currentStep].description}
              </p>

              {/* Navigation */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    currentStep === 0
                      ? isDark ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Vorige
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-2 px-3 rounded-xl text-sm font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all flex items-center justify-center gap-1"
                >
                  Volgende
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            /* Last Step - CTA */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center">
                <Sparkles className={`h-8 w-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Rondleiding Voltooid!
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Je hebt alle functies gezien. Klaar om te beginnen?
              </p>

              <div className="space-y-2">
                <Link
                  to="/onboarding"
                  onClick={handleComplete}
                  className="block w-full py-3 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25"
                >
                  Probeer gratis 31 dagen uit!
                </Link>

                <button
                  onClick={handleSwitchRole}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  {isAdmin ? 'Probeer als Medewerker' : 'Probeer als Admin'}
                </button>

                <button
                  onClick={handlePrev}
                  className={`w-full py-2 px-4 rounded-xl text-sm transition-all ${
                    isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Terug naar vorige stap
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
