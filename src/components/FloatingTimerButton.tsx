import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, ChevronLeft, ChevronRight, Check, X, Plus, Trash2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimer } from '../contexts/TimerContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSupabaseQuery, useSupabaseMutation } from '../hooks/useSupabase';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Material {
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
}

const FloatingTimerButton: React.FC = () => {
  const { timerState, startTimer, pauseTimer, stopTimer, resetTimer, toggleOpen, setIsOpen } = useTimer();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');
  const [werktype, setWerktype] = useState('projectbasis');
  const [usedMaterials, setUsedMaterials] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState(1);
  const [isHidden, setIsHidden] = useState(() => {
    return localStorage.getItem('werkwise_timer_hidden') === 'true';
  });

  // Load products for material selection
  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase
        .from('inventory_products')
        .select('id, name, unit, sku')
        .order('name');
      if (data) setProducts(data);
    };
    if (usedMaterials && products.length === 0) {
      loadProducts();
    }
  }, [usedMaterials]);

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHidden(true);
    localStorage.setItem('werkwise_timer_hidden', 'true');
  };

  const handleShow = () => {
    setIsHidden(false);
    localStorage.removeItem('werkwise_timer_hidden');
  };

  // Show button again if timer starts running
  if (isHidden && timerState.isRunning) {
    handleShow();
  }

  const { data: allProjecten } = useSupabaseQuery<any>('projects');
  const projects = (allProjecten || []).filter((p: any) => p.status === 'actief');
  const { insert: insertRegistration } = useSupabaseMutation('time_registrations');

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getHoursFromSeconds = (seconds: number) => {
    return Math.round((seconds / 3600) * 100) / 100;
  };

  const handleStop = () => {
    if (timerState.elapsedSeconds > 0) {
      stopTimer();
      setShowBookingModal(true);
    }
  };

  const addMaterial = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    // Check if already added
    const existing = materials.find(m => m.product_id === selectedProductId);
    if (existing) {
      setMaterials(materials.map(m =>
        m.product_id === selectedProductId
          ? { ...m, quantity: m.quantity + materialQuantity }
          : m
      ));
    } else {
      setMaterials([...materials, {
        product_id: product.id,
        product_name: product.name,
        quantity: materialQuantity,
        unit: product.unit
      }]);
    }
    setSelectedProductId('');
    setMaterialQuantity(1);
  };

  const removeMaterial = (productId: string) => {
    setMaterials(materials.filter(m => m.product_id !== productId));
  };

  const handleSave = async () => {
    if (!selectedProject || !werktype || !user) return;

    const hours = getHoursFromSeconds(timerState.elapsedSeconds);
    const selectedProjectData = projects.find((p: any) => p.id === selectedProject);

    await insertRegistration({
      user_id: user.id,
      project_id: selectedProject,
      project_naam: selectedProjectData?.naam || '',
      datum: new Date().toISOString().split('T')[0],
      aantal_uren: hours,
      werkomschrijving: description || 'Timer registratie',
      werktype: werktype,
      status: 'submitted',
      materials: usedMaterials && materials.length > 0 ? materials : [],
    });

    resetTimer();
    setShowBookingModal(false);
    setSelectedProject('');
    setDescription('');
    setWerktype('projectbasis');
    setUsedMaterials(false);
    setMaterials([]);
  };

  const handleCancelBooking = () => {
    setShowBookingModal(false);
    setUsedMaterials(false);
    setMaterials([]);
    // Resume timer if cancelled
    startTimer();
  };

  const werktypes = [
    { value: 'projectbasis', label: 'Geoffreerd' },
    { value: 'meerwerk', label: 'Extra Werk' },
    { value: 'regie', label: 'Nacalculatie' },
  ];

  // Check if timer should be hidden (only when not running and at 0)
  const canHide = !timerState.isRunning && timerState.elapsedSeconds === 0;

  // If hidden and can still be hidden, don't render
  if (isHidden && canHide) {
    return null;
  }

  return (
    <>
      {/* Floating Timer Button (always visible when collapsed) */}
      <AnimatePresence>
        {!timerState.isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed left-4 bottom-4 z-50"
          >
            {/* Glow effect when running */}
            {timerState.isRunning && !timerState.isPaused && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-500 rounded-2xl blur-xl"
              />
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleOpen}
              className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all ${
                timerState.isRunning
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white'
                  : isDark
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'bg-white text-gray-900 border border-gray-200'
              }`}
              style={{
                boxShadow: timerState.isRunning
                  ? '0 20px 40px -10px rgba(239, 68, 68, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.3)'
                  : undefined
              }}
            >
              {/* Animated clock icon */}
              <motion.div
                animate={timerState.isRunning && !timerState.isPaused ? { rotate: 360 } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className={`p-2 rounded-xl ${
                  timerState.isRunning
                    ? 'bg-white/20'
                    : isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <Clock className="h-6 w-6" />
              </motion.div>

              {/* Timer display */}
              <div className="flex flex-col items-start">
                <span className="text-xs opacity-70 font-medium">
                  {timerState.isRunning ? (timerState.isPaused ? 'Gepauzeerd' : 'Loopt...') : 'Timer'}
                </span>
                <span className="font-mono font-bold text-xl tracking-wider">
                  {formatTime(timerState.elapsedSeconds)}
                </span>
              </div>

              {/* Arrow indicator */}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`ml-1 ${timerState.isRunning ? 'text-white/70' : ''}`}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.div>

              {/* Live indicator dot when running */}
              {timerState.isRunning && !timerState.isPaused && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"
                />
              )}

              {/* Close button when timer is at 00:00:00 */}
              {canHide && (
                <button
                  onClick={handleHide}
                  className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                    isDark
                      ? 'bg-gray-700 hover:bg-red-600 text-gray-400 hover:text-white'
                      : 'bg-gray-200 hover:bg-red-500 text-gray-500 hover:text-white'
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Sidebar Panel */}
      <AnimatePresence>
        {timerState.isOpen && (
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
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Timer</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className="h-6 w-6 text-red-600" />
              </button>
            </div>

            {/* Timer Display */}
            <div className="p-6">
              <div className={`text-center p-8 rounded-2xl mb-6 ${
                isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-red-50 to-rose-50'
              }`}>
                <div className={`text-5xl font-mono font-bold mb-2 ${
                  timerState.isRunning
                    ? 'text-red-600'
                    : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatTime(timerState.elapsedSeconds)}
                </div>
                {timerState.startTime && (
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Gestart om {timerState.startTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                {(timerState.isRunning || timerState.elapsedSeconds > 0) && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    = {getHoursFromSeconds(timerState.elapsedSeconds).toFixed(2)} uur
                  </p>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-3 mb-6">
                {!timerState.isRunning ? (
                  <button
                    onClick={startTimer}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
                  >
                    <Play className="h-5 w-5" />
                    {timerState.elapsedSeconds > 0 ? 'Hervat' : 'Start'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={pauseTimer}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-xl transition-all ${
                        timerState.isPaused
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                          : isDark
                            ? 'bg-gray-800 text-yellow-400 border border-yellow-500/30'
                            : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                      }`}
                    >
                      {timerState.isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                      {timerState.isPaused ? 'Hervat' : 'Pauze'}
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
              {(timerState.isRunning || timerState.elapsedSeconds > 0) && (
                <button
                  onClick={resetTimer}
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
                <li className="text-red-500 font-medium mt-2">Timer blijft lopen tijdens navigatie!</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for sidebar */}
      <AnimatePresence>
        {timerState.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 z-40"
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
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Uren boeken
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(timerState.elapsedSeconds)} = {getHoursFromSeconds(timerState.elapsedSeconds).toFixed(2)} uur
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
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
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                    } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                  >
                    <option value="">Selecteer een project</option>
                    {projects.map((project: any) => (
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
                  <div className="grid grid-cols-3 gap-2">
                    {werktypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setWerktype(type.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          werktype === type.value
                            ? 'bg-red-600 text-white'
                            : isDark
                              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Omschrijving
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Optioneel: beschrijf wat je hebt gedaan..."
                    className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                    } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                  />
                </div>

                {/* Materials Toggle */}
                <div className={`p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Materialen gebruikt?
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUsedMaterials(false)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          !usedMaterials
                            ? 'bg-red-600 text-white'
                            : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Nee
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsedMaterials(true)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          usedMaterials
                            ? 'bg-red-600 text-white'
                            : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Ja
                      </button>
                    </div>
                  </div>

                  {/* Material Selection */}
                  {usedMaterials && (
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-2">
                        <select
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">Selecteer product...</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.unit})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={materialQuantity}
                          onChange={(e) => setMaterialQuantity(parseInt(e.target.value) || 1)}
                          className={`w-20 px-3 py-2 rounded-lg border text-sm text-center ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={addMaterial}
                          disabled={!selectedProductId}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Added Materials List */}
                      {materials.length > 0 && (
                        <div className="space-y-2">
                          {materials.map((material) => (
                            <div
                              key={material.product_id}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'
                              }`}
                            >
                              <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {material.product_name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {material.quantity} {material.unit}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeMaterial(material.product_id)}
                                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
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

export default FloatingTimerButton;
