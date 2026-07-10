import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../../../../core/theme/theme';
import Button from '../../../../shared/components/Button';

export const NotificationEmptyState = ({ onNavigateToArchive }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Bell size={48} color={COLORS.gold} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>No Notifications Yet</Text>
      <Text style={styles.subtitle}>
        Recipe updates, curation feedback, and publication logs will appear here.
      </Text>
      <Button
        title="Go to My Archive"
        variant="primary"
        onPress={onNavigateToArchive}
        style={styles.actionBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 60,
    backgroundColor: '#FBF7F1', // Warm cream matching system
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.white,
    borderColor: '#E7D8C5',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    ...FONTS.titleLarge,
    fontSize: 20,
    color: COLORS.secondary, // Forest Green headings
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    minWidth: 180,
  },
});

export default NotificationEmptyState;
