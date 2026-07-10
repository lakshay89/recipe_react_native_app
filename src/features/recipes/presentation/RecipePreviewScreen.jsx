import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { recipeDraftService } from '../services/recipeDraftService';

export const RecipePreviewScreen = ({ navigation }) => {
  const { recipeDraft, addRecipe, clearRecipeDraft } = useAuth();

  const handleSaveDraftOnly = async () => {
    if (recipeDraft) {
      await recipeDraftService.saveDraft(recipeDraft, 'RecipePreview');
    }
    Alert.alert(
      'Draft Saved',
      'Draft archived successfully. You can complete submission anytime under Add Recipe.',
      [{ text: 'OK', onPress: () => navigation.navigate('MainApp') }]
    );
  };

  const handleSubmit = async () => {
    if (!recipeDraft || !recipeDraft.title) {
      Alert.alert('Error', 'Invalid draft. Please start over.');
      return;
    }

    // Submit recipe to archives
    const newRecipe = await addRecipe({
      title: recipeDraft.title,
      region: recipeDraft.region || '',
      district: recipeDraft.district || '',
      history: recipeDraft.history || '', // Story/heritage
      ingredients: recipeDraft.ingredients || '',
      instructions: recipeDraft.instructions || '',
      heritageSource: recipeDraft.heritageSource || '',
      prepTime: recipeDraft.prepTime || '',
      cookTime: recipeDraft.cookTime || '',
      totalTime: recipeDraft.totalTime || '',
      serves: recipeDraft.serves || '4',
      // Attach mock cover path if selected
      coverImage: recipeDraft.hasHero ? 'thali.png' : 'sweets.png',
    });

    if (newRecipe) {
      // Clear draft in context and list storage
      if (recipeDraft.draftId) {
        await recipeDraftService.deleteDraft(recipeDraft.draftId);
      }
      await clearRecipeDraft();
      navigation.navigate('RecipeSubmitSuccess');
    } else {
      Alert.alert('Error', 'Submission failed. Please try again.');
    }
  };

  const hasHero = recipeDraft?.hasHero || false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Archival Preview" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>STEP 8 OF 8</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Cover visual overlay */}
        <View style={styles.coverContainer}>
          {hasHero ? (
            <Image
              source={require('../../../assets/images/thali.png')}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('../../../assets/images/sweets.png')}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.scrim} />
          
          {/* Status Badge overlay */}
          <View style={styles.badgeOverlay}>
            <Text style={styles.badgeText}>PENDING REVIEW</Text>
          </View>
        </View>

        {/* Recipe Title & Metadata */}
        <Text style={styles.recipeTitle}>{recipeDraft?.title || 'Untitled Recipe'}</Text>
        
        {/* Geography Plaque Card */}
        <Card variant="heritage" style={styles.plaqueCard}>
          <Text style={styles.cardSectionLabel}>GEOGRAPHY & LOCATION</Text>
          <Text style={styles.locationTitle}>
            {recipeDraft?.region || 'Unknown Region'}
          </Text>
          <Text style={styles.locationSubtitle}>
            District: {recipeDraft?.district || 'N/A'} • Tehsil: {recipeDraft?.tehsil || 'N/A'} • Village: {recipeDraft?.village || 'N/A'}
          </Text>
          {recipeDraft?.gpsCoords ? (
            <Text style={styles.gpsCoords}>GPS: {recipeDraft.gpsCoords}</Text>
          ) : null}
        </Card>

        {/* Heritage Source Section */}
        <Card variant="default" style={styles.contentCard}>
          <Text style={styles.cardSectionLabel}>HERITAGE & LINEAGE</Text>
          <Text style={styles.sourceType}>Transmission: {recipeDraft?.heritageSource || 'Oral history'}</Text>
          {recipeDraft?.whoTaughtYou ? (
            <Text style={styles.taughtText}>Teacher/Source: {recipeDraft.whoTaughtYou}</Text>
          ) : null}
          <Text style={styles.narrativeText}>{recipeDraft?.history || 'No oral history story provided.'}</Text>
        </Card>

        {/* Dynamic Ingredients Plaque Card */}
        <Card variant="default" style={styles.contentCard}>
          <Text style={styles.cardSectionLabel}>INGREDIENTS (Serves - {recipeDraft?.serves || '4'})</Text>
          <Text style={styles.ingredientsBody}>
            {recipeDraft?.ingredients || 'No ingredients listed.'}
          </Text>
        </Card>

        {/* Method & Timings */}
        <Card variant="default" style={styles.contentCard}>
          <Text style={styles.cardSectionLabel}>METHOD & TIMINGS</Text>
          <View style={styles.timingsRow}>
            <Text style={styles.timingItem}>Prep: <Text style={styles.boldTime}>{recipeDraft?.prepTime || '0'}m</Text></Text>
            <Text style={styles.timingItem}>Cook: <Text style={styles.boldTime}>{recipeDraft?.cookTime || '0'}m</Text></Text>
            <Text style={styles.timingItem}>Total: <Text style={styles.boldTime}>{recipeDraft?.totalTime || '0'}m</Text></Text>
          </View>
          <View style={styles.separator} />
          <Text style={styles.instructionsBody}>
            {recipeDraft?.instructions || 'No preparation steps listed.'}
          </Text>
        </Card>

        {/* Action button row */}
        <View style={styles.buttonRow}>
          <Button
            title="Save Draft"
            variant="outline"
            onPress={handleSaveDraftOnly}
            style={styles.actionBtn}
          />
          <Button
            title="Submit"
            variant="primary"
            onPress={handleSubmit}
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
  coverContainer: {
    height: 200,
    width: '100%',
    borderRadius: BORDERS.radiusLg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  badgeOverlay: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.primary, // Terracotta status highlight
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    ...FONTS.labelCaps,
    fontSize: 9,
    color: COLORS.background,
    letterSpacing: 1,
  },
  recipeTitle: {
    ...FONTS.titleLarge,
    fontSize: 28,
    color: COLORS.secondary,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  plaqueCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardSectionLabel: {
    ...FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  locationTitle: {
    ...FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.text,
  },
  locationSubtitle: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  gpsCoords: {
    ...FONTS.caption,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  contentCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  sourceType: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
  },
  taughtText: {
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  narrativeText: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: SPACING.sm,
  },
  ingredientsBody: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  timingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  timingItem: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  boldTime: {
    fontWeight: '700',
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  instructionsBody: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
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

export default RecipePreviewScreen;
