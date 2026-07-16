import React, { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import SkeletonLoader from './SkeletonLoader';

export const ImageLoader = ({
  source,
  thumbnailSource,
  style,
  resizeMode = 'cover',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);

  const imageOpacity = useSharedValue(0);
  const thumbOpacity = useSharedValue(0);

  const handleThumbnailLoad = () => {
    setThumbLoaded(true);
    if (!loaded) {
      thumbOpacity.value = withTiming(1, { duration: 250 });
    }
  };

  const handleImageLoad = () => {
    setLoaded(true);
    imageOpacity.value = withTiming(1, { duration: 350 });
  };

  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    opacity: thumbOpacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Skeleton loader background shown when not fully loaded */}
      {!loaded && (
        <SkeletonLoader
          width="100%"
          height="100%"
          borderRadius={0}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Thumbnail image */}
      {thumbnailSource && !loaded && (
        <Animated.Image
          source={thumbnailSource}
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }, thumbStyle]}
          resizeMode={resizeMode}
          onLoad={handleThumbnailLoad}
          blurRadius={Platform.OS === 'android' ? 2 : 5}
        />
      )}

      {/* Main Image */}
      <Animated.Image
        source={source}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }, imageStyle]}
        resizeMode={resizeMode}
        onLoad={handleImageLoad}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E8E3D7',
  },
});

export default ImageLoader;
