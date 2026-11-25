import { AVATAR_COLORS, type AvatarColor, type PlayerProfile } from '@drawtopia/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistentStorage, storageKey } from './storage';

interface ProfileState {
  nickname: string;
  color: AvatarColor;
  /** Saves an already validated profile. */
  saveProfile: (profile: PlayerProfile) => void;
}

/** The player's nickname and colour. Persisted: survives closing the app. */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      nickname: '',
      color: AVATAR_COLORS[1],
      saveProfile: ({ nickname, color }) => set({ nickname, color }),
    }),
    { name: storageKey('profile'), storage: persistentStorage, version: 1 },
  ),
);

/** The profile to send to the server, or `null` if the player has not picked a nickname yet. */
export function currentProfile(): PlayerProfile | null {
  const { nickname, color } = useProfileStore.getState();
  return nickname ? { nickname, color } : null;
}
