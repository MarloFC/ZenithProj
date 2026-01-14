// Zenith Timer - Type Definitions

// ============ Exercise Types ============
export type MuscleGroup =
    | 'chest'
    | 'back'
    | 'shoulders'
    | 'biceps'
    | 'triceps'
    | 'forearms'
    | 'quadriceps'
    | 'hamstrings'
    | 'glutes'
    | 'calves'
    | 'abs'
    | 'full_body';

export type ExerciseType = 'compound' | 'isolation';

export interface Exercise {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    secondaryMuscles?: MuscleGroup[];
    exerciseType: ExerciseType;
    defaultRestSeconds: {
        strength: number;
        metabolic: number;
    };
}

// ============ Workout Types ============
export type TrainingFocus = 'strength' | 'metabolic';

export interface WorkoutExercise {
    exerciseId: string;
    targetSets: number;
    targetReps: number;
    customName?: string;
    restSeconds?: number;
    notes?: string;
}

export interface WorkoutPlan {
    id: string;
    name: string;
    exercises: WorkoutExercise[];
    trainingFocus: TrainingFocus;
    createdAt: number;
    updatedAt: number;
}

// ============ Session Types ============
export interface SetLog {
    setNumber: number;
    weight: number;
    reps: number;
    completedAt: number;
}

export interface ExerciseSession {
    exerciseId: string;
    sets: SetLog[];
    startedAt: number;
    completedAt?: number;
}

export interface WorkoutSession {
    id: string;
    workoutPlanId: string;
    exercises: ExerciseSession[];
    startedAt: number;
    completedAt?: number;
    rpe?: number; // Rate of Perceived Exertion (1-10)
    notes?: string;
}

// ============ User Preferences ============
export interface UserPreferences {
    defaultTrainingFocus: TrainingFocus;
    weightUnit: 'kg' | 'lbs';
    soundEnabled: boolean;
    hapticEnabled: boolean;
    vibrationPattern?: 'single' | 'continuous';
    timerAutoStart: boolean;
    theme: 'system' | 'light' | 'dark';
    lastQuickTimerMinutes: string;
    lastQuickTimerSeconds: string;
}

// ============ History Types ============
export interface ExerciseHistory {
    exerciseId: string;
    lastPerformed: number;
    bestWeight: number;
    bestReps: number;
    lastSets: SetLog[];
}

// ============ AI Import Types (V2 Placeholder) ============
export interface AIImportResult {
    success: boolean;
    workout?: Partial<WorkoutPlan>;
    exercises?: Array<{
        name: string;
        matchedExerciseId?: string;
        targetSets: number;
        targetReps: number;
    }>;
    error?: string;
}
