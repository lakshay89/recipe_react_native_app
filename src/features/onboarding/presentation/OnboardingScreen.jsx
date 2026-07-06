import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Button from '../../../shared/components/Button';

const { height } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Discover India’s Culinary Heritage',
    tagline: 'Discover',
    description: 'Explore regional cooking methods, indigenous ingredients, and local family culinary secrets from every corner of India.',
    color: COLORS.secondary,
    artworkImage: require('../../../assets/images/thali.png'),
  },
  {
    title: 'Preserve Family Recipes',
    tagline: 'Preserve',
    description: 'Document old family recipes, oral cooking narratives, and traditional kitchen lore to keep them alive.',
    color: COLORS.primary,
    artworkImage: require('../../../assets/images/silbata.png'),
  },
  {
    title: 'Explore Forgotten Heritage',
    tagline: 'Explore',
    description: 'Reclaim and restore recipes that are slowly fading from public memory, utilizing traditional cooking styles.',
    color: COLORS.gold,
    artworkImage: require('../../../assets/images/kelapatta.png'),
  },
  {
    title: 'Contribute to Edible India',
    tagline: 'Contribute',
    description: 'Participate in India\'s living food archive. Upload details and pin recipes to build our collective culinary map.',
    color: COLORS.accent,
    artworkImage: require('../../../assets/images/kesar.png'),
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const { completeOnboarding } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
      navigation.replace('Auth');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigation.replace('Auth');
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.secondaryBackground} />

      {/* Top Visual Section */}
      <View style={styles.visualSection}>
        {/* Decorative Ring Art with Local Asset Images */}
        <View style={[styles.decorativeRing, { borderColor: slide.color }]}>
          <Image
            source={slide.artworkImage}
            style={styles.artworkImage}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.visualTitle}>EDIBLE INDIA</Text>
      </View>

      {/* Bottom Text Card Sheet (Stitch overlay style) */}
      <View style={styles.cardSheet}>
        {/* Top bar within card */}
        <View style={styles.topBar}>
          <Text style={[styles.tagline, { color: slide.color }]}>
            {slide.tagline.toUpperCase()}
          </Text>
          {currentSlide < SLIDES.length - 1 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>SKIP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mid text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Footer controls */}
        <View style={styles.footer}>
          {/* Progress Indicator Dots */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentSlide === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          {/* Action button */}
          <Button
            title={currentSlide === SLIDES.length - 1 ? 'Begin' : 'Next'}
            variant="primary"
            onPress={handleNext}
            style={styles.actionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.secondaryBackground,
  },
  visualSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
  },
  decorativeRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  visualTitle: {
    ...FONTS.labelCaps,
    fontSize: 13,
    letterSpacing: 3,
  },
  cardSheet: {
    height: height * 0.52,
    backgroundColor: COLORS.background, // Warm Cream
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    justifyContent: 'space-between',
    ...SHADOWS.medium,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagline: {
    ...FONTS.labelCaps,
    fontSize: 12,
  },
  skipText: {
    ...FONTS.labelCaps,
    color: COLORS.textMuted,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  title: {
    ...FONTS.titleLarge,
    fontSize: 32,
    color: COLORS.secondary,
    lineHeight: 38,
    marginBottom: SPACING.md,
  },
  description: {
    ...FONTS.body,
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.border,
  },
  actionButton: {
    minWidth: 120,
    height: 44,
  },
});

export default OnboardingScreen;
