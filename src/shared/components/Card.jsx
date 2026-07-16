import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDERS, SHADOWS } from '../../core/theme/theme';
import PressableScale from './PressableScale';

export const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
  ...props
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const cardStyles = [
    styles.baseCard,
    styles[`${variant}Card`],
    style,
  ];

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        style={[cardStyles, animatedStyle]}
        {...props}
      >
        {children}
      </PressableScale>
    );
  }

  return (
    <Animated.View style={[cardStyles, animatedStyle]} {...props}>
      {children}
    </Animated.View>
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
