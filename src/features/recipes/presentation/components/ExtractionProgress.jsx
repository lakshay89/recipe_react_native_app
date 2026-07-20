import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../../../core/theme/theme';

export const ExtractionProgress = ({ currentPage, totalPages, statusText }) => {
  const percent = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.statusTitle}>Recipe OCR Extraction</Text>
          {totalPages > 0 && (
            <Text style={styles.pageCount}>
              Page {currentPage} of {totalPages}
            </Text>
          )}
        </View>
        <Text style={styles.statusDescription}>{statusText || 'Processing recipe pages...'}</Text>
        
        {/* Progress bar tracks */}
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  loader: {
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  pageCount: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  statusDescription: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  track: {
    height: 4,
    backgroundColor: '#F0E6D8',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});

export default ExtractionProgress;
