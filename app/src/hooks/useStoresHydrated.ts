import { useSyncExternalStore } from 'react';
import { useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';
import { useSettingsStore } from '../stores/settingsStore';

const persistedStores = [useProfileStore, useSettingsStore, useSessionStore];

const allHydrated = () => persistedStores.every((store) => store.persist.hasHydrated());

const subscribe = (onChange: () => void) => {
  const unsubscribes = persistedStores.map((store) => store.persist.onFinishHydration(onChange));
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};

/**
 * True once every persisted store has finished reading AsyncStorage.
 * Until then the splash screen stays up, so no screen ever shows default values by mistake.
 */
export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribe, allHydrated);
}
