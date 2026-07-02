import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDERS, SHADOWS } from '../../core/theme/theme';

export const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
  ...props
}) => {
  const cardStyles = [
    styles.baseCard,
    styles[`${variant}Card`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={cardStyles}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: BORDERS.radiusLg, // Rounded corners
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: BORDERS.widthThin,
  },
  
  // Default: White background, subtle light border, soft shadow
  defaultCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },

  // Heritage: Soft Ivory background, muted gold/cream border, soft shadow
  heritageCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },

  // Dark: Deep forest green background, gold border, medium shadow
  darkCard: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.gold,
    ...SHADOWS.medium,
  },
});

export default Card;
