import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const AddRecipeIntroScreen = ({ navigation }) => {
  const handleBegin = () => {
    navigation.navigate('RecipeIdentity');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Contribute Recipe" showBack={false} showAvatar={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Visual Banner */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../assets/images/kelapatta.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
          <Text style={styles.bannerTag}>PRESERVE A LEGACY</Text>
        </View>

        {/* Intro Plaque Card */}
        <Card variant="heritage" style={styles.infoCard}>
          <Text style={styles.title}>The Archival Process</Text>
          <Text style={styles.description}>
            You are about to document a regional recipe for the Edible India living museum.
            To ensure historical accuracy, we will guide you through 8 structural steps:
          </Text>

          {/* Stepper Details */}
          <View style={styles.stepsList}>
            <Text style={styles.stepItem}>1. <Text style={styles.stepItemTitle}>Recipe Identity</Text> (Names, Native Scripts, Pronunciations)</Text>
            <Text style={styles.stepItem}>2. <Text style={styles.stepItemTitle}>Geography</Text> (State, District, Tehsil, Village details)</Text>
            <Text style={styles.stepItem}>3. <Text style={styles.stepItemTitle}>Heritage Source</Text> (History, Family lineage, Lore)</Text>
            <Text style={styles.stepItem}>4. <Text style={styles.stepItemTitle}>Ingredients</Text> (Proportions, local native names)</Text>
            <Text style={styles.stepItem}>5. <Text style={styles.stepItemTitle}>Cooking Method</Text> (Time, steps, traditional tips)</Text>
            <Text style={styles.stepItem}>6. <Text style={styles.stepItemTitle}>Cultural Context</Text> (Festival, community traditions)</Text>
            <Text style={styles.stepItem}>7. <Text style={styles.stepItemTitle}>Media Upload</Text> (Photos, raw ingredients, voice notes)</Text>
            <Text style={styles.stepItem}>8. <Text style={styles.stepItemTitle}>Archival Preview</Text> (Review and submit to index)</Text>
          </View>
        </Card>

        {/* Start Button */}
        <Button
          title="Begin Curation Flow"
          variant="primary"
          onPress={handleBegin}
          style={styles.beginButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  imageContainer: {
    height: 150,
    width: '100%',
    borderRadius: BORDERS.radiusLg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(47, 43, 40, 0.4)',
  },
  bannerTag: {
    position: 'absolute',
    ...FONTS.labelCaps,
    color: COLORS.background,
    fontSize: 13,
    letterSpacing: 2,
  },
  infoCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  title: {
    ...FONTS.titleLarge,
    fontSize: 24,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  description: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  stepsList: {
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  stepItem: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  stepItemTitle: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  beginButton: {
    marginTop: SPACING.xl,
  },
});

export default AddRecipeIntroScreen;
