import React from 'react';
import { View } from 'react-native';

export const TransitionView = ({ children, style }) => {
  return (
    <View style={[{ flex: 1 }, style]}>
      {children}
    </View>
  );
};

export default TransitionView;
