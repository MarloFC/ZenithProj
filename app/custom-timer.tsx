// Zenith Timer - Minimalist Custom Timer Screen
// Ultra-simple: tap timer to start/stop, tap time to edit

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSessionStore } from '@/stores/sessionStore';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CustomTimerScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [showEditModal, setShowEditModal] = useState(true); // Show on first load
    const [editMinutes, setEditMinutes] = useState('3');
    const [editSeconds, setEditSeconds] = useState('0');
    const [timeIsSet, setTimeIsSet] = useState(false);

    const {
        timerSeconds,
        timerTotalSeconds,
        isTimerRunning,
        startTimer,
        stopTimer,
        resetTimer,
        tickTimer,
    } = useSessionStore();

    const progress = useSharedValue(1);
    const SIZE = 280;
    const STROKE_WIDTH = 12;
    const RADIUS = (SIZE - STROKE_WIDTH) / 2;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    // Update progress animation
    useEffect(() => {
        if (timerTotalSeconds > 0) {
            progress.value = withTiming(timerSeconds / timerTotalSeconds, { duration: 300 });
        }
    }, [timerSeconds, timerTotalSeconds]);

    // Timer tick handled globally in _layout.tsx now to prevent desync
    // We only keep the effect to trigger completion haptics/logic if needed,
    // but actually the store handles state, and formatted time is derived.
    // We can remove the local interval entirely.

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
    }));

    const handleTimerTap = () => {
        if (!timeIsSet) {
            // Time not set yet, show edit modal
            setShowEditModal(true);
        } else if ((timerSeconds === 0 && timerTotalSeconds > 0) || (timerSeconds === 0 && timerTotalSeconds === 0 && timeIsSet)) {
            // Timer finished OR was reset via modal ("I'm Ready")
            // Restart with the previously set time stored in the inputs
            const mins = parseInt(editMinutes) || 0;
            const secs = parseInt(editSeconds) || 0;
            const totalSeconds = mins * 60 + secs;
            if (totalSeconds > 0) {
                startTimer(totalSeconds);
            }
        } else if (isTimerRunning) {
            // Running, stop it
            stopTimer();
        } else {
            // Paused, resume it
            startTimer(timerSeconds || timerTotalSeconds);
        }
    };

    const handleTimeDisplayTap = () => {
        if (!isTimerRunning) {
            setShowEditModal(true);
        }
    };

    const handleSaveTime = () => {
        const mins = parseInt(editMinutes) || 0;
        const secs = parseInt(editSeconds) || 0;
        const totalSeconds = mins * 60 + secs;

        if (totalSeconds > 0) {
            // Set the timer without starting it
            useSessionStore.setState((state) => ({
                timerSeconds: totalSeconds,
                timerTotalSeconds: totalSeconds,
                isTimerRunning: false,
            }));
            setTimeIsSet(true);
            setShowEditModal(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (timerSeconds === 0 && timerTotalSeconds > 0) return colors.success;
        if (timerSeconds === 0 && timerTotalSeconds === 0 && timeIsSet) return colors.success; // Also green when reset/ready
        if (timerTotalSeconds > 0 && timerSeconds / timerTotalSeconds < 0.25) return colors.warning;
        return colors.primary;
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: '',
                    headerShown: true,
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} style={styles.headerButton}>
                            <FontAwesome name="arrow-left" size={20} color={colors.text} />
                        </Pressable>
                    ),
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                }}
            />

            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Pressable onPress={handleTimerTap} style={styles.content}>
                    {/* Minimalist Timer */}
                    <View style={styles.timerContainer}>
                        <Svg width={SIZE} height={SIZE} style={styles.svg}>
                            {/* Background circle */}
                            <Circle
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                stroke={colors.border}
                                strokeWidth={STROKE_WIDTH}
                                fill="none"
                            />
                            {/* Progress circle */}
                            <AnimatedCircle
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                stroke={getTimerColor()}
                                strokeWidth={STROKE_WIDTH}
                                fill="none"
                                strokeDasharray={CIRCUMFERENCE}
                                animatedProps={animatedProps}
                                strokeLinecap="round"
                                rotation="-90"
                                origin={`${SIZE / 2}, ${SIZE / 2}`}
                            />
                        </Svg>

                        {/* Time display - tappable to edit */}
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                handleTimeDisplayTap();
                            }}
                            style={styles.timeDisplay}
                        >
                            <Text style={[styles.timeText, { color: colors.text }]}>
                                {formatTime(timerSeconds || timerTotalSeconds || (timeIsSet ? (parseInt(editMinutes) * 60 + parseInt(editSeconds)) : 0))}
                            </Text>
                            {!isTimerRunning && timerSeconds > 0 && (
                                <Text style={[styles.tapHint, { color: colors.textMuted }]}>
                                    Tap to edit
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Simple instruction */}
                    <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                        {!timeIsSet
                            ? 'Set your time to begin'
                            : isTimerRunning
                                ? 'Tap to pause'
                                : (timerSeconds === 0 && timerTotalSeconds > 0)
                                    ? 'Tap to restart'
                                    : (timerSeconds === 0 && timerTotalSeconds === 0 && timeIsSet)
                                        ? 'Tap to restart'
                                        : 'Tap anywhere to start'}
                    </Text>
                </Pressable>
            </SafeAreaView>

            {/* Edit Time Modal */}
            <Modal visible={showEditModal} animationType="slide" transparent>
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowEditModal(false)}
                >
                    <Pressable
                        style={[styles.modalContent, { backgroundColor: colors.card }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Set Time</Text>

                        <View style={styles.timeInputRow}>
                            <View style={styles.timeInputGroup}>
                                <TextInput
                                    style={[styles.timeInput, { color: colors.text, borderColor: colors.border }]}
                                    value={editMinutes}
                                    onChangeText={setEditMinutes}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    selectTextOnFocus
                                    autoFocus
                                />
                                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>min</Text>
                            </View>

                            <Text style={[styles.timeSeparator, { color: colors.text }]}>:</Text>

                            <View style={styles.timeInputGroup}>
                                <TextInput
                                    style={[styles.timeInput, { color: colors.text, borderColor: colors.border }]}
                                    value={editSeconds}
                                    onChangeText={setEditSeconds}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    selectTextOnFocus
                                />
                                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>sec</Text>
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                onPress={handleSaveTime}
                            >
                                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Set</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    timerContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    svg: {
        transform: [{ rotate: '0deg' }],
    },
    timeDisplay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 64,
        fontWeight: '300',
        fontVariant: ['tabular-nums'],
    },
    tapHint: {
        fontSize: 12,
        marginTop: 4,
    },
    instruction: {
        fontSize: 16,
        marginTop: 32,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 24,
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
    },
    timeInputGroup: {
        alignItems: 'center',
        gap: 8,
    },
    timeInput: {
        fontSize: 48,
        fontWeight: '600',
        textAlign: 'center',
        width: 100,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    timeLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    timeSeparator: {
        fontSize: 48,
        fontWeight: '300',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
