import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/tokens';

const GRID = 22;

/** Graph-paper background drawn once with Skia (one path, so it costs a single draw call). */
export function PaperBackground() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const grid = useMemo(() => {
    const builder = Skia.PathBuilder.Make();
    for (let x = GRID; x < size.width; x += GRID) {
      builder.moveTo(x, 0);
      builder.lineTo(x, size.height);
    }
    for (let y = GRID; y < size.height; y += GRID) {
      builder.moveTo(0, y);
      builder.lineTo(size.width, y);
    }
    return builder.detach();
  }, [size]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View style={styles.fill} onLayout={onLayout} pointerEvents="none">
      <Canvas style={styles.fill}>
        <Path path={grid} color={colors.paperLine} style="stroke" strokeWidth={1} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.paper,
  },
});
