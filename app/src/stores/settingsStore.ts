import Constants from 'expo-constants';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistentStorage, storageKey } from './storage';

const SERVER_PORT = 3001;

/**
 * Default game server: in development, the computer running Metro (same machine as the
 * server, reachable from the emulator and from phones on the same Wi-Fi).
 * Otherwise the deployed server URL from app.json `extra.serverUrl`.
 */
export function defaultServerUrl(): string {
  const configured = Constants.expoConfig?.extra?.serverUrl as string | undefined;
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (__DEV__ && devHost) return `http://${devHost}:${SERVER_PORT}`;
  return configured ?? `http://localhost:${SERVER_PORT}`;
}

interface SettingsState {
  /** Empty string = use the default server. */
  customServerUrl: string;
  haptics: boolean;
  setCustomServerUrl: (url: string) => void;
  setHaptics: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      customServerUrl: '',
      haptics: true,
      setCustomServerUrl: (customServerUrl) => set({ customServerUrl }),
      setHaptics: (haptics) => set({ haptics }),
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
