import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** All persisted stores save to AsyncStorage under a "drawtopia." prefix. */
export const persistentStorage = createJSONStorage(() => AsyncStorage);

export const storageKey = (name: string) => `drawtopia.${name}`;
