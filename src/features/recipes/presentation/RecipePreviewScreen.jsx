import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { recipeDraftService } from '../services/recipeDraftService';
import TransitionView from '../../../shared/components/TransitionView';
import { offlineService } from '../../../shared/services/offlineService';

export const RecipePreviewScreen = ({ navigation }) => {
  const { recipeDraft, addRecipe, clearRecipeDraft } = useAuth();

  const [declaration, setDeclaration] = useState({
    informationIsAccurate: true,
    permissionToSubmit: true,
    termsAccepted: true
  });
  const [consent, setConsent] = useState({
    publicationPermission: true,
    sourceAttributionPermission: true,
    mediaUsagePermission: true
  });
  const [aiDisclosureConfirmed, setAiDisclosureConfirmed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [warningsConfirmed, setWarningsConfirmed] = useState(false);

  const finishedImage = recipeDraft?.archiveImages?.find(img => img.uploaded || img.uri)?.uri 
    || recipeDraft?.completedDishImage 
    || recipeDraft?.heroImage;

  const getImageUrl = (imgUri) => {
    if (!imgUri) return null;
    if (imgUri.startsWith('http') || imgUri.startsWith('file:') || imgUri.startsWith('content:')) {
      return imgUri;
    }
    return `${API_BASE_URL}${imgUri.startsWith('/') ? '' : '/'}${imgUri}`;
  };

  const getConsistencyWarnings = () => {
    const warnings = [];
    if (!recipeDraft) return warnings;

    const titleStr = (recipeDraft.title || '').toLowerCase();
    
    // 1. Title vs Image Mismatch Check
    const hasSweetsImage = finishedImage && (
      finishedImage.includes('sweets') || 
      finishedImage.includes('sweet') || 
      finishedImage.includes('dessert') || 
      finishedImage.includes('jalebi') || 
      finishedImage.includes('gulab')
    );
    if (titleStr.includes('biryani') && hasSweetsImage) {
      warnings.push({
        id: 'img_mismatch',
        message: 'The selected finished-dish image appears to show sweets or desserts, which does not match the "Biryani" title.'
      });
    }

    // 2. Title vs Ingredients Mismatch Check (Chicken Biryani example)
    if (titleStr.includes('biryani')) {
      const hasRice = recipeDraft.ingredientsList?.some(ing => {
        const name = (ing.name || '').toLowerCase();
        return name.includes('rice') || name.includes('chawal') || name.includes('basmati');
      }) || (recipeDraft.ingredients || '').toLowerCase().includes('rice');

      const hasMeat = recipeDraft.ingredientsList?.some(ing => {
        const name = (ing.name || '').toLowerCase();
        return name.includes('chicken') || name.includes('mutton') || name.includes('lamb') || name.includes('meat') || name.includes('egg');
      }) || (recipeDraft.ingredients || '').toLowerCase().includes('chicken') || (recipeDraft.ingredients || '').toLowerCase().includes('meat');

      if (!hasRice || !hasMeat) {
        warnings.push({
          id: 'ingredients_mismatch',
          message: 'Recipe title mentions Biryani, but key ingredients (like rice or chicken/meat) are missing.'
        });
      }
    }

    // 3. Title vs Cooking Steps Mismatch Check (minced chicken kebabs steps vs biryani)
    if (titleStr.includes('biryani')) {
      const hasKebabSteps = recipeDraft.cookingStepsList?.some(step => {
        const text = (step.detail || '').toLowerCase();
        return text.includes('skewer') || text.includes('grill over') || text.includes('tawa') || text.includes('minced chicken') || text.includes('kebab');
      }) || (recipeDraft.instructions || '').toLowerCase().includes('skewer') || (recipeDraft.instructions || '').toLowerCase().includes('minced chicken');

      if (hasKebabSteps) {
        warnings.push({
          id: 'method_mismatch',
          message: 'The cooking steps describe kebab preparation (e.g. skewers, grilling minced meat), which contradicts the "Biryani" title.'
        });
      }
    }

    // 4. Servings vs Ingredients Quantities Check
    if (recipeDraft.serves) {
      const hasQuantities = recipeDraft.ingredientsList?.some(ing => ing.quantity && ing.quantity.trim());
      if (recipeDraft.ingredientsList?.length > 0 && !hasQuantities) {
        warnings.push({
          id: 'servings_quantities',
          message: 'Servings count is defined, but ingredient quantities are empty.'
        });
      }
    }

    // 5. Preparation & Cooking Times Check
    const prep = parseInt(recipeDraft.prepTime || '0', 10);
    const cook = parseInt(recipeDraft.cookTime || '0', 10);
    if ((prep + cook) < 5) {
      warnings.push({
        id: 'timing_mismatch',
        message: 'The preparation and cooking times (less than 5 minutes) seem too short for this recipe method.'
      });
    }

    // 6. Location & Cultural check
    if ((recipeDraft.region || '').toLowerCase() === 'kerala' && titleStr.includes('biryani')) {
      const isMalabar = titleStr.includes('malabar') || titleStr.includes('thalassery') || (recipeDraft.history || '').toLowerCase().includes('malabar') || (recipeDraft.history || '').toLowerCase().includes('thalassery');
      if (!isMalabar) {
        warnings.push({
          id: 'cultural_mismatch',
          message: 'Please confirm the heritage tradition matches the state of origin (Kerala).'
        });
      }
    }

    return warnings;
  };

  useEffect(() => {
    if (recipeDraft) {
      const missing = [];
      if (!recipeDraft.title || !recipeDraft.title.trim()) {
        missing.push({ field: 'title', label: 'Recipe Title', screen: 'RecipeIdentity' });
      }
      if (!recipeDraft.region || !recipeDraft.region.trim()) {
        missing.push({ field: 'state', label: 'State of Origin', screen: 'RecipeLocation' });
      }
      if (!recipeDraft.district || !recipeDraft.district.trim()) {
        missing.push({ field: 'district', label: 'District of Origin', screen: 'RecipeLocation' });
      }
      if (!recipeDraft.ingredientsList || recipeDraft.ingredientsList.length === 0) {
        missing.push({ field: 'ingredients', label: 'At Least One Ingredient', screen: 'RecipeIngredients' });
      }
      if (!recipeDraft.cookingStepsList || recipeDraft.cookingStepsList.length === 0) {
        missing.push({ field: 'steps', label: 'At Least One Cooking Step', screen: 'RecipeCookingMethod' });
      }
      const hasSource = recipeDraft.heritageSource || recipeDraft.whoTaughtYou;
      if (!hasSource) {
        missing.push({ field: 'source', label: 'Heritage Source / Teacher', screen: 'RecipeHeritageSource' });
      }
      const hasImg = recipeDraft?.archiveImages?.find(img => img.uploaded || img.uri)?.uri 
        || recipeDraft?.completedDishImage 
        || recipeDraft?.heroImage;
      if (!hasImg) {
        missing.push({ field: 'finishedImage', label: 'Finished Recipe Image', screen: 'RecipeMediaUpload' });
      }
      setMissingFields(missing);
    }
  }, [recipeDraft]);

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

    if (missingFields.length > 0) {
      Alert.alert('Incomplete Recipe', 'Please fill in all required fields before submitting.');
      return;
    }

    const warnings = getConsistencyWarnings();
    if (warnings.length > 0 && !warningsConfirmed) {
      Alert.alert(
        'Consistency Mismatches',
        'We found potential mismatches in your recipe details. Please review the warnings and confirm they are correct before submitting.',
        [{ text: 'Review' }]
      );
      return;
    }

    if (!declaration.informationIsAccurate || !declaration.permissionToSubmit || !declaration.termsAccepted) {
      Alert.alert('Declarations Required', 'Please accept all declarations before submitting.');
      return;
    }

    if (!consent.publicationPermission || !consent.sourceAttributionPermission) {
      Alert.alert('Consent Required', 'Please accept publication and source attribution permissions.');
      return;
    }

    if (!offlineService.isConnected()) {
      Alert.alert(
        'Offline Mode',
        'Your draft is saved on this device. Connect to the internet to submit it for review.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const newRecipe = await addRecipe(
        recipeDraft,
        declaration,
        consent,
        aiDisclosureConfirmed,
        `idemp-${recipeDraft.draftId || 'fresh'}-${recipeDraft.version || 1}`
      );

      if (newRecipe) {
        if (recipeDraft.draftId) {
          await recipeDraftService.deleteDraft(recipeDraft.draftId);
        }
        await clearRecipeDraft();
        navigation.navigate('RecipeSubmitSuccess', { submissionReference: newRecipe.submissionReference });
      } else {
        Alert.alert('Error', 'Submission failed. Please try again.');
      }
    } catch (e) {
      Alert.alert('Submission Failed', e.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasHero = recipeDraft?.hasHero || false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Archival Preview" showBack={true} showAvatar={false} />

      <TransitionView style={{ flex: 1 }}>
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
          {finishedImage ? (
            <Image
              source={{ uri: getImageUrl(finishedImage) }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : hasHero ? (
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

        {/* Consistency Mismatch Warnings Card */}
        {getConsistencyWarnings().length > 0 && !warningsConfirmed && (
          <Card variant="default" style={styles.warningCardYellow}>
            <Text style={styles.warningTitleYellow}>⚠️ Recipe Consistency Warnings</Text>
            <Text style={styles.warningDesc}>
              Our automated system detected potential mismatches. Please verify:
            </Text>
            {getConsistencyWarnings().map((item, idx) => (
              <Text key={idx} style={styles.warningItemLabelYellow}>
                • {item.message}
              </Text>
            ))}
            <TouchableOpacity
              style={styles.confirmWarningsBtn}
              onPress={() => setWarningsConfirmed(true)}
            >
              <Text style={styles.confirmWarningsBtnText}>I Confirm Recipe Details are Correct</Text>
            </TouchableOpacity>
          </Card>
        )}

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
          {recipeDraft?.ingredientsList && recipeDraft.ingredientsList.length > 0 ? (
            recipeDraft.ingredientsList.map((ing, idx) => (
              <Text key={`ing-${idx}`} style={styles.ingredientsItemText}>
                • {ing.quantity ? `${ing.quantity} ` : ''}{ing.unit ? `${ing.unit} ` : ''}{ing.name || ''}{ing.notes ? ` (${ing.notes})` : ''}
              </Text>
            ))
          ) : (
            <Text style={styles.ingredientsBody}>
              {recipeDraft?.ingredients || 'No ingredients listed.'}
            </Text>
          )}
        </Card>

        {/* Method & Timings */}
        <Card variant="default" style={styles.contentCard}>
          <Text style={styles.cardSectionLabel}>METHOD & TIMINGS</Text>
          <View style={styles.timingsRow}>
            <Text style={styles.timingItem}>Prep: <Text style={styles.boldTime}>{recipeDraft?.prepTime || '0'}m</Text></Text>
            <Text style={styles.timingItem}>Cook: <Text style={styles.boldTime}>{recipeDraft?.cookTime || '0'}m</Text></Text>
            <Text style={styles.timingItem}>Total: <Text style={styles.boldTime}>{recipeDraft?.totalTime || '0'}m</Text></Text>
          </View>

          {(recipeDraft?.heatSource || recipeDraft?.cookingVessel || recipeDraft?.cookingMedium) ? (
            <View style={styles.previewMetaRow}>
              {recipeDraft?.heatSource ? (
                <Text style={styles.previewMetaText}>Heat: <Text style={styles.boldMeta}>{recipeDraft.heatSource}</Text></Text>
              ) : null}
              {recipeDraft?.cookingVessel ? (
                <Text style={styles.previewMetaText}>Vessel: <Text style={styles.boldMeta}>{recipeDraft.cookingVessel}</Text></Text>
              ) : null}
              {recipeDraft?.cookingMedium ? (
                <Text style={styles.previewMetaText}>Medium: <Text style={styles.boldMeta}>{recipeDraft.cookingMedium}</Text></Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.separator} />

          {recipeDraft?.prepStepsList && recipeDraft.prepStepsList.length > 0 ? (
            <View>
              <Text style={styles.previewSubLabel}>Preparation Steps:</Text>
              {recipeDraft.prepStepsList.map((step, idx) => (
                <Text key={`prep-${idx}`} style={styles.stepPreviewText}>
                  • {step.detail}
                </Text>
              ))}
              <View style={styles.miniSeparator} />
            </View>
          ) : null}

          {recipeDraft?.cookingStepsList && recipeDraft.cookingStepsList.length > 0 ? (
            <View>
              <Text style={styles.previewSubLabel}>Cooking Steps:</Text>
              {recipeDraft.cookingStepsList.map((step, idx) => (
                <Text key={`cook-${idx}`} style={styles.stepPreviewText}>
                  • {step.detail}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.instructionsBody}>
              {recipeDraft?.instructions || 'No preparation steps listed.'}
            </Text>
          )}
        </Card>

        {/* Missing Required Fields Block */}
        {missingFields.length > 0 && (
          <Card variant="default" style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Incomplete Information</Text>
            <Text style={styles.warningDesc}>
              The following required fields must be complete before submitting:
            </Text>
            {missingFields.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => navigation.navigate(item.screen)}
                style={styles.missingItemRow}
              >
                <Text style={styles.missingItemLabel}>• {item.label}</Text>
                <Text style={styles.fixLink}>Fix →</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Declarations & Consents Plaque Card */}
        <Card variant="default" style={styles.contentCard}>
          <Text style={styles.cardSectionLabel}>CONTRIBUTOR DECLARATION</Text>
          <BulletTextRow label="I declare that all recipe details and historical context provided are accurate to the best of my knowledge." />
          <BulletTextRow label="I declare that I have obtained all necessary permissions from the source community or family to submit this recipe." />
          <BulletTextRow label="I accept the Terms and Conditions and contributor policies of Edible India." />

          <View style={styles.separator} />

          <Text style={styles.cardSectionLabel}>PUBLICATION CONSENT</Text>
          <BulletTextRow label="I consent to the public preservation and digital archiving of this recipe on the Edible India Atlas." />
          <BulletTextRow label="I consent to source attribution and acknowledgement of the source family/tribe/community." />
          <BulletTextRow label="I consent to public display of the uploaded media assets for educational/cultural use." />

          <View style={styles.separator} />

          <Text style={styles.cardSectionLabel}>AI USE & DISCLOSURE</Text>
          <BulletTextRow label="I confirm that AI tools were only used for structured extraction or digital OCR cleanup, and the factual history remains independently verified." />
        </Card>

        {/* Action button row */}
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Submitting to heritage archives...</Text>
          </View>
        ) : (
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
              disabled={missingFields.length > 0}
            />
          </View>
        )}
      </ScrollView>
      </TransitionView>
    </SafeAreaView>
  );
};

const BulletTextRow = ({ label }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bulletSymbol}>•</Text>
    <Text style={styles.bulletLabel}>{label}</Text>
  </View>
);

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
  previewMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: SPACING.xs,
  },
  previewMetaText: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  boldMeta: {
    fontWeight: '700',
    color: COLORS.secondary,
  },
  previewSubLabel: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 6,
    marginBottom: 4,
  },
  stepPreviewText: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 4,
    paddingLeft: 4,
  },
  miniSeparator: {
    height: 0.5,
    backgroundColor: COLORS.borderLight,
    marginVertical: 8,
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
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    paddingRight: SPACING.md,
  },
  bulletSymbol: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
    lineHeight: 17,
  },
  bulletLabel: {
    ...FONTS.body,
    fontSize: 12.5,
    color: COLORS.text,
    lineHeight: 17,
    flex: 1,
  },
  warningCard: {
    padding: SPACING.md,
    backgroundColor: '#fff5f5',
    borderColor: '#ffcdd2',
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  warningTitle: {
    ...FONTS.titleMedium,
    fontSize: 16,
    color: COLORS.error,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningDesc: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  missingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ffebee',
  },
  missingItemLabel: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.text,
  },
  fixLink: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.xl,
  },
  loadingText: {
    ...FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  ingredientsItemText: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  warningCardYellow: {
    padding: SPACING.md,
    backgroundColor: '#fffdf0',
    borderColor: '#ffe082',
    borderWidth: 1,
    borderRadius: BORDERS.radiusMd,
    marginBottom: SPACING.md,
  },
  warningTitleYellow: {
    ...FONTS.titleMedium,
    fontSize: 16,
    color: '#b78103',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningItemLabelYellow: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginVertical: 4,
  },
  confirmWarningsBtn: {
    backgroundColor: '#ffe082',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDERS.radiusMd,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  confirmWarningsBtnText: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: '#5d4037',
  },
});

export default RecipePreviewScreen;
