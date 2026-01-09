import { CircularTimer } from '@/components/timer';
import { useColorScheme } from '@/components/useColorScheme';
import { ExerciseCard, ProgressionBadge, SetLogger } from '@/components/workout';
import Colors from '@/constants/Colors';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { getExercise, getRecommendedRestTime } from '@/utils/restTimeCalculator';
import { FontAwesome } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function WorkoutSessionScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const workout = useWorkoutStore((state) => state.getWorkout(id || ''));
    const exerciseHistory = useWorkoutStore((state) => state.exerciseHistory);

    const {
        activeSession,
        currentExerciseIndex,
        currentSetIndex,
        timerSeconds,
        startSession,
        logSet,
        goToNextExercise,
        goToPreviousExercise,
        setCurrentExercise,
        endSession,
        cancelSession,
        startTimer,
        isSessionComplete,
    } = useSessionStore();

    const { timerAutoStart } = useSettingsStore();

    const [logWeight, setLogWeight] = React.useState(0);
    const [logReps, setLogReps] = React.useState(10);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [showSummary, setShowSummary] = React.useState(false);

    // Start session if not active
    useEffect(() => {
        if (id && !activeSession) {
            startSession(id);
        }
        // CRITICAL: Don't include activeSession in deps to avoid re-starting when ending session
    }, [id]);

    // Current exercise data
    const currentWorkoutExercise = workout?.exercises[currentExerciseIndex];
    const currentExerciseId = currentWorkoutExercise?.exerciseId || '';
    const currentExercise = getExercise(currentExerciseId);

    // Get exercise data from session
    const currentSessionExercise = activeSession?.exercises[currentExerciseIndex];

    // Previous session data for progression insight
    const previousHistory = exerciseHistory[currentExerciseId];

    // Initialize logging state from history
    useEffect(() => {
        const historySet = previousHistory?.lastSets?.[currentSetIndex];
        if (historySet) {
            setLogWeight(historySet.weight);
            setLogReps(historySet.reps);
        }
        // If no history, keep current values (allows carry-over from previous set)
    }, [currentSetIndex, previousHistory]);

    // Rest time calculation
    const restTime = useMemo(() => {
        if (!currentExerciseId || !workout) return 90;
        // Use custom rest time if configured for this exercise
        const customRest = currentWorkoutExercise?.restSeconds;
        if (customRest) return customRest;
        // Otherwise use default based on training focus
        return getRecommendedRestTime(currentExerciseId, workout.trainingFocus);
    }, [currentExerciseId, currentWorkoutExercise?.restSeconds, workout?.trainingFocus]);

    // Set completion
    const completedSets = currentSessionExercise?.sets.length || 0;
    const targetSets = currentWorkoutExercise?.targetSets || 0;
    const isExerciseComplete = completedSets >= targetSets;



    // Auto-advance to next exercise OR Finish workout
    useEffect(() => {
        if (timerSeconds === 0 && isExerciseComplete) {
            const isLastExercise = currentExerciseIndex === (workout?.exercises.length || 0) - 1;

            // Wait a moment before advancing to give user time to see timer completion
            const timeout = setTimeout(() => {
                if (isLastExercise) {
                    setShowSummary(true);
                } else {
                    goToNextExercise();
                }
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [timerSeconds, isExerciseComplete, currentExerciseIndex, workout?.exercises.length, goToNextExercise]);

    const handleEndWorkout = () => {
        if (isSessionComplete()) {
            setShowSummary(true);
        } else {
            Alert.alert(
                'End Workout?',
                'You haven\'t completed all sets. End workout anyway?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'End',
                        style: 'destructive',
                        onPress: () => {
                            endSession();
                            router.replace('/');
                        },
                    },
                ]
            );
        }
    };

    const handleCancelWorkout = () => {
        Alert.alert(
            'Cancel Workout?',
            'Your progress will not be saved.',
            [
                { text: 'Keep Going', style: 'cancel' },
                {
                    text: 'Cancel',
                    style: 'destructive',
                    onPress: () => {
                        cancelSession();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    const handleTimerPress = () => {
        // Haptic feedback
        import('expo-haptics').then(Haptics => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        });

        if (timerSeconds > 0) {
            import('@/stores/sessionStore').then(({ useSessionStore }) => {
                useSessionStore.getState().resetTimer();
            });
        } else {
            // Check if this is the very last set of the workout
            const isLastExercise = currentExerciseIndex === (workout?.exercises.length || 0) - 1;
            const isLastSet = completedSets + 1 >= targetSets;

            logSet(logWeight, logReps);

            if (isLastExercise && isLastSet) {
                // DON'T start the timer for the last set of the last exercise
                // This allows the summary to show immediately (via the useEffect)
            } else {
                startTimer(restTime);
            }
        }
    };

    // calculate summary stats
    const getSummaryStats = () => {
        if (!activeSession || !workout) return [];

        return activeSession.exercises.map((sessionEx, idx) => {
            const workoutEx = workout.exercises[idx];
            const exerciseDef = getExercise(workoutEx.exerciseId);
            const prevHistory = exerciseHistory[workoutEx.exerciseId];

            let weightDiff = 0;
            let repsDiff = 0;

            if (prevHistory && prevHistory.lastSets.length > 0) {
                // Compare average weight/reps or best set? Let's compare max weight used
                const currentMaxWeight = Math.max(...sessionEx.sets.map(s => s.weight), 0);
                const prevMaxWeight = Math.max(...prevHistory.lastSets.map(s => s.weight), 0);
                weightDiff = currentMaxWeight - prevMaxWeight;

                // For reps, maybe total volume? or just average reps?
                // keeping it simple: first set comparison as a proxy
                // Actually, the user asked "if it increased the repetition or the weight"
                // Let's compare the BEST set (max weight)
                const currentBest = sessionEx.sets.reduce((best, curr) => curr.weight > best.weight ? curr : best, { weight: 0, reps: 0 });
                const prevBest = prevHistory.lastSets.reduce((best, curr) => curr.weight > best.weight ? curr : best, { weight: 0, reps: 0 });

                if (currentBest.weight === prevBest.weight) {
                    repsDiff = currentBest.reps - prevBest.reps;
                }
            }

            return {
                name: workoutEx.customName || exerciseDef?.name || 'Exercise',
                sets: sessionEx.sets.length,
                weightDiff,
                repsDiff
            };
        });
    };

    if (showSummary) {
        const stats = getSummaryStats();

        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <FontAwesome name="trophy" size={64} color={colors.warning} />
                        <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.text, marginTop: 16 }}>Congratulations!</Text>
                        <Text style={{ fontSize: 18, color: colors.textSecondary, marginTop: 8 }}>Workout Completed</Text>
                    </View>

                    <View style={{ gap: 16, marginBottom: 32 }}>
                        <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>Session Summary</Text>
                        {stats.map((stat, i) => (
                            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: colors.backgroundSecondary, borderRadius: 12 }}>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{stat.name}</Text>
                                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>{stat.sets} sets completed</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    {stat.weightDiff > 0 && (
                                        <Text style={{ color: colors.success, fontWeight: '600' }}>+{stat.weightDiff}kg</Text>
                                    )}
                                    {stat.repsDiff > 0 && (
                                        <Text style={{ color: colors.success, fontWeight: '600' }}>+{stat.repsDiff} reps</Text>
                                    )}
                                    {stat.weightDiff === 0 && stat.repsDiff === 0 && (
                                        <Text style={{ color: colors.textSecondary }}>-</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>

                    <Pressable
                        style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}
                        onPress={() => {
                            endSession();
                            router.replace('/');
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Finish Workout</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (!workout || !activeSession) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: workout.name,
                    headerTitleAlign: 'center',
                    headerLeft: () => (
                        <Pressable onPress={handleCancelWorkout} style={styles.headerButton}>
                            <FontAwesome name="times" size={20} color={colors.error} />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <Pressable onPress={handleEndWorkout} style={styles.headerButton}>
                            <FontAwesome name="check" size={20} color={colors.success} />
                        </Pressable>
                    ),
                }}
            />

            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Exercise Header */}
                    <View style={[styles.exerciseHeader, { width: '100%', position: 'relative', flexDirection: 'row', justifyContent: 'center' }]}>
                        {/* Info Button (Absolute Left) */}
                        <Pressable
                            style={{ position: 'absolute', left: 20, height: '100%', justifyContent: 'center', padding: 8, zIndex: 10 }}
                            onPress={() => setModalVisible(true)}
                        >
                            <FontAwesome name="info-circle" size={28} color={colors.primary} />
                        </Pressable>

                        {/* Exercise Details (Centered) */}
                        <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.exerciseName, { color: colors.text }]}>
                                {currentWorkoutExercise?.customName || currentExercise?.name || 'Exercise'}
                            </Text>
                            <Text style={[styles.exerciseMeta, { color: colors.textSecondary }]}>
                                {currentExercise?.muscleGroup.replace('_', ' ')} • Set {currentSetIndex + 1} of {targetSets}
                            </Text>
                        </View>
                    </View>

                    {/* Timer - Click to Start/Finish */}
                    <Pressable onPress={handleTimerPress} style={styles.timerContainer}>
                        <CircularTimer
                            size={280}
                            strokeWidth={15}
                            defaultTime={restTime}
                        />
                    </Pressable>

                    {/* Progression Badge - Removed from main screen as requested */}

                    {/* Set Logger Container Removed - functionality moved to modal triggered by info button */}

                    {/* Edit Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                                <View style={styles.modalHeader}>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Set</Text>
                                    <Pressable onPress={() => setModalVisible(false)} style={{ padding: 8 }}>
                                        <FontAwesome name="times" size={20} color={colors.textSecondary} />
                                    </Pressable>
                                </View>

                                {/* Last Session Stats in Modal */}
                                <View style={{ marginBottom: 20, width: '100%' }}>
                                    <ProgressionBadge
                                        exerciseId={currentExerciseId}
                                    />
                                </View>

                                <SetLogger
                                    weight={logWeight}
                                    reps={logReps}
                                    onWeightChange={setLogWeight}
                                    onRepsChange={setLogReps}
                                    previousWeight={previousHistory?.lastSets?.[currentSetIndex]?.weight}
                                    previousReps={previousHistory?.lastSets?.[currentSetIndex]?.reps}
                                />

                                <Pressable
                                    style={[styles.modalDoneBtn, { backgroundColor: colors.primary }]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.modalDoneText}>Done</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>

                    {/* Exercises List */}
                    <View style={styles.cardContainer}>
                        {workout?.exercises.map((exercise, index) => (
                            <View key={index} style={{ marginBottom: 12 }}>
                                <ExerciseCard
                                    workoutExercise={exercise}
                                    completedSets={activeSession?.exercises[index]?.sets || []}
                                    isActive={index === currentExerciseIndex}
                                    onPress={() => setCurrentExercise(index)}
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerButton: {
        padding: 8,
    },
    exerciseHeader: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    exerciseName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    exerciseMeta: {
        fontSize: 14,
        textTransform: 'uppercase',
    },
    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    loggerContainer: {
        paddingHorizontal: 20,
    },
    cardContainer: {
        padding: 20,
    },
    progressionContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    loggerSummaryBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff', // This will be overridden by component style or we can use dynamic style
        // Actually for simplicity let's use a semi-transparent background to blend
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(150,150,150, 0.2)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12, // Reduced from 24 to make modal wider
    },
    modalContent: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalDoneBtn: {
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalDoneText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
