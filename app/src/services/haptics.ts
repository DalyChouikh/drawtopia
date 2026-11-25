import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/settingsStore';

const enabled = () => useSettingsStore.getState().haptics;

/** Small vibrations, all respecting the "Haptics" setting. Failures are ignored (no vibrator). */
export const haptics = {
  tap: () =>
    enabled() && void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  success: () =>
    enabled() &&
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  warning: () =>
    enabled() &&
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
  error: () =>
    enabled() &&
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
};
