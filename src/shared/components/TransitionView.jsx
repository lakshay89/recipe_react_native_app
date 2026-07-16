import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export const TransitionView = ({ children, style, duration = 300, delay = 0 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  const scale = useSharedValue(0.98);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withTiming(0, {
      duration,
      easing: Easing.out(Easing.back(0.8)),
    });
    scale.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.quad),
    });
  }, [duration, delay, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

export default TransitionView;
