import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const RecipeSubmitSuccessScreen = ({ route, navigation }) => {
  const { submissionReference } = route.params || { submissionReference: 'N/A' };

  const handleGoToArchive = () => {
    navigation.navigate('MainApp', { screen: 'MyArchive' });
  };

  const handleGoToPending = () => {
    navigation.navigate('MainApp', { screen: 'MyArchive' }); // Navigate to Archive list to see pending status
  };

  const circleScale = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(25);

  useEffect(() => {
    circleScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    checkmarkScale.value = withDelay(150, withSpring(1, { damping: 10, stiffness: 120 }));
    textOpacity.value = withDelay(400, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    buttonsOpacity.value = withDelay(650, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    buttonsTranslateY.value = withDelay(650, withSpring(0, { damping: 14, stiffness: 90 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedCircle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const animatedCheckmark = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const animatedText = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedButtons = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
    width: '100%',
    alignItems: 'center',
  }));

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />
      <Header title="Archived Successfully" showBack={false} showAvatar={false} />

      <View style={styles.container}>
        <Card variant="heritage" style={styles.successCard}>
          {/* Centered Success Checkmark */}
          <Animated.View style={[styles.successIconContainer, animatedCircle]}>
            <Animated.View style={animatedCheckmark}>
              <CheckCircle size={40} color={COLORS.primary} strokeWidth={2} />
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.textBlock, animatedText]}>
            <Text style={styles.congratsTitle}>Curation Preserved</Text>
            
            <Text style={styles.message}>
              Your regional recipe has been submitted for administrative review and cataloging.
            </Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusLabel}>REFERENCE: {submissionReference}</Text>
            </View>

            <View style={styles.divider} />

            {/* Guidelines info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>⏳ Curation Review Process</Text>
              <Text style={styles.infoText}>
                Submissions are reviewed by our regional editors. You will receive an archive notification once validation is complete.
              </Text>
            </View>
          </Animated.View>

          {/* Action Row */}
          <Animated.View style={animatedButtons}>
            <View style={styles.btnRow}>
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
          </Animated.View>
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
  textBlock: {
    width: '100%',
    alignItems: 'center',
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
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ECE3D7',
    marginVertical: SPACING.lg,
  },
  infoBox: {
    backgroundColor: COLORS.secondaryBackground,
    padding: SPACING.md,
    borderRadius: 8,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 4,
  },
  infoText: {
    ...FONTS.caption,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  btnRow: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
    marginTop: SPACING.lg, // Added margin top on the button container
  },
  actionBtn: {
    width: '70%', // Made 30% smaller (70% width)
  },
});

export default RecipeSubmitSuccessScreen;
