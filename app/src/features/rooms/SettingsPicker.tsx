import {
  type GameMode,
  MAX_ROUNDS,
  MIN_ROUNDS,
  ROUND_DURATIONS,
  type RoomSettings,
} from '@drawtopia/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { Chip } from '../../components/ui/Chip';
import { InkCard } from '../../components/ui/InkCard';
import { Txt } from '../../components/ui/Txt';
import { haptics } from '../../services/haptics';
import { colors, ink } from '../../theme/tokens';
import { GAME_MODES } from './modes';

interface SettingsPickerProps {
  value: RoomSettings;
  onChange: (patch: Partial<RoomSettings>) => void;
  /** Read-only for players who are not the host. */
  editable?: boolean;
  showVisibility?: boolean;
}

const ROUND_OPTIONS = Array.from({ length: MAX_ROUNDS - MIN_ROUNDS + 1 }, (_, i) => MIN_ROUNDS + i);

/** Mode, visibility, round duration and number of rounds. Used by Create and by the lobby. */
export function SettingsPicker({
  value,
  onChange,
  editable = true,
  showVisibility = true,
}: SettingsPickerProps) {
  return (
    <View style={styles.stack}>
      <Txt variant="label">Game mode</Txt>
      {(Object.keys(GAME_MODES) as GameMode[]).map((mode) => {
        const info = GAME_MODES[mode];
        const selected = value.mode === mode;
        return (
          <Pressable
            key={mode}
            disabled={!editable}
            onPress={() => {
              haptics.tap();
              onChange({ mode });
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: !editable }}
            accessibilityLabel={`${info.label}. ${info.tagline}`}
          >
            <InkCard color={selected ? info.color : 'white'} shadow={selected}>
              <View style={styles.modeRow}>
                <View style={[styles.radio, selected && styles.radioOn]} />
                <View style={styles.flex}>
                  <Txt variant="heading">{info.label}</Txt>
                  <Txt variant="caption" color={colors.ink}>
                    {info.tagline}
                  </Txt>
                </View>
              </View>
            </InkCard>
          </Pressable>
        );
      })}

      {showVisibility && (
        <Row label="Room">
          <Chip
            label="Private"
            selected={value.visibility === 'private'}
            disabled={!editable}
            onPress={() => onChange({ visibility: 'private' })}
          />
          <Chip
            label="Public"
            selected={value.visibility === 'public'}
            disabled={!editable}
            onPress={() => onChange({ visibility: 'public' })}
          />
        </Row>
      )}

      <Row label={value.mode === 'draw-guess' ? 'Seconds per drawing' : 'Seconds per step'}>
        {ROUND_DURATIONS.map((d) => (
          <Chip
            key={d}
            label={`${d}s`}
            selected={value.roundDuration === d}
            disabled={!editable}
            onPress={() => onChange({ roundDuration: d })}
          />
        ))}
      </Row>

      {value.mode === 'draw-guess' && (
        <Row label="Rounds (each player draws once per round)">
          {ROUND_OPTIONS.map((r) => (
            <Chip
              key={r}
              label={String(r)}
              selected={value.rounds === r}
              disabled={!editable}
              onPress={() => onChange({ rounds: r })}
            />
          ))}
        </Row>
      )}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.rowBlock}>
      <Txt variant="label">{label}</Txt>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  flex: { flex: 1 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: ink.border,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  radioOn: { backgroundColor: colors.ink },
  rowBlock: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
