// Zenith Timer - Circular Timer Component
// Premium animated circular progress timer

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatTime, getTimerColor } from '@/utils/restTimeCalculator';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularTimerProps {
    size?: number;
    strokeWidth?: number;
    defaultTime?: number;
    onComplete?: () => void;
}

export function CircularTimer({
    size = 280,
    strokeWidth = 12,
    defaultTime = 0,
    onComplete,
}: CircularTimerProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const {
        timerSeconds,
        timerTotalSeconds,
        isTimerRunning,
        tickTimer,
        stopTimer,
    } = useSessionStore();

    const { hapticEnabled, soundEnabled } = useSettingsStore();

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const progress = useSharedValue(1);

    // Timer tick handled globally in _layout.tsx now to prevent desync
    // This effect is no longer needed for timekeeping.

    // Update progress animation
    useEffect(() => {
        if (timerTotalSeconds > 0) {
            progress.value = withTiming(timerSeconds / timerTotalSeconds, {
                duration: 300,
                easing: Easing.linear,
            });
        } else {
            progress.value = 1;
        }
    }, [timerSeconds, timerTotalSeconds]);

    // Handle timer completion - UI Only
    useEffect(() => {
        if (isTimerRunning && timerSeconds <= 0 && timerTotalSeconds > 0) {
            // DO NOT calling stopTimer() here anymore. 
            // We want the 'Ringing' state to persist until user dismisses the Modal.
            // Haptic feedback (immediate)
            if (hapticEnabled) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            onComplete?.();
        }
    }, [timerSeconds, isTimerRunning]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const timerColor = getTimerColor(timerSeconds, timerTotalSeconds, {
        active: colors.timerActive,
        warning: colors.timerWarning,
        complete: colors.timerComplete,
    });

    const percentage = timerTotalSeconds > 0
        ? Math.round((timerSeconds / timerTotalSeconds) * 100)
        : 100;

    const displayTime = timerTotalSeconds > 0 ? timerSeconds : defaultTime;

    return (
        <View style={styles.container}>
            <Svg width={size} height={size} style={styles.svg}>
                {/* Background track */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.timerTrack}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Animated progress */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={timerColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

            {/* Timer display */}
            <View style={[styles.timerContent, { width: size, height: size }]}>
                <Text style={[styles.timerText, { color: colors.text }]}>
                    {formatTime(displayTime)}
                </Text>
                {timerTotalSeconds > 0 && (
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                        {isTimerRunning ? 'REST' : timerSeconds <= 0 ? 'GO!' : 'PAUSED'}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    svg: {
        transform: [{ rotateZ: '0deg' }],
    },
    timerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 64,
        fontWeight: '200',
        fontVariant: ['tabular-nums'],
        letterSpacing: 2,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 4,
        marginTop: 8,
    },
});
