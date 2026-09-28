import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, borders, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface BrutalInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
}

export function BrutalInput({
  label,
  icon,
  error,
  containerStyle,
  style,
  ...props
}: BrutalInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={18} 
            color={colors.textSecondary} 
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, icon && { paddingLeft: 0 }, style]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
      </View>
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    ...typography.label,
    color: colors.black,
    marginBottom: 6,
  },
  inputContainer: {
    ...borders.thick,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    height: 50,
  },
  inputError: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.black,
    paddingVertical: 0,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    fontWeight: '600',
  },
});
