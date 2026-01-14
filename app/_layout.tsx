// Zenith Timer - Root Layout
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import 'react-native-reanimated';

import { TimerFinishedModal } from '@/components/TimerFinishedModal'; // Import Modal
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSessionStore } from '@/stores/sessionStore';

import { useUIStore } from '@/stores/uiStore'; // Import Store
import { LogBox } from 'react-native';

// Ignore specific warnings/errors that are not relevant to our implementation
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'The "redirect" query parameter is deprecated',
]);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Configure notifications to appear even when app is active
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);


  const { showTimerAlert } = useUIStore();
  const { stopTimer } = useSessionStore();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setupNotifications();
    }
  }, [loaded]);

  const setupNotifications = async () => {
    // 1. Request Permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    // 2. Set Category for "Stop" Action
    await Notifications.setNotificationCategoryAsync('timer-end', [
      {
        identifier: 'stop-timer',
        buttonTitle: 'Stop Timer',
        options: {
          opensAppToForeground: true, // Bring app to front to show the modal
        },
      },
    ]);

    // 3. Android Channel Setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('timer-channel', {
        name: 'Timer Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default', // Explicitly request default sound
      });

      // Channel 2: Continuous Vibration (Long Pattern)
      // Pattern: 0ms wait, 1000ms vibe, 1000ms pause, repeat... (approx 30s total)
      const continuousPattern = Array(30).fill([1000, 1000]).flat();
      await Notifications.setNotificationChannelAsync('timer-channel-continuous', {
        name: 'Continuous Timer Alarm',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, ...continuousPattern],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }
  };

  // 4. Handle Notification Interactions
  useEffect(() => {
    // When notification is received while app is explicitly in foreground
    const subscription1 = Notifications.addNotificationReceivedListener(notification => {
      // Do nothing - just let the system banner show. 
      // User requested NO POPUP when in app.
    });

    // When user taps the notification or uses an action
    const subscription2 = Notifications.addNotificationResponseReceivedListener(response => {
      const actionId = response.actionIdentifier;

      if (actionId === 'stop-timer') {
        // User clicked "Stop" button
        stopTimer();
      } else if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        // User tapped the notification body
        showTimerAlert();
      }
    });

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  // 5. Global Store Subscription removed to prevent in-app modal popping up automatically
  // The user only wants the modal if coming from a background notification interaction.

  // 5. Global Timer Tick & AppState Sync
  // This replaces component-specific intervals to ensure timer runs globally
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        const { tickTimer, isTimerRunning, timerSeconds, timerTotalSeconds } = useSessionStore.getState();

        // 1. Sync timer immediately
        if (isTimerRunning) {
          tickTimer();
        }

        // 2. Check if timer finished while in background (or just finished)
        // If we open the app and the timer is done, show the alert!
        if (timerTotalSeconds > 0 && timerSeconds === 0) {
          showTimerAlert();
        }
      }
    });

    // Global Interval
    const intervalId = setInterval(() => {
      const { isTimerRunning, tickTimer } = useSessionStore.getState();
      if (isTimerRunning) {
        tickTimer();
      }
    }, 1000);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
      {/* Global Timer Alert */}
      <TimerFinishedModal />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Custom theme with Zenith Timer colors
  const ZenithDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.card,
      border: colors.border,
      primary: colors.primary,
      text: colors.text,
    },
  };

  const ZenithLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.card,
      border: colors.border,
      primary: colors.primary,
      text: colors.text,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? ZenithDarkTheme : ZenithLightTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="custom-timer"
          options={{
            title: 'Quick Timer',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="workout/[id]"
          options={{
            title: 'Workout',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="create-workout"
          options={{
            title: 'New Workout',
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

