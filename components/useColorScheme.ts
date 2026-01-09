import { useSettingsStore } from '@/stores/settingsStore';
import { useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme() {
    const systemColorScheme = _useColorScheme();
    const { theme } = useSettingsStore();

    if (theme === 'light') return 'light';
    if (theme === 'dark') return 'dark';

    return systemColorScheme;
}
