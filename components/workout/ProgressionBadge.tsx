// Zenith Timer - Progression Badge Component
// Shows previous session performance for progressive overload insights

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressionBadgeProps {
    exerciseId: string;
}

export function ProgressionBadge({ exerciseId }: ProgressionBadgeProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { weightUnit } = useSettingsStore();
    const history = useWorkoutStore((state) => state.getExerciseHistory(exerciseId));

    if (!history || history.lastSets.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
                <FontAwesome name="history" size={14} color={colors.textMuted} />
                <Text style={[styles.noDataText, { color: colors.textMuted }]}>
                    No previous data
                </Text>
            </View>
        );
    }

    // Get best set from last session
    const bestSet = history.lastSets.reduce((best, current) =>
        current.weight > best.weight ? current : best
    );

    const daysSince = Math.floor(
        (Date.now() - history.lastPerformed) / (1000 * 60 * 60 * 24)
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.row}>
                <FontAwesome name="trophy" size={14} color={colors.warning} />
                <Text style={[styles.label, { color: colors.textSecondary }]}>Last session:</Text>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {bestSet.weight}
                    </Text>
                    <Text style={[styles.statUnit, { color: colors.textMuted }]}>
                        {weightUnit}
                    </Text>
                </View>

                <Text style={[styles.separator, { color: colors.textMuted }]}>×</Text>

                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {bestSet.reps}
                    </Text>
                    <Text style={[styles.statUnit, { color: colors.textMuted }]}>reps</Text>
                </View>
            </View>

            <Text style={[styles.daysAgo, { color: colors.textMuted }]}>
                {daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince} days ago`}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
    },
    noDataText: {
        fontSize: 13,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 8,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statUnit: {
        fontSize: 14,
        fontWeight: '500',
    },
    separator: {
        fontSize: 18,
    },
    daysAgo: {
        fontSize: 11,
        textAlign: 'center',
    },
});
