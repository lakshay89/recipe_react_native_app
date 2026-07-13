import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Button from '../../../shared/components/Button';

const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', subLabel: 'Hindi' },
  { code: 'gu', label: 'ગુજરાતી', subLabel: 'Gujarati' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', subLabel: 'Punjabi' },
  { code: 'ta', label: 'தமிழ்', subLabel: 'Tamil' },
  { code: 'te', label: 'తెలుగు', subLabel: 'Telugu' },
  { code: 'ml', label: 'മലയാളം', subLabel: 'Malayalam' },
  { code: 'kn', label: 'ಕನ್ನಡ', subLabel: 'Kannada' },
  { code: 'en', label: 'English', subLabel: 'English' },
];

export const LanguageScreen = ({ navigation }) => {
  const { chooseLanguage, selectedLanguage } = useAuth();
  const [activeLang, setActiveLang] = useState(selectedLanguage || 'en');

  const handleProceed = () => {
    chooseLanguage(activeLang);
    navigation.replace('Onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Subtle Dot Pattern Simulation (Top Circle Decors) */}
      <View style={styles.patternCircle} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Heritage Language</Text>
          <Text style={styles.description}>
            Select the primary language to experience the culinary archives.
          </Text>
        </View>

        {/* 2-Column Responsive Grid */}
        <View style={styles.grid}>
          {LANGUAGES.map((lang) => {
            const isSelected = activeLang === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                activeOpacity={0.9}
                onPress={() => setActiveLang(lang.code)}
                style={[
                  styles.card,
                  isSelected ? styles.cardSelected : styles.cardUnselected,
                ]}
              >
                <Text style={[styles.langText, isSelected && styles.langTextSelected]}>
                  {lang.label}
                </Text>
                <Text style={styles.langSubText}>
                  {lang.subLabel}
                </Text>
                
                {/* Checkmark circle */}
                {isSelected && (
                  <View style={styles.checkIconContainer}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Aligned Footer Button */}
      <View style={styles.footer}>
        <Button
          title="Continue / आगे बढ़ें"
          variant="primary"
          onPress={handleProceed}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  patternCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#eae8e3',
    top: -150,
    right: -100,
    opacity: 0.25,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.xxl,
    paddingBottom: 100, // Safe space for sticky button
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    ...FONTS.titleLarge,
    fontSize: 28,
    textAlign: 'center',
    color: COLORS.secondary, // Deep Forest Green
    lineHeight: 36,
    marginBottom: SPACING.sm,
  },
  description: {
    ...FONTS.body,
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '47%', // 2 columns with spacing
    height: 120,
    borderRadius: BORDERS.radiusLg,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.gutterMobile,
    borderWidth: BORDERS.widthThin,
    ...SHADOWS.soft,
  },
  cardUnselected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
  },
  cardSelected: {
    backgroundColor: COLORS.secondaryBackground, // Ivory container tint
    borderColor: COLORS.primary, // Terracotta highlight border
    borderWidth: BORDERS.widthThick,
  },
  langText: {
    ...FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 4,
  },
  langTextSelected: {
    color: COLORS.primary,
  },
  langSubText: {
    ...FONTS.caption,
    fontSize: 14,
  },
  checkIconContainer: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderColor: COLORS.borderLight,
  },
  continueButton: {
    width: '100%',
  },
});

export default LanguageScreen;
