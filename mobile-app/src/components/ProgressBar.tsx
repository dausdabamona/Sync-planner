import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../theme/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export default function ProgressBar({
  progress,
  color = Colors.accent,
  height = 8,
  backgroundColor = 'rgba(0,0,0,0.1)',
}: ProgressBarProps) {
  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <View
        style={[
          styles.fill,
          { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
});
