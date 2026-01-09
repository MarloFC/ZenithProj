// Zenith Timer - Home Screen
// Workout list and quick actions

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSessionStore } from '@/stores/sessionStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { FontAwesome } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const workouts = useWorkoutStore((state) => state.workouts);
  const deleteWorkout = useWorkoutStore((state) => state.deleteWorkout);
  const activeSession = useSessionStore((state) => state.activeSession);
  const { startSession } = useSessionStore();

  const handleStartWorkout = (workoutId: string) => {
    startSession(workoutId);
    router.push(`/workout/${workoutId}`);
  };

  const handleContinueSession = () => {
    if (activeSession) {
      router.push(`/workout/${activeSession.workoutPlanId}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.secondary }]}>
            ZENITH TIMER
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Your Workouts
          </Text>
        </View>

        {/* Active Session Banner */}
        {activeSession && (
          <Pressable
            style={[styles.activeSessionBanner, { backgroundColor: colors.primary }]}
            onPress={handleContinueSession}
          >
            <View style={styles.bannerContent}>
              <FontAwesome name="play-circle" size={24} color="#FFFFFF" />
              <View>
                <Text style={styles.bannerTitle}>Session in Progress</Text>
                <Text style={styles.bannerSubtitle}>Tap to continue</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={18} color="#FFFFFF" />
          </Pressable>
        )}


        {/* Quick Timer Button */}
        <Pressable
          style={[styles.quickTimerButton, { backgroundColor: '#22D3EE', borderColor: '#22D3EE' }]}
          onPress={() => router.push('/custom-timer')}
        >
          <FontAwesome name="clock-o" size={24} color="#FFFFFF" />
          <View style={styles.quickTimerContent}>
            <Text style={[styles.quickTimerTitle, { color: '#FFFFFF' }]}>Quick Timer</Text>
            <Text style={[styles.quickTimerSubtitle, { color: '#FFFFFF' }]}>Start a timer without exercises</Text>
          </View>
          <FontAwesome name="chevron-right" size={18} color="#FFFFFF" />
        </Pressable>


        {/* Workout List */}
        {workouts.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <FontAwesome name="plus-circle" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Workouts Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create your first workout plan to get started
            </Text>
            <Link href="/create-workout" asChild>
              <Pressable style={[styles.createButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.createButtonText}>Create Workout</Text>
              </Pressable>
            </Link>
          </View>
        ) : (
          <View style={styles.workoutList}>
            {workouts.map((workout) => (
              <Swipeable
                key={workout.id}
                friction={2}
                rightThreshold={40}
                renderRightActions={(progress, dragX) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                    <Pressable
                      style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => router.push(`/create-workout?id=${workout.id}&mode=edit`)}
                    >
                      <FontAwesome name="pencil" size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, { backgroundColor: '#FEE2E2', marginLeft: 8 }]}
                      onPress={() => deleteWorkout(workout.id)}
                    >
                      <FontAwesome name="trash-o" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                )}
              >
                <Pressable
                  style={[styles.workoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleStartWorkout(workout.id)}
                >
                  <View style={styles.workoutInfo}>
                    <Text style={[styles.workoutName, { color: colors.text }]}>
                      {workout.name}
                    </Text>
                    <Text style={[styles.workoutMeta, { color: colors.textSecondary }]}>
                      {workout.exercises.length} exercises • {workout.trainingFocus === 'strength' ? '💪 Strength' : '🔥 Metabolic'}
                    </Text>
                  </View>
                  <View style={[styles.startButton, { backgroundColor: colors.primary }]}>
                    <FontAwesome name="play" size={14} color="#FFFFFF" />
                  </View>
                </Pressable>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button - Always visible */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/create-workout')}
      >
        <FontAwesome name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  activeSessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  quickTimerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  quickTimerContent: {
    flex: 1,
  },
  quickTimerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickTimerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutList: {
    gap: 12,
  },
  workoutCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteButton: {
    padding: 12,
  },
  editButton: {
    padding: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 13,
  },
  startButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
