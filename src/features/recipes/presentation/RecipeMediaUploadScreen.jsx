import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const RecipeMediaUploadScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  
  const [hasHero, setHasHero] = useState(false);
  const [hasDish, setHasDish] = useState(false);
  const [hasIngredients, setHasIngredients] = useState(false);
  const [hasGallery, setHasGallery] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  useEffect(() => {
    if (recipeDraft) {
      setHasHero(recipeDraft.hasHero || false);
      setHasDish(recipeDraft.hasDish || false);
      setHasIngredients(recipeDraft.hasIngredients || false);
      setHasGallery(recipeDraft.hasGallery || false);
      setHasVideo(recipeDraft.hasVideo || false);
      setHasAudio(recipeDraft.hasAudio || false);
    }
  }, [recipeDraft]);

  const saveCurrentDraft = (silent = true) => {
    const updatedDraft = {
      ...(recipeDraft || {}),
      hasHero,
      hasDish,
      hasIngredients,
      hasGallery,
      hasVideo,
      hasAudio,
      // Map mock image paths to match preview display
      heroImage: hasHero ? require('../../../assets/images/thali.png') : null,
      dishImage: hasDish ? require('../../../assets/images/dal.png') : null,
      ingredientsImage: hasIngredients ? require('../../../assets/images/kesar.png') : null,
      galleryImage: hasGallery ? require('../../../assets/images/chaicup.png') : null,
    };
    saveRecipeDraft(updatedDraft);
    if (!silent) {
      Alert.alert('Draft Saved', 'Your progress has been saved locally.');
    }
    return updatedDraft;
  };

  const handleNext = () => {
    saveCurrentDraft(true);
    navigation.navigate('RecipePreview');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Add Recipe" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>STEP 7 OF 8</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '87.5%' }]} />
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Media Archival</Text>
        <Text style={styles.sectionSubtitle}>
          Upload visual proof and audio histories. Tap blocks to select/simulate mock uploads.
        </Text>

        {/* Form Card */}
        <Card variant="default" style={styles.formCard}>
          
          {/* Cover Photo */}
          <Text style={styles.label}>HERO COVER IMAGE *</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setHasHero(!hasHero)}
            style={[styles.uploadBox, styles.heroUploadBox]}
          >
            {hasHero ? (
              <Image source={require('../../../assets/images/thali.png')} style={styles.uploadedImg} resizeMode="cover" />
            ) : (
              <View style={styles.boxContent}>
                <Text style={styles.uploadIcon}>📸</Text>
                <Text style={styles.uploadTitle}>Tap to select Hero Image</Text>
                <Text style={styles.uploadDesc}>(Required - Main cover showing traditional plating)</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.gridRow}>
            {/* Final Dish Image */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>FINAL PRESENTATION</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setHasDish(!hasDish)}
                style={styles.uploadBox}
              >
                {hasDish ? (
                  <Image source={require('../../../assets/images/dal.png')} style={styles.uploadedImg} resizeMode="cover" />
                ) : (
                  <View style={styles.boxContent}>
                    <Text style={styles.uploadIconSmall}>🍲</Text>
                    <Text style={styles.uploadTitleSmall}>Final Dish</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Raw Ingredients */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>RAW SPICES</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setHasIngredients(!hasIngredients)}
                style={styles.uploadBox}
              >
                {hasIngredients ? (
                  <Image source={require('../../../assets/images/kesar.png')} style={styles.uploadedImg} resizeMode="cover" />
                ) : (
                  <View style={styles.boxContent}>
                    <Text style={styles.uploadIconSmall}>🌶</Text>
                    <Text style={styles.uploadTitleSmall}>Raw Spices</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gridRow}>
            {/* Gallery */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>PREPARATION STEPS</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setHasGallery(!hasGallery)}
                style={styles.uploadBox}
              >
                {hasGallery ? (
                  <Image source={require('../../../assets/images/chaicup.png')} style={styles.uploadedImg} resizeMode="cover" />
                ) : (
                  <View style={styles.boxContent}>
                    <Text style={styles.uploadIconSmall}>👩‍🍳</Text>
                    <Text style={styles.uploadTitleSmall}>Prep Gallery</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Video */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>METHOD VIDEO</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setHasVideo(!hasVideo)}
                style={[styles.uploadBox, hasVideo && styles.selectedFeatureBox]}
              >
                <View style={styles.boxContent}>
                  <Text style={styles.uploadIconSmall}>{hasVideo ? '✅' : '📹'}</Text>
                  <Text style={styles.uploadTitleSmall}>{hasVideo ? 'Video Added' : 'Add Video'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Audio History */}
          <Text style={styles.label}>ORAL HISTORY VOICE CLIP</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setHasAudio(!hasAudio)}
            style={[styles.audioBox, hasAudio && styles.selectedFeatureBox]}
          >
            <Text style={styles.audioIcon}>{hasAudio ? '🎤 ✓' : '🎤'}</Text>
            <Text style={styles.audioTitle}>
              {hasAudio ? 'Voice narration draft attached' : 'Tap to record oral history narrative'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Footer Actions */}
        <View style={styles.buttonRow}>
          <Button
            title="Save Draft"
            variant="outline"
            onPress={() => saveCurrentDraft(false)}
            style={styles.actionBtn}
          />
          <Button
            title="Next Step"
            variant="primary"
            onPress={handleNext}
            style={styles.actionBtn}
          />
        </View>
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
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  stepText: {
    ...FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.primary,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    width: '100%',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    ...FONTS.titleLarge,
    fontSize: 26,
    color: COLORS.secondary,
  },
  sectionSubtitle: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  formCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  label: {
    ...FONTS.labelCaps,
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: SPACING.xs,
    letterSpacing: 1.2,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDERS.radiusMd,
    height: 110,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  heroUploadBox: {
    height: 160,
  },
  uploadedImg: {
    width: '100%',
    height: '100%',
  },
  boxContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  uploadIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  uploadTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
  },
  uploadDesc: {
    ...FONTS.caption,
    fontSize: 11,
    marginTop: 2,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  gridItem: {
    flex: 1,
  },
  uploadIconSmall: {
    fontSize: 20,
    marginBottom: 2,
  },
  uploadTitleSmall: {
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.text,
  },
  selectedFeatureBox: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryBackground,
    borderStyle: 'solid',
    borderWidth: 2,
  },
  audioBox: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDERS.radiusMd,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    marginVertical: SPACING.sm,
  },
  audioIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    color: COLORS.primary,
  },
  audioTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
});

export default RecipeMediaUploadScreen;
