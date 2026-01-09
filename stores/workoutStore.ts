// Zenith Timer - Workout Store
// Manages workout plans and exercise history

import type { ExerciseHistory, TrainingFocus, WorkoutExercise, WorkoutPlan } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WorkoutState {
    // Workout plans
    workouts: WorkoutPlan[];

    // Exercise history (for progression insights)
    exerciseHistory: Record<string, ExerciseHistory>;

    // Actions - Workout CRUD
    createWorkout: (name: string, trainingFocus: TrainingFocus) => string;
    updateWorkout: (id: string, updates: Partial<WorkoutPlan>) => void;
    deleteWorkout: (id: string) => void;

    // Actions - Exercise management within workout
    addExerciseToWorkout: (workoutId: string, exercise: WorkoutExercise) => void;
    updateExerciseInWorkout: (workoutId: string, exerciseIndex: number, updates: Partial<WorkoutExercise>) => void;
    removeExerciseFromWorkout: (workoutId: string, exerciseIndex: number) => void;
    reorderExercisesInWorkout: (workoutId: string, fromIndex: number, toIndex: number) => void;

    // Actions - History
    updateExerciseHistory: (exerciseId: string, history: Partial<ExerciseHistory>) => void;
    getExerciseHistory: (exerciseId: string) => ExerciseHistory | undefined;

    // Selectors
    getWorkout: (id: string) => WorkoutPlan | undefined;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            workouts: [],
            exerciseHistory: {},

            // Create a new workout plan
            createWorkout: (name, trainingFocus) => {
                const id = generateId();
                const now = Date.now();
                const newWorkout: WorkoutPlan = {
                    id,
                    name,
                    exercises: [],
                    trainingFocus,
                    createdAt: now,
                    updatedAt: now,
                };

                set((state) => ({
                    workouts: [...state.workouts, newWorkout],
                }));

                return id;
            },

            // Update an existing workout
            updateWorkout: (id, updates) => {
                set((state) => ({
                    workouts: state.workouts.map((workout) =>
                        workout.id === id
                            ? { ...workout, ...updates, updatedAt: Date.now() }
                            : workout
                    ),
                }));
            },

            // Delete a workout
            deleteWorkout: (id) => {
                set((state) => ({
                    workouts: state.workouts.filter((workout) => workout.id !== id),
                }));
            },

            // Add exercise to workout
            addExerciseToWorkout: (workoutId, exercise) => {
                set((state) => ({
                    workouts: state.workouts.map((workout) =>
                        workout.id === workoutId
                            ? {
                                ...workout,
                                exercises: [...workout.exercises, exercise],
                                updatedAt: Date.now(),
                            }
                            : workout
                    ),
                }));
            },

            // Update exercise in workout
            updateExerciseInWorkout: (workoutId, exerciseIndex, updates) => {
                set((state) => ({
                    workouts: state.workouts.map((workout) =>
                        workout.id === workoutId
                            ? {
                                ...workout,
                                exercises: workout.exercises.map((ex, idx) =>
                                    idx === exerciseIndex ? { ...ex, ...updates } : ex
                                ),
                                updatedAt: Date.now(),
                            }
                            : workout
                    ),
                }));
            },

            // Remove exercise from workout
            removeExerciseFromWorkout: (workoutId, exerciseIndex) => {
                set((state) => ({
                    workouts: state.workouts.map((workout) =>
                        workout.id === workoutId
                            ? {
                                ...workout,
                                exercises: workout.exercises.filter((_, idx) => idx !== exerciseIndex),
                                updatedAt: Date.now(),
                            }
                            : workout
                    ),
                }));
            },

            // Reorder exercises in workout
            reorderExercisesInWorkout: (workoutId, fromIndex, toIndex) => {
                set((state) => ({
                    workouts: state.workouts.map((workout) => {
                        if (workout.id !== workoutId) return workout;

                        const exercises = [...workout.exercises];
                        const [removed] = exercises.splice(fromIndex, 1);
                        exercises.splice(toIndex, 0, removed);

                        return { ...workout, exercises, updatedAt: Date.now() };
                    }),
                }));
            },

            // Update exercise history
            updateExerciseHistory: (exerciseId, history) => {
                set((state) => ({
                    exerciseHistory: {
                        ...state.exerciseHistory,
                        [exerciseId]: {
                            ...state.exerciseHistory[exerciseId],
                            exerciseId,
                            ...history,
                        } as ExerciseHistory,
                    },
                }));
            },

            // Get exercise history
            getExerciseHistory: (exerciseId) => {
                return get().exerciseHistory[exerciseId];
            },

            // Get workout by ID
            getWorkout: (id) => {
                return get().workouts.find((workout) => workout.id === id);
            },
        }),
        {
            name: 'zenith-workouts',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
