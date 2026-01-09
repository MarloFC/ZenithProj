// Zenith Timer - AI Import Service (V2 Placeholder)
// Gemini AI integration for workout plan import from images/spreadsheets

import type { AIImportResult } from '@/types';
import { searchExercises } from './restTimeCalculator';

// Placeholder API key - will be configured in production
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

/**
 * Import a workout plan from an image using Gemini Vision
 * 
 * V2 Feature - Currently a placeholder
 * 
 * @param imageBase64 - Base64 encoded image of workout plan
 * @returns Parsed workout data
 */
export async function importWorkoutFromImage(
    imageBase64: string
): Promise<AIImportResult> {
    if (!GEMINI_API_KEY) {
        return {
            success: false,
            error: 'Gemini API key not configured. This is a V2 feature.',
        };
    }

    try {
        // TODO: V2 Implementation
        // 1. Send image to Gemini Vision API
        // 2. Parse response to extract exercise names, sets, reps
        // 3. Match exercise names to database using fuzzy search
        // 4. Return structured workout data

        // Placeholder response
        return {
            success: false,
            error: 'AI Import is coming in V2. Stay tuned!',
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to process image: ${error}`,
        };
    }
}

/**
 * Import a workout plan from a spreadsheet/text file
 * 
 * V2 Feature - Currently a placeholder
 * 
 * @param fileContent - File content (CSV, Excel text, etc.)
 * @returns Parsed workout data
 */
export async function importWorkoutFromFile(
    fileContent: string
): Promise<AIImportResult> {
    if (!GEMINI_API_KEY) {
        return {
            success: false,
            error: 'Gemini API key not configured. This is a V2 feature.',
        };
    }

    try {
        // TODO: V2 Implementation
        // 1. Send file content to Gemini API for parsing
        // 2. Extract structured exercise data
        // 3. Match to exercise database
        // 4. Return workout plan

        return {
            success: false,
            error: 'AI Import is coming in V2. Stay tuned!',
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to process file: ${error}`,
        };
    }
}

/**
 * Match an exercise name from AI to our database
 * Uses fuzzy matching to find the best match
 * 
 * @param exerciseName - Name from AI parsing
 * @returns Best matching exercise ID or undefined
 */
export function matchExerciseToDatabase(exerciseName: string): string | undefined {
    const normalizedName = exerciseName.toLowerCase().trim();
    const results = searchExercises(normalizedName);

    // Return first match if found
    if (results.length > 0) {
        return results[0].id;
    }

    // Try partial matching for common variations
    const variations = [
        normalizedName.replace('machine', ''),
        normalizedName.replace('dumbbell', ''),
        normalizedName.replace('barbell', ''),
        normalizedName.replace('cable', ''),
    ];

    for (const variation of variations) {
        const partialResults = searchExercises(variation.trim());
        if (partialResults.length > 0) {
            return partialResults[0].id;
        }
    }

    return undefined;
}

/**
 * Generate a prompt for Gemini to parse workout image
 * V2 Implementation helper
 */
export function getWorkoutParsingPrompt(): string {
    return `Analyze this workout plan image and extract the following information in JSON format:
{
  "workoutName": "Name of the workout if visible, or generate a descriptive name",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": number,
      "reps": number or "rep range like 8-12"
    }
  ]
}

Be precise with exercise names. Common exercises include:
- Bench Press, Incline Bench Press, Dumbbell Press
- Squat, Leg Press, Lunges
- Deadlift, Romanian Deadlift
- Pull-ups, Lat Pulldown, Rows
- Shoulder Press, Lateral Raise
- Bicep Curls, Tricep Extensions

Return ONLY valid JSON, no additional text.`;
}
