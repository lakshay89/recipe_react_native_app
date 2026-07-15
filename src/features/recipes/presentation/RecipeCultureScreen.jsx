import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import AutocompleteInput from '../../../shared/components/AutocompleteInput';
import { FESTIVALS_BY_STATE } from '../../../core/data/festivalsByState';
import { COOKING_EQUIPMENT } from '../../../core/data/cookingEquipment';
import recentCacheService from '../../../core/services/recentCacheService';

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
  const [heatSource, setHeatSource] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [recentVessels, setRecentVessels] = useState([]);

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
      setHeatSource(recipeDraft.heatSource || '');
      setIsHydrated(true);
    }
  }, [recipeDraft, isHydrated]);

  useEffect(() => {
    recentCacheService.getRecentItems('cooking_vessels').then(setRecentVessels);
  }, []);

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
      heatSource,
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
    if (cookingVessel.trim()) {
      recentCacheService.addRecentItem('cooking_vessels', cookingVessel);
    }
    saveCurrentDraft(true);
    navigation.navigate('RecipeMediaUpload');
  };

  // Get festival suggestions based on selected state in Step 2
  const stateSelected = recipeDraft?.region || '';
  const festivalSuggestions = FESTIVALS_BY_STATE[stateSelected] || 
    Array.from(new Set(Object.values(FESTIVALS_BY_STATE).flat()));

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
          <AutocompleteInput
            label="Associated Festival / Occasion"
            placeholder="e.g. Maha Shivratri, Eid-ul-Fitr"
            value={festival}
            onChangeText={setFestival}
            suggestions={festivalSuggestions}
          />

          <Input
            label="Associated Season"
            placeholder="e.g. Winter (Shishir), Monsoon (Varsha)"
            value={season}
            onChangeText={setSeason}
          />
          <View style={styles.chipRow}>
            {['Summer', 'Winter', 'Monsoon', 'Spring', 'All Season'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.suggestionChip}
                onPress={() => setSeason(chip)}
              >
                <Text style={styles.suggestionChipText}>🍂 {chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
          <View style={styles.chipRow}>
            {['Vegetarian', 'Non Vegetarian', 'Vegan', 'Eggetarian', 'Jain'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.suggestionChip}
                onPress={() => setDietType(chip)}
              >
                <Text style={styles.suggestionChipText}>🥬 {chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Rarity Status"
            placeholder="e.g. Common, Rare, Endangered, Dying Art"
            value={rarityStatus}
            onChangeText={setRarityStatus}
          />
          <View style={styles.chipRow}>
            {['Common', 'Rare', 'Nearly Forgotten', 'Extinct', 'Revived'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.suggestionChip}
                onPress={() => setRarityStatus(chip)}
              >
                <Text style={styles.suggestionChipText}>⭐ {chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <AutocompleteInput
            label="Traditional Cooking Vessel"
            placeholder="e.g. Clay Pot (Deg), Copper Handi"
            value={cookingVessel}
            onChangeText={setCookingVessel}
            suggestions={COOKING_EQUIPMENT}
          />
          <View style={styles.chipRow}>
            {['Pan', 'Kadai', 'Tawa', 'Pressure Cooker', 'Clay Pot', 'Handi', 'Patila'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.suggestionChip}
                onPress={() => setCookingVessel(chip)}
              >
                <Text style={styles.suggestionChipText}>🥘 {chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {recentVessels.length > 0 && (
            <View style={styles.chipRow}>
              {recentVessels.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={styles.suggestionChip}
                  onPress={() => setCookingVessel(v)}
                >
                  <Text style={styles.suggestionChipText}>🕒 {v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label="Traditional Cooking Medium (Oil/Ghee)"
            placeholder="e.g. Cold-pressed Mustard Oil, Cow Ghee"
            value={cookingMedium}
            onChangeText={setCookingMedium}
          />
          <View style={styles.chipRow}>
            {['Mustard Oil', 'Cow Ghee', 'Coconut Oil', 'Sesame Oil', 'Peanut Oil', 'Butter', 'None'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.suggestionChip}
                onPress={() => setCookingMedium(chip)}
              >
                <Text style={styles.suggestionChipText}>💧 {chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Traditional Heat Source / Fuel"
            placeholder="e.g. Gas Stovetop, Wood Fire, Charcoal"
            value={heatSource}
            onChangeText={setHeatSource}
          />
          <View style={styles.chipRow}>
            {['Gas Stovetop', 'Charcoal', 'Wood Fire', 'Clay Oven (Tandoor)', 'Induction Cooktop', 'Electric Oven'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.suggestionChip}
                onPress={() => setHeatSource(chip)}
              >
                <Text style={styles.suggestionChipText}>🔥 {chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  suggestionChip: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionChipText: {
    ...FONTS.caption,
    fontSize: 12,
    color: COLORS.primary,
  },
});

export default RecipeCultureScreen;
