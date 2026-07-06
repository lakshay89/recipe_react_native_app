import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, BORDERS, SHADOWS } from '../../core/theme/theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) => {
  const containerStyles = [
    styles.baseContainer,
    styles[`${variant}Container`],
    disabled && styles.disabledContainer,
    style,
  ];

  const labelStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={containerStyles}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.background} size="small" />
      ) : (
        <Text style={labelStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16, // Radius in 14-18 range
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 46, // Height in 44-48 range
  },
  baseText: {
    fontWeight: '600', // Semibold
    fontSize: 15,      // Size in 15-16 range
    letterSpacing: 0.3,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  // Primary: Solid Terracotta, Warm Cream text
  primaryContainer: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  primaryText: {
    color: COLORS.background,
  },

  // Secondary/Outline: Transparent, Saffron/Muted Gold border
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: BORDERS.widthThin,
    borderColor: COLORS.gold,
  },
  secondaryText: {
    color: COLORS.text,
  },

  // Outline: Terracotta border, Terracotta text
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: BORDERS.widthThin,
    borderColor: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },

  // Text / Ghost
  textContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minHeight: 'auto',
  },
  textText: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Disabled States
  disabledContainer: {
    backgroundColor: '#e4e2dd',
    borderColor: '#c4c7c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});

export default Button;
