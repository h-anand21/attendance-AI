import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borders } from '../../theme';

interface BrutalBadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

export function BrutalBadge({ text, variant = 'default', style }: BrutalBadgeProps) {
  const getBgColor = () => {
    switch (variant) {
      case 'success': return colors.successBg;
      case 'warning': return colors.warningBg;
      case 'error': return colors.errorBg;
      case 'info': return '#DBEAFE';
      default: return colors.surface;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success': return '#166534';
      case 'warning': return '#92400E';
      case 'error': return '#991B1B';
      case 'info': return '#1E40AF';
      default: return colors.black;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'success': return colors.success;
      case 'warning': return colors.yellow;
      case 'error': return colors.error;
      case 'info': return colors.info;
      default: return colors.black;
    }
  };

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: getBgColor(),
        borderColor: getBorderColor(),
      },
      style,
    ]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{text}</Text>
    </View>
  );
}

// Dot pattern decoration component
export function DotPattern({ size = 40, style }: { size?: number; style?: ViewStyle }) {
  const dots = [];
  const dotSize = 3;
  const gap = 8;
  const cols = Math.floor(size / gap);
  const rows = Math.floor(size / gap);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <View
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: c * gap,
            top: r * gap,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colors.black,
            opacity: 0.2,
          }}
        />
      );
    }
  }

  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      {dots}
    </View>
  );
}

// Geometric decorative square
export function GeometricSquare({ 
  size = 16, 
  color = colors.orange, 
  style 
}: { 
  size?: number; 
  color?: string; 
  style?: ViewStyle 
}) {
  return (
    <View style={[
      { width: size, height: size, backgroundColor: color },
      style,
    ]} />
  );
}

// Diagonal stripes decoration
export function DiagonalStripes({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.stripes, style]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stripe,
            { left: i * 8, transform: [{ rotate: '45deg' }] },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stripes: {
    width: 60,
    height: 20,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  stripe: {
    position: 'absolute',
    width: 4,
    height: 40,
    backgroundColor: colors.black,
    opacity: 0.15,
  },
});
