// Zenith Timer - Timer Controls Component
// Start, pause, reset, and adjust timer

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TimerControlsProps {
    defaultTime: number;
    onSkip?: () => void;
}

export function TimerControls({ defaultTime, onSkip }: TimerControlsProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const {
        timerSeconds,
        timerTotalSeconds,
        isTimerRunning,
        startTimer,
        stopTimer,
        resetTimer,
        setTimerSeconds,
    } = useSessionStore();

    const { hapticEnabled } = useSettingsStore();

    const handlePress = () => {
        if (hapticEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handlePlayPause = () => {
        handlePress();
        if (isTimerRunning) {
            stopTimer();
        } else if (timerSeconds > 0) {
            startTimer(timerSeconds);
        } else {
            startTimer(defaultTime);
        }
    };

    const handleReset = () => {
        handlePress();
        resetTimer();
    };

    const handleAddTime = (seconds: number) => {
        handlePress();
        const newTime = Math.max(0, (timerSeconds || defaultTime) + seconds);
        setTimerSeconds(newTime);
    };

    const handleSkip = () => {
        handlePress();
        resetTimer();
        onSkip?.();
    };

    return (
        <View style={styles.container}>
            {/* Time adjustment buttons */}
            <View style={styles.adjustRow}>
                <Pressable
                    style={[styles.adjustButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => handleAddTime(-15)}
                >
                    <Text style={[styles.adjustText, { color: colors.textSecondary }]}>-15s</Text>
                </Pressable>

                <Pressable
                    style={[styles.adjustButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => handleAddTime(-30)}
                >
                    <Text style={[styles.adjustText, { color: colors.textSecondary }]}>-30s</Text>
                </Pressable>

                <Pressable
                    style={[styles.adjustButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => handleAddTime(30)}
                >
                    <Text style={[styles.adjustText, { color: colors.textSecondary }]}>+30s</Text>
                </Pressable>

                <Pressable
                    style={[styles.adjustButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => handleAddTime(15)}
                >
                    <Text style={[styles.adjustText, { color: colors.textSecondary }]}>+15s</Text>
                </Pressable>
            </View>

            {/* Main control buttons */}
            <View style={styles.controlRow}>
                <Pressable
                    style={[styles.secondaryButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleReset}
                >
                    <FontAwesome name="refresh" size={20} color={colors.textSecondary} />
                </Pressable>

                <Pressable
                    style={[styles.playButton, { backgroundColor: colors.primary }]}
                    onPress={handlePlayPause}
                >
                    <FontAwesome
                        name={isTimerRunning ? 'pause' : 'play'}
                        size={32}
                        color="#FFFFFF"
                        style={!isTimerRunning ? { marginLeft: 4 } : undefined}
                    />
                </Pressable>

                <Pressable
                    style={[styles.secondaryButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleSkip}
                >
                    <FontAwesome name="forward" size={20} color={colors.textSecondary} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 24,
    },
    adjustRow: {
        flexDirection: 'row',
        gap: 12,
    },
    adjustButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    adjustText: {
        fontSize: 14,
        fontWeight: '600',
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    secondaryButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
});
