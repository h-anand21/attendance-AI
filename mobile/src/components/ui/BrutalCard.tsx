import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, shadows, borders } from '../../theme';

interface BrutalCardProps extends ViewProps {
  variant?: 'default' | 'yellow' | 'orange' | 'outlined';
  shadowSize?: 'small' | 'medium' | 'large';
}

export function BrutalCard({ 
  children, 
  style, 
  variant = 'default',
  shadowSize = 'medium',
  ...props 
}: BrutalCardProps) {
  const bgColor = variant === 'yellow' ? colors.yellow 
    : variant === 'orange' ? colors.orange 
    : colors.white;

  const shadowStyle = shadowSize === 'small' ? shadows.brutalSmall 
    : shadowSize === 'large' ? shadows.brutalLarge 
    : shadows.brutal;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bgColor },
        shadowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...borders.thick,
    borderRadius: 4,
    padding: 16,
    backgroundColor: colors.white,
  },
});
