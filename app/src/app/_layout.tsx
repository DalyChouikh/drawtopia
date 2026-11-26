import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastHost } from '../components/ui/ToastHost';
import { useStoresHydrated } from '../hooks/useStoresHydrated';
import { connect } from '../services/gameClient';
import { initGameSounds } from '../services/gameSounds';
import { initSounds } from '../services/sounds';
import { useServerUrl } from '../stores/settingsStore';
import { colors } from '../theme/tokens';

// Keep the splash screen until fonts and saved data are loaded.
void SplashScreen.preventAutoHideAsync();

/**
 * App entry point (expo-router root layout):
 * 1. load fonts, 2. read saved profile/settings/session, 3. connect to the game server and
 * start the sounds, 4. hide the splash and render the navigation stack.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PatrickHand_400Regular,
    PermanentMarker_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const hydrated = useStoresHydrated();
  const serverUrl = useServerUrl();
  const ready = (fontsLoaded || fontError !== null) && hydrated;

  useEffect(() => {
    if (hydrated) connect(serverUrl);
  }, [hydrated, serverUrl]);

  // Sounds read the saved Sound/Music settings, so they start after hydration.
  useEffect(() => {
    if (!hydrated) return;
    initSounds();
    initGameSounds();
  }, [hydrated]);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="game/[code]" options={{ gestureEnabled: false }} />
        </Stack>
        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
