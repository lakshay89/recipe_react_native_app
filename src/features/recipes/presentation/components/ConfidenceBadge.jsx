import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, AlertCircle } from 'lucide-react-native';
import { FONTS } from '../../../../core/theme/theme';

export const ConfidenceBadge = ({ confidence }) => {
  const score = Math.round(confidence * 100);
  
  let badgeColor = '#E2F0D9'; // Soft green
  let textColor = '#385723';
  let borderColor = '#C5E0B4';
  let label = `High Confidence (${score}%)`;
  let isLow = false;

  if (score < 70) {
    badgeColor = '#FCE4D6'; // Soft red
    textColor = '#C65911';
    borderColor = '#F8CBAD';
    label = `Review Needed (${score}%)`;
    isLow = true;
  } else if (score < 90) {
    badgeColor = '#FFF2CC'; // Soft yellow
    textColor = '#7F6000';
    borderColor = '#FFE699';
    label = `Verify Details (${score}%)`;
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeColor, borderColor }]}>
      {isLow ? (
        <AlertCircle size={11} color={textColor} style={styles.icon} />
      ) : (
        <ShieldCheck size={11} color={textColor} style={styles.icon} />
      )}
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default ConfidenceBadge;
