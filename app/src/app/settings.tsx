import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Chip } from '../components/ui/Chip';
import { InkButton } from '../components/ui/InkButton';
import { InkCard } from '../components/ui/InkCard';
import { InkInput } from '../components/ui/InkInput';
import { Screen } from '../components/ui/Screen';
import { Txt } from '../components/ui/Txt';
import { useConnectionStore } from '../services/connectionStore';
import { haptics } from '../services/haptics';
import {
  defaultServerUrl,
  lanServerUrl,
  ONLINE_SERVER_URL,
  useSettingsStore,
  validateServerUrl,
} from '../stores/settingsStore';
import { showToast } from '../stores/toastStore';
import { colors } from '../theme/tokens';

const HEALTH_TIMEOUT_MS = 4000;

/** Calls the server's /health endpoint; true if it answers in time. */
async function pingServer(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export default function SettingsScreen() {
  const settings = useSettingsStore();
  const status = useConnectionStore((s) => s.status);
  const [url, setUrl] = useState(settings.customServerUrl);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const effectiveUrl = url.trim() || defaultServerUrl();
  const onlineUrl = ONLINE_SERVER_URL;

  const save = () => {
    const problem = validateServerUrl(url);
    if (problem) {
      setError(problem);
      haptics.error();
      return;
    }
    settings.setCustomServerUrl(url.trim().replace(/\/$/, ''));
    showToast('Settings saved', 'success');
  };

  const test = async () => {
    const problem = validateServerUrl(url);
    if (problem) {
      setError(problem);
      return;
    }
    setTesting(true);
    const reachable = await pingServer(effectiveUrl);
    setTesting(false);
    showToast(
      reachable ? 'Server reachable' : `No answer from ${effectiveUrl}`,
      reachable ? 'success' : 'error',
    );
  };

  return (
    <Screen title="Settings">
      <InkCard>
        <View style={styles.gap}>
          <InkInput
            label="Game server"
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              if (error) setError(null);
            }}
            placeholder={defaultServerUrl()}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            error={error}
            hint="Leave empty to use the default server."
          />
          <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Quick pick">
            {onlineUrl && (
              <Chip
                label="Online server"
                selected={effectiveUrl === onlineUrl}
                onPress={() => {
                  setUrl(onlineUrl);
                  setError(null);
                }}
              />
            )}
            <Chip
              label="This computer"
              selected={effectiveUrl === lanServerUrl()}
              onPress={() => {
                setUrl(lanServerUrl() === defaultServerUrl() ? '' : lanServerUrl());
                setError(null);
              }}
            />
          </View>
          <Txt variant="caption">
            Status:{' '}
            {status === 'online'
              ? 'connected'
              : status === 'connecting'
                ? 'connecting…'
                : 'offline'}
          </Txt>
          <View style={styles.row}>
            <InkButton label="Test" onPress={test} loading={testing} style={styles.flex} />
            <InkButton label="Save" color="lime" onPress={save} style={styles.flex} />
          </View>
        </View>
      </InkCard>

      <InkCard>
        <View style={styles.switchRow}>
          <View style={styles.flex}>
            <Txt variant="heading">Haptics</Txt>
            <Txt variant="caption">Small vibrations on taps and guesses.</Txt>
          </View>
          <Switch
            value={settings.haptics}
            onValueChange={settings.setHaptics}
            trackColor={{ true: colors.lime, false: colors.paperLine }}
            thumbColor={colors.ink}
            accessibilityLabel="Haptics"
          />
        </View>
      </InkCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
