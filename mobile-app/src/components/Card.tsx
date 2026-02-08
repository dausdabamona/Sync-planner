import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: [string, string];
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
