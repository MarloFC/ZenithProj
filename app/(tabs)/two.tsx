// Zenith Timer - Settings Screen

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSettingsStore } from '@/stores/settingsStore';
import type { TrainingFocus } from '@/types';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const {
    defaultTrainingFocus,
    weightUnit,
    soundEnabled,
    hapticEnabled,
    timerAutoStart,
    setTrainingFocus,
    setWeightUnit,
    setSoundEnabled,
    setHapticEnabled,
    setTimerAutoStart,
  } = useSettingsStore();

  const SettingRow = ({
    icon,
    title,
    subtitle,
    children,
    vertical = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    vertical?: boolean;
  }) => (
    <View style={[
      styles.settingRow,
      { borderBottomColor: colors.border },
      vertical && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }
    ]}>
      <View style={[styles.settingInfo, vertical && { width: '100%' }]}>
        <FontAwesome name={icon as any} size={18} color={colors.primary} style={styles.settingIcon} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={vertical && { width: '100%', alignItems: 'flex-end' }}>
        {children}
      </View>
    </View>
  );

  const ToggleButton = ({
    options,
    value,
    onChange,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: any) => void;
  }) => (
    <View style={[styles.toggleContainer, { backgroundColor: colors.backgroundSecondary }]}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={[
            styles.toggleOption,
            value === option.value && { backgroundColor: colors.primary },
          ]}
          onPress={() => onChange(option.value)}
        >
          <Text
            style={[
              styles.toggleText,
              { color: value === option.value ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>

          {/* Theme toggle can also use vertical layout if screen is narrow, but typically 3 small buttons fit.
              Let's keep it horizontal for now unless issues arise. */}
          <SettingRow icon="moon-o" title="Theme">
            <ToggleButton
              options={[
                { value: 'system', label: 'Auto' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              value={useSettingsStore(s => s.theme || 'system')}
              onChange={(v: 'system' | 'light' | 'dark') => useSettingsStore.getState().setTheme(v)}
            />
          </SettingRow>
        </View>

        {/* Training Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            TRAINING
          </Text>

          <SettingRow
            icon="bullseye"
            title="Default Training Focus"
            subtitle="Affects suggested rest times"
            vertical={true}
          >
            <ToggleButton
              options={[
                { value: 'strength', label: '💪 Strength' },
                { value: 'metabolic', label: '🔥 Metabolic' },
              ]}
              value={defaultTrainingFocus}
              onChange={(v: TrainingFocus) => setTrainingFocus(v)}
            />
          </SettingRow>

          <SettingRow icon="balance-scale" title="Weight Unit">
            <ToggleButton
              options={[
                { value: 'kg', label: 'KG' },
                { value: 'lbs', label: 'LBS' },
              ]}
              value={weightUnit}
              onChange={(v: 'kg' | 'lbs') => setWeightUnit(v)}
            />
          </SettingRow>
        </View>

        {/* Timer Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            TIMER
          </Text>

          <SettingRow
            icon="clock-o"
            title="Auto-Start Timer"
            subtitle="Start timer after logging set"
          >
            <Switch
              value={timerAutoStart}
              onValueChange={setTimerAutoStart}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </SettingRow>
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            NOTIFICATIONS
          </Text>

          <SettingRow icon="volume-up" title="Sound">
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </SettingRow>

          <SettingRow icon="hand-paper-o" title="Haptic Feedback">
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </SettingRow>

          {/* New Vibration Pattern Toggle */}
          <SettingRow
            icon="mobile"
            title="Vibration Style"
            subtitle="Continuous vibrates until you stop it"
            vertical={true}
          >
            <ToggleButton
              options={[
                { value: 'single', label: 'Single' },
                { value: 'continuous', label: 'Continuous' },
              ]}
              value={useSettingsStore(s => s.vibrationPattern || 'single')}
              onChange={(v: 'single' | 'continuous') => useSettingsStore.getState().setVibrationPattern(v)}
            />
          </SettingRow>
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>

          <View style={styles.aboutContent}>
            <Text style={[styles.appName, { color: colors.text }]}>Zenith Timer</Text>
            <Text style={[styles.appVersion, { color: colors.textMuted }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
              The Intelligent Workout Companion
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    padding: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  settingTitle: {
    fontSize: 16,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  aboutContent: {
    alignItems: 'center',
    padding: 24,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
  },
  appVersion: {
    fontSize: 13,
    marginTop: 4,
  },
  appTagline: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
