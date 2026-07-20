import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS } from '../../../../core/theme/theme';

export const SourceBadge = ({ source }) => {
  let label = 'Manual';
  let bgColor = '#EBF1F5';
  let textColor = '#2F5597';
  let borderColor = '#D9E1F2';

  switch (source) {
    case 'ocr_extracted':
      label = 'OCR';
      bgColor = '#FFF2CC';
      textColor = '#7F6000';
      borderColor = '#FFE699';
      break;
    case 'user_corrected':
      label = 'Verified';
      bgColor = '#E2F0D9';
      textColor = '#385723';
      borderColor = '#C5E0B4';
      break;
    case 'ai_suggested':
      label = 'AI Suggest';
      bgColor = '#F2E6F7';
      textColor = '#7030A0';
      borderColor = '#E1C4F2';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  text: {
    ...FONTS.caption,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SourceBadge;
