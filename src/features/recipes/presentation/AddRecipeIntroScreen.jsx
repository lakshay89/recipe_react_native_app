import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { useAuth } from '../../../shared/services/AuthContext';
import { recipeDraftService } from '../services/recipeDraftService';
import { FileText } from 'lucide-react-native';
import TransitionView from '../../../shared/components/TransitionView';

export const AddRecipeIntroScreen = ({ navigation }) => {
  const [draftCount, setDraftCount] = useState(0);
  const { saveRecipeDraft, clearRecipeDraft } = useAuth();

  // Monitor screen focus to update drafts counter
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      recipeDraftService.getAllDrafts().then((list) => {
        setDraftCount(list.length);
      });
    });
    return unsubscribe;
  }, [navigation]);

  const handleBegin = async () => {
    // Generate a fresh draft id and set to active context
    await clearRecipeDraft();
    const freshDraft = {
      draftId: Date.now().toString(),
      title: '',
      localName: '',
      nativeScript: '',
      // englishName: '',
      altNames: '',
      history: '',
    };
    await saveRecipeDraft(freshDraft, 'RecipeIdentity');
    navigation.navigate('RecipeIdentity');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />
      <Header title="Contribute Recipe" showBack={false} showAvatar={true} />

      <TransitionView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Drafts Banner */}
        {draftCount > 0 && (
          <TouchableOpacity
            style={styles.draftBanner}
            onPress={() => navigation.navigate('DraftRecipes')}
            activeOpacity={0.8}
          >
            <View style={styles.bannerLeft}>
              <FileText size={18} color={COLORS.secondary} style={styles.bannerIcon} />
              <Text style={styles.bannerText}>
                You have {draftCount} active draft{draftCount > 1 ? 's' : ''} in drafts
              </Text>
            </View>
            <Text style={styles.bannerAction}>View Drafts</Text>
          </TouchableOpacity>
        )}

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
      </TransitionView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F1', // Primary Cream
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  draftBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4ECE1',
    borderColor: '#ECE3D7',
    borderWidth: BORDERS.widthThin,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2B2B2B',
  },
  bannerAction: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
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
    color: COLORS.white,
    fontSize: 13,
    letterSpacing: 2,
  },
  infoCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: BORDERS.widthThin,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    ...FONTS.titleLarge,
    fontSize: 22,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  description: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  stepsList: {
    gap: SPACING.sm,
  },
  stepItem: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  stepItemTitle: {
    fontWeight: '700',
    color: COLORS.secondary,
  },
  beginButton: {
    width: '100%',
  },
});

export default AddRecipeIntroScreen;
