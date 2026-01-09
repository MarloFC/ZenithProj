// Zenith Timer - Rest Time Calculator
// Implements the intelligent rest time logic based on exercise type and training focus

import exercisesData from '@/data/exercises.json';
import type { Exercise, TrainingFocus } from '@/types';

// In-memory exercise lookup
const exerciseMap = new Map<string, Exercise>(
    exercisesData.exercises.map((ex) => [ex.id, ex as Exercise])
);

/**
 * Get recommended rest time for an exercise based on training focus
 * 
 * Strength/Hypertrophy Focus: Longer rest (2-3 min compound, 90-120s isolation)
 * - Prioritizes maximizing force production and volume load per set
 * 
 * Metabolic/Density Focus: Shorter rest (75-90s compound, 45-60s isolation)
 * - Prioritizes workout density and metabolic stress
 */
export function getRecommendedRestTime(
    exerciseId: string,
    trainingFocus: TrainingFocus
): number {
    const exercise = exerciseMap.get(exerciseId);

    if (!exercise) {
        // Default fallback: 90 seconds
        return 90;
    }

    return exercise.defaultRestSeconds[trainingFocus];
}

/**
 * Get exercise by ID
 */
export function getExercise(exerciseId: string): Exercise | undefined {
    return exerciseMap.get(exerciseId);
}

/**
 * Get all exercises
 */
export function getAllExercises(): Exercise[] {
    return exercisesData.exercises as Exercise[];
}

/**
 * Search exercises by name
 */
export function searchExercises(query: string): Exercise[] {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
        return getAllExercises();
    }

    return getAllExercises().filter((exercise) =>
        exercise.name.toLowerCase().includes(normalizedQuery) ||
        exercise.muscleGroup.toLowerCase().includes(normalizedQuery)
    );
}

/**
 * Get exercises by muscle group
 */
export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
    return getAllExercises().filter(
        (exercise) =>
            exercise.muscleGroup === muscleGroup ||
            exercise.secondaryMuscles?.includes(muscleGroup as any)
    );
}

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get color for timer based on remaining percentage
 */
export function getTimerColor(
    remainingSeconds: number,
    totalSeconds: number,
    colors: { active: string; warning: string; complete: string }
): string {
    if (remainingSeconds <= 0) {
        return colors.complete;
    }

    const percentage = remainingSeconds / totalSeconds;

    if (percentage <= 0.2) {
        return colors.warning; // Last 20% - warning color
    }

    return colors.active;
}
