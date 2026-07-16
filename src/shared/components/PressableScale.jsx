import React from 'react';
import { Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableScale = ({
  children,
  onPress,
  style,
  disabled,
  activeScale = 0.97,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(activeScale, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        style,
        animatedStyle,
      ]}
      android_ripple={
        disabled
          ? null
          : {
              color: 'rgba(0, 0, 0, 0.08)',
              borderless: false,
            }
      }
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};

export default PressableScale;
