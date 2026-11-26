import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/settingsStore';
import { playSound } from './sounds';

const enabled = () => useSettingsStore.getState().haptics;

/**
 * Small vibrations, all respecting the "Haptics" setting. Failures are ignored (no vibrator).
 * Taps and errors also play their sound (which follows the "Sound" setting).
 */
export const haptics = {
  tap: () => {
    playSound('tap');
    if (enabled()) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  success: () =>
    enabled() &&
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  warning: () =>
    enabled() &&
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
  error: () => {
    playSound('error');
    if (enabled())
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
