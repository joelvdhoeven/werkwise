import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  startTime: Date | null;
  isOpen: boolean;
}

interface TimerContextType {
  timerState: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TIMER_STORAGE_KEY = 'werkwise_timer_state';

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    // Restore from localStorage on initial load
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Recalculate elapsed time if timer was running
        if (parsed.isRunning && !parsed.isPaused && parsed.startTime) {
          const savedStart = new Date(parsed.startTime);
          const savedElapsed = parsed.elapsedSeconds || 0;
          const now = new Date();
          const additionalSeconds = Math.floor((now.getTime() - new Date(parsed.lastSaved).getTime()) / 1000);
          return {
            ...parsed,
            startTime: savedStart,
            elapsedSeconds: savedElapsed + additionalSeconds,
          };
        }
        return {
          ...parsed,
          startTime: parsed.startTime ? new Date(parsed.startTime) : null,
        };
      } catch {
        // Invalid JSON, return default
      }
    }
    return {
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      startTime: null,
      isOpen: false,
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    const toSave = {
      ...timerState,
      startTime: timerState.startTime?.toISOString() || null,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(toSave));
  }, [timerState]);

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState.isRunning && !timerState.isPaused) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.isPaused]);

  const startTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: prev.startTime || new Date(),
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const stopTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      startTime: null,
    }));
    localStorage.removeItem(TIMER_STORAGE_KEY);
  }, []);

  const toggleOpen = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  }, []);

  const setIsOpen = useCallback((isOpen: boolean) => {
    setTimerState(prev => ({
      ...prev,
      isOpen,
    }));
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timerState,
        startTimer,
        pauseTimer,
        stopTimer,
        resetTimer,
        toggleOpen,
        setIsOpen,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
