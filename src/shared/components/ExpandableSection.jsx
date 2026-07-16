import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../../core/theme/theme';

export const ExpandableSection = ({ title, children, initialExpanded = false, style }) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [height, setHeight] = useState(0);
  const animatedHeight = useSharedValue(initialExpanded ? 1 : 0);

  const toggleExpand = () => {
    const nextState = !expanded;
    setExpanded(nextState);
    animatedHeight.value = withTiming(nextState ? 1 : 0, { duration: 250 });
  };

  const onLayout = (event) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0 && layoutHeight !== height) {
      setHeight(layoutHeight);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height > 0 ? animatedHeight.value * height : expanded ? 'auto' : 0,
      opacity: animatedHeight.value,
      overflow: 'hidden',
    };
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.7}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
        <Animated.View
          style={{
            transform: [
              {
                rotate: expanded ? '180deg' : '0deg',
              },
            ],
          }}
        >
          <ChevronDown size={18} color={COLORS.primary} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={animatedStyle}>
        <View style={styles.content} onLayout={onLayout}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE3D7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  title: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  content: {
    paddingBottom: SPACING.md,
  },
});

export default ExpandableSection;
