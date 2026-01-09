// Zenith Timer - Create Workout Screen
// Create a new workout plan with exercises

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { Exercise, TrainingFocus, WorkoutExercise } from '@/types';
import { getExercise, searchExercises } from '@/utils/restTimeCalculator';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function CreateWorkoutScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
    const { createWorkout, updateWorkout, getWorkout, addExerciseToWorkout, removeExerciseFromWorkout } = useWorkoutStore();
    const { defaultTrainingFocus } = useSettingsStore();

    // Load existing workout if in edit mode
    const existingWorkout = mode === 'edit' && id ? getWorkout(id) : null;
    const isEditMode = mode === 'edit' && existingWorkout;

    const [name, setName] = useState(existingWorkout?.name || '');
    const [trainingFocus, setTrainingFocus] = useState<TrainingFocus>(existingWorkout?.trainingFocus || defaultTrainingFocus);
    const [exercises, setExercises] = useState<WorkoutExercise[]>(existingWorkout?.exercises || []);

    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingExercise, setEditingExercise] = useState<number | null>(null);

    const filteredExercises = searchExercises(searchQuery);

    const handleAddExercise = (exercise: Exercise) => {
        setExercises([
            ...exercises,
            {
                exerciseId: exercise.id,
                targetSets: 3,
                targetReps: 10,
            },
        ]);
        setShowExercisePicker(false);
        setSearchQuery('');
    };

    const handleRemoveExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleUpdateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
        setExercises(
            exercises.map((ex, i) => (i === index ? { ...ex, ...updates } : ex))
        );
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert('Please enter a workout name');
            return;
        }
        if (exercises.length === 0) {
            alert('Please add at least one exercise');
            return;
        }

        if (isEditMode && id) {
            // Update existing workout
            updateWorkout(id, {
                name: name.trim(),
                trainingFocus,
                exercises,
            });
        } else {
            // Create new workout
            const workoutId = createWorkout(name.trim(), trainingFocus);
            exercises.forEach((ex) => {
                addExerciseToWorkout(workoutId, ex);
            });
        }

        router.back();
    };

    const renderExerciseItem = ({ item }: { item: Exercise }) => (
        <Pressable
            style={[styles.exercisePickerItem, { borderBottomColor: colors.border }]}
            onPress={() => handleAddExercise(item)}
        >
            <View>
                <Text style={[styles.exercisePickerName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.exercisePickerMeta, { color: colors.textSecondary }]}>
                    {item.muscleGroup.replace('_', ' ')} • {item.exerciseType}
                </Text>
            </View>
            <FontAwesome name="plus-circle" size={24} color={colors.primary} />
        </Pressable>
    );

    return (
        <>
            <Stack.Screen
                options={{
                    title: isEditMode ? 'Edit Workout' : 'New Workout',
                    headerTitleAlign: 'center',
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} style={styles.headerButton}>
                            <Text style={{ color: colors.error }}>Cancel</Text>
                        </Pressable>
                    ),
                    headerRight: () => (
                        <Pressable onPress={handleSave} style={styles.headerButton}>
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>Save</Text>
                        </Pressable>
                    ),
                }}
            />

            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Workout Name */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>WORKOUT NAME</Text>
                        <TextInput
                            style={[
                                styles.nameInput,
                                { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
                            ]}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Push Day, Leg Day"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Training Focus */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>TRAINING FOCUS</Text>
                        <View style={[styles.focusContainer, { backgroundColor: colors.card }]}>
                            <Pressable
                                style={[
                                    styles.focusOption,
                                    trainingFocus === 'strength' && { backgroundColor: colors.primary },
                                ]}
                                onPress={() => setTrainingFocus('strength')}
                            >
                                <Text style={styles.focusEmoji}>💪</Text>
                                <Text
                                    style={[
                                        styles.focusTitle,
                                        { color: trainingFocus === 'strength' ? '#FFFFFF' : colors.text },
                                    ]}
                                >
                                    Strength
                                </Text>
                                <Text
                                    style={[
                                        styles.focusDesc,
                                        { color: trainingFocus === 'strength' ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                                    ]}
                                >
                                    Longer rest (2-3 min)
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.focusOption,
                                    trainingFocus === 'metabolic' && { backgroundColor: colors.primary },
                                ]}
                                onPress={() => setTrainingFocus('metabolic')}
                            >
                                <Text style={styles.focusEmoji}>🔥</Text>
                                <Text
                                    style={[
                                        styles.focusTitle,
                                        { color: trainingFocus === 'metabolic' ? '#FFFFFF' : colors.text },
                                    ]}
                                >
                                    Metabolic
                                </Text>
                                <Text
                                    style={[
                                        styles.focusDesc,
                                        { color: trainingFocus === 'metabolic' ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                                    ]}
                                >
                                    Shorter rest (45-90s)
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Exercises */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>EXERCISES</Text>
                            <Text style={[styles.exerciseCount, { color: colors.textMuted }]}>
                                {exercises.length} added
                            </Text>
                        </View>

                        {exercises.map((ex, index) => {
                            const exercise = getExercise(ex.exerciseId);
                            return (
                                <View
                                    key={`${ex.exerciseId}-${index}`}
                                    style={[styles.exerciseItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                                >
                                    <View style={styles.exerciseItemHeader}>
                                        <View style={styles.exerciseItemInfo}>
                                            <TextInput
                                                style={[styles.exerciseItemName, { color: colors.text }]}
                                                value={ex.customName || exercise?.name || ''}
                                                onChangeText={(text) => handleUpdateExercise(index, { customName: text })}
                                                placeholder="Exercise name"
                                                placeholderTextColor={colors.textMuted}
                                            />
                                            <Text style={[styles.exerciseItemMuscle, { color: colors.textSecondary }]}>
                                                {exercise?.muscleGroup.replace('_', ' ')}
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() => handleRemoveExercise(index)}
                                            style={styles.removeButton}
                                        >
                                            <FontAwesome name="trash-o" size={18} color={colors.error} />
                                        </Pressable>
                                    </View>

                                    <View style={styles.setRepRow}>
                                        <View style={styles.setRepInput}>
                                            <Text style={[styles.setRepLabel, { color: colors.textSecondary }]}>Sets</Text>
                                            <View style={styles.setRepControls}>
                                                <Pressable
                                                    style={[styles.setRepButton, { backgroundColor: colors.backgroundSecondary }]}
                                                    onPress={() => handleUpdateExercise(index, { targetSets: Math.max(1, ex.targetSets - 1) })}
                                                >
                                                    <FontAwesome name="minus" size={12} color={colors.textSecondary} />
                                                </Pressable>
                                                <Text style={[styles.setRepValue, { color: colors.text }]}>{ex.targetSets}</Text>
                                                <Pressable
                                                    style={[styles.setRepButton, { backgroundColor: colors.backgroundSecondary }]}
                                                    onPress={() => handleUpdateExercise(index, { targetSets: ex.targetSets + 1 })}
                                                >
                                                    <FontAwesome name="plus" size={12} color={colors.textSecondary} />
                                                </Pressable>
                                            </View>
                                        </View>

                                        <View style={styles.setRepInput}>
                                            <Text style={[styles.setRepLabel, { color: colors.textSecondary }]}>Reps</Text>
                                            <View style={styles.setRepControls}>
                                                <Pressable
                                                    style={[styles.setRepButton, { backgroundColor: colors.backgroundSecondary }]}
                                                    onPress={() => handleUpdateExercise(index, { targetReps: Math.max(1, ex.targetReps - 1) })}
                                                >
                                                    <FontAwesome name="minus" size={12} color={colors.textSecondary} />
                                                </Pressable>
                                                <Text style={[styles.setRepValue, { color: colors.text }]}>{ex.targetReps}</Text>
                                                <Pressable
                                                    style={[styles.setRepButton, { backgroundColor: colors.backgroundSecondary }]}
                                                    onPress={() => handleUpdateExercise(index, { targetReps: ex.targetReps + 1 })}
                                                >
                                                    <FontAwesome name="plus" size={12} color={colors.textSecondary} />
                                                </Pressable>
                                            </View>

                                            <View style={styles.setRepInput}>
                                                <Text style={[styles.setRepLabel, { color: colors.textSecondary }]}>Rest (s)</Text>
                                                <View style={styles.setRepControls}>
                                                    <Pressable
                                                        style={[styles.setRepButton, { backgroundColor: colors.backgroundSecondary }]}
                                                        onPress={() => {
                                                            const currentRest = ex.restSeconds || exercise?.defaultRestSeconds[trainingFocus] || 90;
                                                            handleUpdateExercise(index, { restSeconds: Math.max(15, currentRest - 15) });
                                                        }}
                                                    >
                                                        <FontAwesome name="minus" size={12} color={colors.textSecondary} />
                                                    </Pressable>
                                                    <Text style={[styles.setRepValue, { color: colors.text }]}>
                                                        {ex.restSeconds || exercise?.defaultRestSeconds[trainingFocus] || 90}
                                                    </Text>
                                                    <Pressable
                                                        style={[styles.setRepButton, { backgroundColor: colors.backgroundSecondary }]}
                                                        onPress={() => {
                                                            const currentRest = ex.restSeconds || exercise?.defaultRestSeconds[trainingFocus] || 90;
                                                            handleUpdateExercise(index, { restSeconds: currentRest + 15 });
                                                        }}
                                                    >
                                                        <FontAwesome name="plus" size={12} color={colors.textSecondary} />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        <Pressable
                            style={[styles.addExerciseButton, { borderColor: colors.border }]}
                            onPress={() => setShowExercisePicker(true)}
                        >
                            <FontAwesome name="plus" size={18} color={colors.primary} />
                            <Text style={[styles.addExerciseText, { color: colors.primary }]}>Add Exercise</Text>
                        </Pressable>
                    </View>
                </ScrollView>

                {/* Exercise Picker Modal */}
                <Modal
                    visible={showExercisePicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Pressable onPress={() => setShowExercisePicker(false)}>
                                <Text style={{ color: colors.primary }}>Done</Text>
                            </Pressable>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Exercise</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                            <FontAwesome name="search" size={16} color={colors.textMuted} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search exercises..."
                                placeholderTextColor={colors.textMuted}
                                autoFocus
                            />
                            {searchQuery.length > 0 && (
                                <Pressable onPress={() => setSearchQuery('')}>
                                    <FontAwesome name="times-circle" size={16} color={colors.textMuted} />
                                </Pressable>
                            )}
                        </View>

                        <FlatList
                            data={filteredExercises}
                            renderItem={renderExerciseItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.exerciseList}
                        />
                    </SafeAreaView>
                </Modal>
            </SafeAreaView>
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
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
    },
    nameInput: {
        fontSize: 18,
        fontWeight: '500',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    focusContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
    },
    focusOption: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        gap: 4,
    },
    focusEmoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    focusTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    focusDesc: {
        fontSize: 12,
    },
    exerciseCount: {
        fontSize: 13,
    },
    exerciseItem: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    exerciseItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    exerciseItemInfo: {
        flex: 1,
    },
    exerciseItemName: {
        fontSize: 16,
        fontWeight: '600',
    },
    exerciseItemMuscle: {
        fontSize: 13,
        marginTop: 2,
    },
    removeButton: {
        padding: 4,
    },
    setRepRow: {
        flexDirection: 'row',
        gap: 16,
    },
    setRepInput: {
        flex: 1,
    },
    setRepLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8,
    },
    setRepControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    setRepButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setRepValue: {
        fontSize: 18,
        fontWeight: '600',
        minWidth: 30,
        textAlign: 'center',
    },
    addExerciseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    addExerciseText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        padding: 12,
        borderRadius: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    exerciseList: {
        paddingHorizontal: 16,
    },
    exercisePickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    exercisePickerName: {
        fontSize: 16,
        fontWeight: '500',
    },
    exercisePickerMeta: {
        fontSize: 13,
        marginTop: 2,
    },
});
