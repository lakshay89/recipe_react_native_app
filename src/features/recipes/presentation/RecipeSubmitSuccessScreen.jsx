import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const RecipeSubmitSuccessScreen = ({ navigation }) => {
  const handleGoToArchive = () => {
    navigation.navigate('MainApp', { screen: 'MyArchive' });
  };

  const handleGoToPending = () => {
    navigation.navigate('PendingReview');
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />
      <Header title="Archived Successfully" showBack={false} showAvatar={false} />

      <View style={styles.container}>
        <Card variant="heritage" style={styles.successCard}>
          {/* Centered Success Checkmark */}
          <View style={styles.successIconContainer}>
            <CheckCircle size={40} color={COLORS.primary} strokeWidth={2} />
          </View>

          <Text style={styles.congratsTitle}>Curation Preserved</Text>
          
          <Text style={styles.message}>
            Your regional recipe has been submitted for administrative review and cataloging.
          </Text>

          <View style={styles.divider} />

          {/* Guidelines info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>⏳ Curation Review Process</Text>
            <Text style={styles.infoText}>
              Submissions are reviewed by our regional editors. You will receive an archive notification once validation is complete.
            </Text>
          </View>

          {/* Action Row */}
          <View style={styles.buttonRow}>
            <Button
              title="View Submissions"
              variant="outline"
              onPress={handleGoToPending}
              style={styles.actionBtn}
            />
            <Button
              title="Go to My Archive"
              variant="primary"
              onPress={handleGoToArchive}
              style={styles.actionBtn}
            />
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F1', // Primary Cream
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.marginMobile,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    width: '100%',
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: BORDERS.widthThin,
    borderRadius: 16,
    ...SHADOWS.medium,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  congratsTitle: {
    ...FONTS.titleLarge,
    fontSize: 26,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    backgroundColor: COLORS.secondaryBackground,
    borderColor: COLORS.primary,
    borderWidth: BORDERS.widthThin,
    borderRadius: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginVertical: SPACING.md,
  },
  statusLabel: {
    ...FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  desc: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  btnRow: {
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
});

export default RecipeSubmitSuccessScreen;
