import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Clock, X, ChevronRight, MapPin, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Project {
  id: string;
  naam: string;
  locatie?: string;
}

interface TimerWidgetProps {
  projects: Project[];
  onSaveTime: (data: {
    project_id: string;
    aantal_uren: number;
    werkomschrijving: string;
    werktype: string;
  }) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const TimerWidget: React.FC<TimerWidgetProps> = ({ projects, onSaveTime, isOpen, onToggle }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [description, setDescription] = useState('');
  const [werktype, setWerktype] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getHoursFromSeconds = (seconds: number) => {
    return Math.round((seconds / 3600) * 100) / 100; // Round to 2 decimal places
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (elapsedSeconds > 0) {
      setShowBookingModal(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(null);
  };

  const handleSave = () => {
    if (!selectedProject || !werktype) return;

    const hours = getHoursFromSeconds(elapsedSeconds);
    onSaveTime({
      project_id: selectedProject,
      aantal_uren: hours,
      werkomschrijving: description,
      werktype: werktype,
    });

    // Reset everything
    handleReset();
    setShowBookingModal(false);
    setSelectedProject('');
    setDescription('');
    setWerktype('');
  };

  const handleCancelBooking = () => {
    setShowBookingModal(false);
    // Keep the timer running if they cancel
  };

  const werktypes = [
    { value: 'werk', label: 'Werk' },
    { value: 'transport', label: 'Transport' },
    { value: 'administratie', label: 'Administratie' },
    { value: 'vergadering', label: 'Vergadering' },
    { value: 'overig', label: 'Overig' },
  ];

  return (
    <>
      {/* Floating Timer Button (when collapsed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onToggle}
            className={`fixed left-4 bottom-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${
              isRunning
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                : isDark
                  ? 'bg-gray-800 text-white border border-gray-700'
                  : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            <Clock className={`h-5 w-5 ${isRunning ? 'animate-pulse' : ''}`} />
            {isRunning && (
              <span className="font-mono font-bold">{formatTime(elapsedSeconds)}</span>
            )}
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Timer Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed left-0 top-0 bottom-0 w-80 z-50 shadow-2xl ${
              isDark ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Timer</h3>
              </div>
              <button
                onClick={onToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Timer Display */}
            <div className="p-6">
              <div className={`text-center p-8 rounded-2xl mb-6 ${
                isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-violet-50 to-fuchsia-50'
              }`}>
                <div className={`text-5xl font-mono font-bold mb-2 ${
                  isRunning
                    ? 'text-violet-600'
                    : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatTime(elapsedSeconds)}
                </div>
                {startTime && (
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Gestart om {startTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                {isRunning && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    = {getHoursFromSeconds(elapsedSeconds).toFixed(2)} uur
                  </p>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-3 mb-6">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                  >
                    <Play className="h-5 w-5" />
                    Start
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePause}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-xl transition-all ${
                        isPaused
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                          : isDark
                            ? 'bg-gray-800 text-yellow-400 border border-yellow-500/30'
                            : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                      }`}
                    >
                      {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                      {isPaused ? 'Hervat' : 'Pauze'}
                    </button>
                    <button
                      onClick={handleStop}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-xl transition-all ${
                        isDark
                          ? 'bg-red-900/30 text-red-400 border border-red-500/30 hover:bg-red-900/50'
                          : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <Square className="h-5 w-5" />
                      Stop
                    </button>
                  </>
                )}
              </div>

              {/* Reset button */}
              {(isRunning || elapsedSeconds > 0) && (
                <button
                  onClick={handleReset}
                  className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Timer resetten
                </button>
              )}
            </div>

            {/* Instructions */}
            <div className={`p-4 mx-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Hoe werkt het?</h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>1. Klik op <strong>Start</strong> om te beginnen</li>
                <li>2. Gebruik <strong>Pauze</strong> voor onderbrekingen</li>
                <li>3. Klik op <strong>Stop</strong> om je uren te boeken</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl ${
                isDark ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Uren boeken
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(elapsedSeconds)} = {getHoursFromSeconds(elapsedSeconds).toFixed(2)} uur
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Project Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project *
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-violet-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-violet-500'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500/20`}
                  >
                    <option value="">Selecteer een project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.naam} {project.locatie && `- ${project.locatie}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Work Type */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Werktype *
                  </label>
                  <select
                    value={werktype}
                    onChange={(e) => setWerktype(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-violet-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-violet-500'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500/20`}
                  >
                    <option value="">Selecteer werktype</option>
                    {werktypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Omschrijving
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Optioneel: beschrijf wat je hebt gedaan..."
                    className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-violet-500'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500/20`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`p-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex gap-3`}>
                <button
                  onClick={handleCancelBooking}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                    isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedProject || !werktype}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                    selectedProject && werktype
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                      : isDark
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Boeken
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TimerWidget;
