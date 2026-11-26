import Constants from 'expo-constants';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistentStorage, storageKey } from './storage';

const SERVER_PORT = 3001;

/** The deployed server (Render), from app.json `extra.serverUrl`. */
export const ONLINE_SERVER_URL = Constants.expoConfig?.extra?.serverUrl as string | undefined;

/** The game server running on the computer that serves the app in development (Metro host). */
export function lanServerUrl(): string {
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${devHost}:${SERVER_PORT}`;
}

/**
 * Default game server: in development, the computer running Metro (same machine as the
 * server, reachable from the emulator and from phones on the same Wi-Fi).
 * In a real build, the deployed online server.
 */
export function defaultServerUrl(): string {
  if (__DEV__ && Constants.expoConfig?.hostUri) return lanServerUrl();
  return ONLINE_SERVER_URL ?? lanServerUrl();
}

interface SettingsState {
  /** Empty string = use the default server. */
  customServerUrl: string;
  haptics: boolean;
  /** Sound effects (taps, guesses, timer). */
  sound: boolean;
  /** Background music loop. */
  music: boolean;
  setCustomServerUrl: (url: string) => void;
  setHaptics: (enabled: boolean) => void;
  setSound: (enabled: boolean) => void;
  setMusic: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      customServerUrl: '',
      haptics: true,
      sound: true,
      music: true,
      setCustomServerUrl: (customServerUrl) => set({ customServerUrl }),
      setHaptics: (haptics) => set({ haptics }),
      setSound: (sound) => set({ sound }),
      setMusic: (music) => set({ music }),
    }),
    { name: storageKey('settings'), storage: persistentStorage, version: 1 },
  ),
);

export const useServerUrl = () => useSettingsStore((s) => s.customServerUrl || defaultServerUrl());
export const getServerUrl = () => useSettingsStore.getState().customServerUrl || defaultServerUrl();

/** `http(s)://host[:port]` with nothing after it. */
const SERVER_URL_PATTERN = /^https?:\/\/[a-z0-9.-]+(:\d{1,5})?\/?$/i;

/** Returns an error message, or `null` when the URL is acceptable. Empty means "default". */
export function validateServerUrl(url: string): string | null {
  const trimmed = url.trim();
  if (trimmed === '') return null;
  return SERVER_URL_PATTERN.test(trimmed) ? null : 'Use a URL like http://192.168.1.20:3001';
}
