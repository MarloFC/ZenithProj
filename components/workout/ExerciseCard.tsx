// Zenith Timer - Exercise Card Component
// Displays exercise info with set progress

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { SetLog, WorkoutExercise } from '@/types';
import { getExercise } from '@/utils/restTimeCalculator';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ExerciseCardProps {
    workoutExercise: WorkoutExercise;
    completedSets: SetLog[];
    isActive?: boolean;
    onPress?: () => void;
}

export function ExerciseCard({
    workoutExercise,
    completedSets,
    isActive = false,
    onPress,
}: ExerciseCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const exercise = getExercise(workoutExercise.exerciseId);
    const completedCount = completedSets.length;
    const targetSets = workoutExercise.targetSets;
    const isComplete = completedCount >= targetSets;

    const progressPercentage = Math.min(100, (completedCount / targetSets) * 100);

    return (
        <Pressable
            style={[
                styles.container,
                { backgroundColor: colors.card, borderColor: colors.border },
                isActive && { borderColor: colors.primary, borderWidth: 2 },
                isComplete && { borderColor: colors.success },
            ]}
            onPress={onPress}
        >
            {/* Progress bar background */}
            <View
                style={[
                    styles.progressBar,
                    { backgroundColor: isComplete ? colors.success : colors.primary },
                    { width: `${progressPercentage}%` },
                ]}
            />

            <View style={styles.content}>
                {/* Exercise info */}
                <View style={styles.infoSection}>
                    <Text style={[styles.exerciseName, { color: colors.text }]}>
                        {workoutExercise.customName || exercise?.name || 'Unknown Exercise'}
                    </Text>
                    <Text style={[styles.muscleGroup, { color: colors.textSecondary }]}>
                        {exercise?.muscleGroup?.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>

                {/* Set progress */}
                <View style={styles.progressSection}>
                    <View style={styles.setIndicators}>
                        {Array.from({ length: targetSets }).map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.setDot,
                                    {
                                        backgroundColor:
                                            index < completedCount
                                                ? colors.success
                                                : colors.timerTrack,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                    <Text style={[styles.setProgress, { color: colors.textSecondary }]}>
                        {completedCount}/{targetSets} sets
                    </Text>
                </View>

                {/* Status icon */}
                <View style={styles.statusSection}>
                    {isComplete ? (
                        <FontAwesome name="check-circle" size={24} color={colors.success} />
                    ) : isActive ? (
                        <FontAwesome name="play-circle" size={24} color={colors.primary} />
                    ) : (
                        <FontAwesome name="circle-o" size={24} color={colors.textMuted} />
                    )}
                </View>
            </View>

            {/* Target reps */}
            <Text style={[styles.targetReps, { color: colors.textMuted }]}>
                Target: {workoutExercise.targetReps} reps
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        opacity: 0.1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    infoSection: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    muscleGroup: {
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    progressSection: {
        alignItems: 'center',
        gap: 6,
    },
    setIndicators: {
        flexDirection: 'row',
        gap: 4,
    },
    setDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    setProgress: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusSection: {
        marginLeft: 8,
    },
    targetReps: {
        fontSize: 12,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
});
