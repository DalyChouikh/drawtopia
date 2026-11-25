import { type Href, router } from 'expo-router';
import { useProfileStore } from '../../stores/profileStore';

/**
 * Runs an action that needs a nickname. Without a profile, opens the profile screen
 * first and comes back to `next` after saving.
 */
export function useProfileGate() {
  const hasProfile = useProfileStore((s) => s.nickname !== '');
  return (next: Href, action?: () => void) => {
    if (!hasProfile) {
      router.push({ pathname: '/profile', params: { next: String(next) } });
      return;
    }
    if (action) action();
    else router.push(next);
  };
}
