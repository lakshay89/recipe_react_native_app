import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const RecipeCultureScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  
  const [festival, setFestival] = useState('');
  const [season, setSeason] = useState('');
  const [community, setCommunity] = useState('');
  const [tribe, setTribe] = useState('');
  const [dietType, setDietType] = useState('');
  const [rarityStatus, setRarityStatus] = useState('');
  const [cookingVessel, setCookingVessel] = useState('');
  const [cookingMedium, setCookingMedium] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (recipeDraft && !isHydrated) {
      setFestival(recipeDraft.festival || '');
      setSeason(recipeDraft.season || '');
      setCommunity(recipeDraft.community || '');
      setTribe(recipeDraft.tribe || '');
      setDietType(recipeDraft.dietType || '');
      setRarityStatus(recipeDraft.rarityStatus || '');
      setCookingVessel(recipeDraft.cookingVessel || '');
      setCookingMedium(recipeDraft.cookingMedium || '');
      setIsHydrated(true);
    }
  }, [recipeDraft, isHydrated]);

  const saveCurrentDraft = (silent = true) => {
    const updatedDraft = {
      ...(recipeDraft || {}),
      festival,
      season,
      community,
      tribe,
      dietType,
      rarityStatus,
      cookingVessel,
      cookingMedium,
    };
    saveRecipeDraft(updatedDraft, 'RecipeCulture');
    if (!silent) {
      Alert.alert(
        'Draft Saved',
        'Your progress has been saved locally.',
        [
          { text: 'Keep Curation', style: 'default' },
          { text: 'Continue Later', onPress: () => navigation.navigate('MainApp') }
        ]
      );
    }
    return updatedDraft;
  };

  const handleNext = () => {
    saveCurrentDraft(true);
    navigation.navigate('RecipeMediaUpload');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Add Recipe" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>STEP 6 OF 8</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '75%' }]} />
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Cultural Context</Text>
        <Text style={styles.sectionSubtitle}>
          Document associated festivals, communities, rarity metrics, and cookware details.
        </Text>

        {/* Form Card */}
        <Card variant="default" style={styles.formCard}>
          <Input
            label="Associated Festival / Occasion"
            placeholder="e.g. Maha Shivratri, Eid-ul-Fitr"
            value={festival}
            onChangeText={setFestival}
          />

          <Input
            label="Associated Season"
            placeholder="e.g. Winter (Shishir), Monsoon (Varsha)"
            value={season}
            onChangeText={setSeason}
          />

          <Input
            label="Community / Origin Group"
            placeholder="e.g. Kashmiri Pandit, Konkan Saraswat"
            value={community}
            onChangeText={setCommunity}
          />

          <Input
            label="Tribe (if applicable)"
            placeholder="e.g. Toda, Santhal"
            value={tribe}
            onChangeText={setTribe}
          />

          <Input
            label="Diet Classification"
            placeholder="e.g. Vegetarian, Satvik, Non-Vegetarian"
            value={dietType}
            onChangeText={setDietType}
          />

          <Input
            label="Rarity Status"
            placeholder="e.g. Common, Rare, Endangered, Dying Art"
            value={rarityStatus}
            onChangeText={setRarityStatus}
          />

          <Input
            label="Traditional Cooking Vessel"
            placeholder="e.g. Clay Pot (Deg), Copper Handi"
            value={cookingVessel}
            onChangeText={setCookingVessel}
          />

          <Input
            label="Traditional Cooking Medium"
            placeholder="e.g. Cold-pressed Mustard Oil, Cow Ghee"
            value={cookingMedium}
            onChangeText={setCookingMedium}
          />
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

export default RecipeCultureScreen;
