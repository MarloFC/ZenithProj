// Zenith Timer - Settings Store
// Manages user preferences

import type { TrainingFocus, UserPreferences } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState extends UserPreferences {
    // Actions
    setTrainingFocus: (focus: TrainingFocus) => void;
    setWeightUnit: (unit: 'kg' | 'lbs') => void;
    setSoundEnabled: (enabled: boolean) => void;
    setHapticEnabled: (enabled: boolean) => void;
    setTimerAutoStart: (enabled: boolean) => void;
    setTheme: (theme: 'system' | 'light' | 'dark') => void;
    resetToDefaults: () => void;
}

const defaultSettings: UserPreferences = {
    defaultTrainingFocus: 'strength',
    weightUnit: 'kg',
    soundEnabled: true,
    hapticEnabled: true,
    timerAutoStart: true,
    theme: 'system',
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,

            setTrainingFocus: (focus) => set({ defaultTrainingFocus: focus }),

            setWeightUnit: (unit) => set({ weightUnit: unit }),

            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

            setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),

            setTimerAutoStart: (enabled) => set({ timerAutoStart: enabled }),

            setTheme: (theme) => set({ theme }),

            resetToDefaults: () => set(defaultSettings),
        }),
        {
            name: 'zenith-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
