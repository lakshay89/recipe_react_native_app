import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, FONTS, BORDERS } from '../../../../core/theme/theme';

export const NotificationFilterChip = ({ label, count, active, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chipContainer,
        active ? styles.chipContainerActive : styles.chipContainerInactive
      ]}
    >
      <Text style={[
        styles.chipText,
        active ? styles.chipTextActive : styles.chipTextInactive
      ]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={[
          styles.badge,
          active ? styles.badgeActive : styles.badgeInactive
        ]}>
          <Text style={[
            styles.badgeText,
            active ? styles.badgeTextActive : styles.badgeTextInactive
          ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: BORDERS.widthThin,
  },
  chipContainerActive: {
    backgroundColor: COLORS.secondary, // Deep Forest Green active state
    borderColor: COLORS.secondary,
  },
  chipContainerInactive: {
    backgroundColor: COLORS.white,
    borderColor: '#E7D8C5', // Subtle warm border
  },
  chipText: {
    ...FONTS.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  chipTextInactive: {
    color: COLORS.textMuted,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 18,
  },
  badgeActive: {
    backgroundColor: COLORS.white,
  },
  badgeInactive: {
    backgroundColor: COLORS.secondaryBackground,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeTextActive: {
    color: COLORS.secondary,
  },
  badgeTextInactive: {
    color: COLORS.text,
  },
});

export default NotificationFilterChip;
