// Zenith Timer - Set Logger Component
// Quick weight and rep input with increment buttons

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSettingsStore } from '@/stores/settingsStore';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface SetLoggerProps {
    weight: number;
    reps: number;
    onWeightChange: (weight: number) => void;
    onRepsChange: (reps: number) => void;
    weightUnit?: string;
    previousWeight?: number;
    previousReps?: number;
    disabled?: boolean;
}

export function SetLogger({
    weight,
    reps,
    onWeightChange,
    onRepsChange,
    weightUnit = 'kg',
    previousWeight,
    previousReps,
    disabled = false,
}: SetLoggerProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { hapticEnabled } = useSettingsStore();

    const handlePress = () => {
        if (hapticEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const adjustWeight = (amount: number) => {
        handlePress();
        onWeightChange(Math.max(0, weight + amount));
    };

    const adjustReps = (amount: number) => {
        handlePress();
        onRepsChange(Math.max(0, reps + amount));
    };

    const weightIncrement = weightUnit === 'kg' ? 2.5 : 5;
    const largeWeightIncrement = weightUnit === 'kg' ? 5 : 10;

    return (
        <View style={styles.container}>
            {/* Weight Input */}
            <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                    WEIGHT ({weightUnit.toUpperCase()})
                </Text>

                <View style={styles.inputRow}>
                    <Pressable
                        style={[styles.adjustBtn, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => adjustWeight(-largeWeightIncrement)}
                    >
                        <Text style={[styles.adjustBtnText, { color: colors.textSecondary }]}>
                            -{largeWeightIncrement}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.adjustBtn, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => adjustWeight(-weightIncrement)}
                    >
                        <Text style={[styles.adjustBtnText, { color: colors.textSecondary }]}>
                            -{weightIncrement}
                        </Text>
                    </Pressable>

                    <TextInput
                        style={[
                            styles.valueInput,
                            { color: colors.text, borderColor: colors.border },
                        ]}
                        value={weight.toString()}
                        onChangeText={(text) => {
                            const num = parseFloat(text) || 0;
                            onWeightChange(num);
                        }}
                        keyboardType="numeric"
                        selectTextOnFocus
                    />

                    <Pressable
                        style={[styles.adjustBtn, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => adjustWeight(weightIncrement)}
                    >
                        <Text style={[styles.adjustBtnText, { color: colors.textSecondary }]}>
                            +{weightIncrement}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.adjustBtn, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => adjustWeight(largeWeightIncrement)}
                    >
                        <Text style={[styles.adjustBtnText, { color: colors.textSecondary }]}>
                            +{largeWeightIncrement}
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Reps Input */}
            <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>REPS</Text>

                <View style={styles.inputRow}>
                    <Pressable
                        style={[styles.adjustBtn, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => adjustReps(-5)}
                    >
                        <Text style={[styles.adjustBtnText, { color: colors.textSecondary }]}>-5</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.adjustBtn, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => adjustReps(-1)}
                    >
                        <Text style={[styles.adjustBtnText, { color: colors.textSecondary }]}>-1</Text>
                    </Pressable>

                    <TextInput
                        style={[
                            styles.valueInput,
                            { color: colors.text, borderColor: colors.border },
                        ]}
                        value={reps.toString()}
                        onChangeText={(text) => {
                            const num = parseInt(text, 10) || 0;
                            onRepsChange(num);
                        }}
                        keyboardType="number-pad"
                        selectTextOnFocus
                    />

                    <Pressable
                        style={[styles.adjustBtn, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => adjustReps(1)}
                    >
                        <Text style={[styles.adjustBtnText, { color: colors.textSecondary }]}>+1</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.adjustBtn, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => adjustReps(5)}
                    >
                        <Text style={[styles.adjustBtnText, { color: colors.textSecondary }]}>+5</Text>
                    </Pressable>
                </View>
            </View>

            {/* Previous session hint */}
            {previousWeight !== undefined && previousReps !== undefined && (
                <Text style={[styles.previousHint, { color: colors.textMuted }]}>
                    Last session: {previousWeight} {weightUnit} × {previousReps} reps
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 20,
    },
    inputSection: {
        gap: 10,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    adjustBtn: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        minWidth: 48,
        alignItems: 'center',
    },
    adjustBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    valueInput: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        minWidth: 80,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 10,
    },
    previousHint: {
        fontSize: 13,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
