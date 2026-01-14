// Zenith Timer - Session Store
// Manages active workout sessions and timer state

import type { ExerciseSession, SetLog, WorkoutSession } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useSettingsStore } from './settingsStore';
import { useWorkoutStore } from './workoutStore';

interface SessionState {
    // Active session
    activeSession: WorkoutSession | null;

    // Timer state
    timerSeconds: number;
    timerTotalSeconds: number;
    timerEndTime: number | null; // Timestamp when timer finishes
    isTimerRunning: boolean;

    // UI state
    currentExerciseIndex: number;
    currentSetIndex: number;

    // Past sessions (for history)
    pastSessions: WorkoutSession[];

    // Actions - Session
    startSession: (workoutPlanId: string) => void;
    endSession: (rpe?: number, notes?: string) => void;
    cancelSession: () => void;

    // Actions - Sets
    logSet: (weight: number, reps: number) => void;
    skipSet: () => void;

    // Actions - Navigation
    goToNextExercise: () => void;
    goToPreviousExercise: () => void;
    setCurrentExercise: (index: number) => void;

    // Actions - Timer
    startTimer: (seconds: number) => void;
    stopTimer: () => void;
    resetTimer: () => void;
    tickTimer: () => void;
    setTimerSeconds: (seconds: number) => void;

    // Selectors
    getCurrentExercise: () => ExerciseSession | null;
    getCurrentSetNumber: () => number;
    isSessionComplete: () => boolean;
    getSessionForWorkout: (workoutPlanId: string) => WorkoutSession[];
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            activeSession: null,
            timerSeconds: 0,
            timerTotalSeconds: 0,
            timerEndTime: null,
            isTimerRunning: false,
            currentExerciseIndex: 0,
            currentSetIndex: 0,
            pastSessions: [],

            // Start a new workout session
            startSession: (workoutPlanId) => {
                const workout = useWorkoutStore.getState().getWorkout(workoutPlanId);
                if (!workout) return;

                const now = Date.now();
                const session: WorkoutSession = {
                    id: generateId(),
                    workoutPlanId,
                    exercises: workout.exercises.map((ex) => ({
                        exerciseId: ex.exerciseId,
                        sets: [],
                        startedAt: now,
                    })),
                    startedAt: now,
                };

                set({
                    activeSession: session,
                    currentExerciseIndex: 0,
                    currentSetIndex: 0,
                    timerSeconds: 0,
                    timerTotalSeconds: 0,
                    timerEndTime: null,
                    isTimerRunning: false,
                });
            },

            // End the current session
            endSession: (rpe, notes) => {
                const { activeSession } = get();
                if (!activeSession) return;

                const completedSession: WorkoutSession = {
                    ...activeSession,
                    completedAt: Date.now(),
                    rpe,
                    notes,
                };

                // Update exercise history for each exercise
                const workoutStore = useWorkoutStore.getState();
                completedSession.exercises.forEach((exerciseSession) => {
                    if (exerciseSession.sets.length > 0) {
                        const lastSets = exerciseSession.sets;
                        const bestSet = lastSets.reduce((best, current) =>
                            current.weight > best.weight ? current : best
                        );

                        workoutStore.updateExerciseHistory(exerciseSession.exerciseId, {
                            lastPerformed: Date.now(),
                            lastSets,
                            bestWeight: bestSet.weight,
                            bestReps: bestSet.reps,
                        });
                    }
                });

                set((state) => ({
                    activeSession: null,
                    pastSessions: [completedSession, ...state.pastSessions].slice(0, 100), // Keep last 100 sessions
                    currentExerciseIndex: 0,
                    currentSetIndex: 0,
                    timerSeconds: 0,
                    timerEndTime: null,
                    isTimerRunning: false,
                }));
            },

            // Cancel without saving
            cancelSession: () => {
                set({
                    activeSession: null,
                    currentExerciseIndex: 0,
                    currentSetIndex: 0,
                    timerSeconds: 0,
                    timerEndTime: null,
                    isTimerRunning: false,
                });
            },

            // Log a completed set
            logSet: (weight, reps) => {
                const { activeSession, currentExerciseIndex, currentSetIndex } = get();
                if (!activeSession) return;

                const newSet: SetLog = {
                    setNumber: currentSetIndex + 1,
                    weight,
                    reps,
                    completedAt: Date.now(),
                };

                set((state) => {
                    if (!state.activeSession) return state;

                    const newExercises = [...state.activeSession.exercises];
                    newExercises[currentExerciseIndex] = {
                        ...newExercises[currentExerciseIndex],
                        sets: [...newExercises[currentExerciseIndex].sets, newSet],
                    };

                    return {
                        activeSession: {
                            ...state.activeSession,
                            exercises: newExercises,
                        },
                        currentSetIndex: state.currentSetIndex + 1,
                    };
                });
            },

            // Skip the current set
            skipSet: () => {
                set((state) => ({
                    currentSetIndex: state.currentSetIndex + 1,
                }));
            },

            // Navigate to next exercise
            goToNextExercise: () => {
                const { activeSession, currentExerciseIndex } = get();
                if (!activeSession) return;

                if (currentExerciseIndex < activeSession.exercises.length - 1) {
                    set({
                        currentExerciseIndex: currentExerciseIndex + 1,
                        currentSetIndex: 0,
                        timerSeconds: 0,
                        timerEndTime: null,
                        isTimerRunning: false,
                    });
                }
            },

            // Navigate to previous exercise
            goToPreviousExercise: () => {
                const { currentExerciseIndex } = get();

                if (currentExerciseIndex > 0) {
                    set({
                        currentExerciseIndex: currentExerciseIndex - 1,
                        currentSetIndex: 0,
                        timerSeconds: 0,
                        timerEndTime: null,
                        isTimerRunning: false,
                    });
                }
            },

            // Set specific exercise
            setCurrentExercise: (index) => {
                set({
                    currentExerciseIndex: index,
                    currentSetIndex: 0,
                    timerSeconds: 0,
                    timerEndTime: null,
                    isTimerRunning: false,
                });
            },

            // Timer actions
            startTimer: async (seconds) => {
                const now = Date.now();
                const endTime = now + seconds * 1000;

                // Get user settings for vibration pattern
                const { vibrationPattern } = useSettingsStore.getState();

                // Determine channel based on pattern
                // 'continuous' -> 'timer-channel-continuous' (Long pattern)
                // 'single' -> 'timer-channel' (Default/Short pattern)
                const channelId = vibrationPattern === 'continuous' ? 'timer-channel-continuous' : 'timer-channel';

                // Schedule notification
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Rest Time Complete! 🚀',
                        body: 'Time to get back to work!',
                        sound: true,
                        // Vibrate array is ignored on Android 8+ if channel has pattern, but useful for iOS/older Android
                        vibrate: vibrationPattern === 'continuous'
                            ? [0, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
                            : [0, 250, 250, 250],
                        categoryIdentifier: 'timer-end',
                        // @ts-ignore
                        channelId: channelId,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: seconds,
                        repeats: false,
                        channelId: channelId,
                    },
                });

                set({
                    timerSeconds: seconds,
                    timerTotalSeconds: seconds,
                    timerEndTime: endTime,
                    isTimerRunning: true,
                });
            },

            stopTimer: async () => {
                await Notifications.cancelAllScheduledNotificationsAsync();
                set({ isTimerRunning: false, timerEndTime: null });
            },

            resetTimer: async () => {
                await Notifications.cancelAllScheduledNotificationsAsync();
                set({
                    timerSeconds: 0,
                    timerTotalSeconds: 0,
                    timerEndTime: null,
                    isTimerRunning: false,
                });
            },

            tickTimer: () => {
                set((state) => {
                    if (!state.isTimerRunning || !state.timerEndTime) {
                        return { isTimerRunning: false, timerSeconds: 0, timerEndTime: null };
                    }

                    const now = Date.now();
                    const remaining = Math.ceil((state.timerEndTime - now) / 1000);

                    if (remaining <= 0) {
                        return { isTimerRunning: false, timerSeconds: 0, timerEndTime: null };
                    }

                    return { timerSeconds: remaining };
                });
            },

            setTimerSeconds: (seconds) => {
                set({ timerSeconds: seconds, timerTotalSeconds: seconds });
            },

            // Selectors
            getCurrentExercise: () => {
                const { activeSession, currentExerciseIndex } = get();
                if (!activeSession) return null;
                return activeSession.exercises[currentExerciseIndex] || null;
            },

            getCurrentSetNumber: () => {
                const { currentSetIndex } = get();
                return currentSetIndex + 1;
            },

            isSessionComplete: () => {
                const { activeSession } = get();
                if (!activeSession) return false;

                const workout = useWorkoutStore.getState().getWorkout(activeSession.workoutPlanId);
                if (!workout) return false;

                return activeSession.exercises.every((exerciseSession, index) => {
                    const targetSets = workout.exercises[index]?.targetSets || 0;
                    return exerciseSession.sets.length >= targetSets;
                });
            },

            getSessionForWorkout: (workoutPlanId) => {
                return get().pastSessions.filter(
                    (session) => session.workoutPlanId === workoutPlanId
                );
            },
        }),
        {
            name: 'zenith-sessions',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                pastSessions: state.pastSessions,
                // CRITICAL: Don't persist active session or timer state to prevent stale sessions
            }),
            // Ensure activeSession is always null on hydration
            merge: (persistedState: any, currentState) => ({
                ...currentState,
                ...(persistedState || {}),
                activeSession: null,
                timerSeconds: 0,
                timerTotalSeconds: 0,
                timerEndTime: null,
                isTimerRunning: false,
                currentExerciseIndex: 0,
                currentSetIndex: 0,
            }),
        }
    )
);
