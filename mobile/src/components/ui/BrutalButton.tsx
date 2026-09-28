import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { colors, shadows, borders, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface BrutalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  showArrow?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function BrutalButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  showArrow = false,
  style,
  textStyle,
  fullWidth = false,
}: BrutalButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return colors.borderMedium;
    switch (variant) {
      case 'primary': return colors.orange;
      case 'secondary': return colors.black;
      case 'yellow': return colors.yellow;
      case 'outline': return colors.white;
      case 'danger': return colors.error;
      default: return colors.orange;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary': return colors.white;
      case 'secondary': return colors.white;
      case 'yellow': return colors.black;
      case 'outline': return colors.black;
      case 'danger': return colors.white;
      default: return colors.white;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 40;
      case 'md': return 50;
      case 'lg': return 58;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 13;
      case 'md': return 15;
      case 'lg': return 17;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
          borderColor: disabled ? colors.borderMedium : colors.black,
        },
        shadows.brutalSmall,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={size === 'sm' ? 16 : 20} 
              color={getTextColor()} 
              style={{ marginRight: 8 }} 
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {showArrow && (
            <Ionicons 
              name="arrow-forward" 
              size={size === 'sm' ? 16 : 20} 
              color={getTextColor()} 
              style={{ marginLeft: 8 }} 
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    ...borders.thick,
    borderRadius: 4,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
