import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const RecipeSubmitSuccessScreen = ({ navigation }) => {
  const handleGoToArchive = () => {
    // Navigate to MainApp bottom tab navigator's MyContributions screen
    navigation.navigate('MainApp', { screen: 'MyContributions' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Archived Successfully" showBack={false} showAvatar={false} />

      <View style={styles.container}>
        <Card variant="heritage" style={styles.successCard}>
          {/* Centered Success Checkmark */}
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>🏺</Text>
          </View>

          <Text style={styles.congratsTitle}>Curation Preserved</Text>
          
          <Text style={styles.message}>
            Your regional recipe has been submitted for administrative review and cataloging.
          </Text>

          {/* Pending Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusLabel}>STATUS: PENDING REVIEW</Text>
          </View>

          <Text style={styles.desc}>
            Once verified by our culinary historians, the contribution will be pinned to the public India Heritage Map.
          </Text>

          {/* Action button */}
          <Button
            title="Go to My Archive"
            variant="primary"
            onPress={handleGoToArchive}
            style={styles.archiveBtn}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    borderColor: COLORS.borderLight,
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
  successIcon: {
    fontSize: 40,
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
  archiveBtn: {
    width: '100%',
  },
});

export default RecipeSubmitSuccessScreen;
