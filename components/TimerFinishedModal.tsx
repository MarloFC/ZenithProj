import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSessionStore } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';
import { FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

// You would ideally bundle a sound file like require('@/assets/sounds/alarm.mp3')
// For now, using a standard beep URL or we can try to use a bundled asset if available
// Let's use a standard generic beep for the example if we don't have asssets
const ALARM_SOUND_URI = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export function TimerFinishedModal() {
    const { isTimerAlertVisible, hideTimerAlert } = useUIStore();
    const { resetTimer } = useSessionStore();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    // const [sound, setSound] = useState<Audio.Sound | null>(null);

    // Sound playback removed as per user request (stop sound when app is open)
    // The "Time's Up" modal is now visual-only (+ haptics from CircularTimer)
    /*
    useEffect(() => {
        let soundObject: Audio.Sound | null = null;
        // ... (sound logic removed)
    }, [isTimerAlertVisible]);
    */

    const handleStop = async () => {
        // Dismiss the modal first - this triggers the useEffect cleanup above
        hideTimerAlert();

        // Reset the timer state (clears totalSeconds, preventing re-trigger of alert)
        resetTimer();

        // Cancel any pending notifications (just in case)
        await Notifications.cancelAllScheduledNotificationsAsync();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isTimerAlertVisible}
            onRequestClose={handleStop}
            statusBarTranslucent
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: colors.background }]}>

                    <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                        <FontAwesome name="bell" size={40} color="#FFFFFF" />
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>TIME'S UP!</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                        Your rest period is over.
                    </Text>

                    <Pressable
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleStop}
                    >
                        <Text style={styles.buttonText}>I'm Ready!</Text>
                    </Pressable>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark background for focus
        padding: 20,
    },
    modalView: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    button: {
        width: '100%',
        borderRadius: 16,
        padding: 18,
        elevation: 2,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
