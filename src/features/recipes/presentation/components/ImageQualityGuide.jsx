import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HelpCircle, Check, AlertTriangle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS } from '../../../../core/theme/theme';

export const ImageQualityGuide = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HelpCircle size={18} color={COLORS.secondary} style={styles.icon} />
        <Text style={styles.title}>Tips for Perfect Text Capture</Text>
      </View>
      <View style={styles.rules}>
        <View style={styles.ruleItem}>
          <Check size={14} color={COLORS.secondary} style={styles.checkIcon} />
          <Text style={styles.ruleText}>Keep device flat, directly overhead (parallel to paper)</Text>
        </View>
        <View style={styles.ruleItem}>
          <Check size={14} color={COLORS.secondary} style={styles.checkIcon} />
          <Text style={styles.ruleText}>Ensure bright, natural light (avoid overhead shadows)</Text>
        </View>
        <View style={styles.ruleItem}>
          <Check size={14} color={COLORS.secondary} style={styles.checkIcon} />
          <Text style={styles.ruleText}>Ensure text is sharp and in focus (tap screen to focus)</Text>
        </View>
        <View style={styles.ruleItem}>
          <AlertTriangle size={14} color={COLORS.gold} style={styles.checkIcon} />
          <Text style={styles.ruleText}>ML Kit supports English (Latin) and Hindi (Devanagari)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    marginRight: 6,
  },
  title: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  rules: {
    gap: 6,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  ruleText: {
    ...FONTS.caption,
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
});

export default ImageQualityGuide;
