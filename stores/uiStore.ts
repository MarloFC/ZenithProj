import { create } from 'zustand';

interface UIState {
    isTimerAlertVisible: boolean;
    showTimerAlert: () => void;
    hideTimerAlert: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isTimerAlertVisible: false,
    showTimerAlert: () => set({ isTimerAlertVisible: true }),
    hideTimerAlert: () => set({ isTimerAlertVisible: false }),
}));
