import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import AutocompleteInput from '../../../shared/components/AutocompleteInput';

const SOURCE_OPTIONS = [
  'Grandmother → Mother → Me',
  'Grandfather → Father → Me',
  'Community Elder',
  'Temple Kitchen',
  'Royal Kitchen',
  'Village Cook',
  'Tribal Community',
  'Historical Book',
  'Field Research',
  'Personal Adaptation',
  'Other',
];

export const RecipeHeritageSourceScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  
  const [heritageSource, setHeritageSource] = useState('');
  const [history, setHistory] = useState(''); // Story behind recipe
  const [whoTaughtYou, setWhoTaughtYou] = useState('');
  const [numGenerations, setNumGenerations] = useState('');
  const [approxAge, setApproxAge] = useState('');
  
  const [isHydrated, setIsHydrated] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (recipeDraft && !isHydrated) {
      setHeritageSource(recipeDraft.heritageSource || '');
      setHistory(recipeDraft.history || '');
      setWhoTaughtYou(recipeDraft.whoTaughtYou || '');
      setNumGenerations(recipeDraft.numGenerations || '');
      setApproxAge(recipeDraft.approxAge || '');
      setIsHydrated(true);
    }
  }, [recipeDraft, isHydrated]);

  const saveCurrentDraft = (silent = true) => {
    const updatedDraft = {
      ...(recipeDraft || {}),
      heritageSource,
      history,
      whoTaughtYou,
      numGenerations,
      approxAge,
    };
    saveRecipeDraft(updatedDraft, 'RecipeHeritageSource');
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
    let newErrors = {};
    if (!heritageSource) {
      newErrors.heritageSource = 'Please select a heritage source option';
    }
    if (!history.trim()) {
      newErrors.history = 'The story behind the recipe is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      saveCurrentDraft(true);
      navigation.navigate('RecipeIngredients');
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Add Recipe" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>STEP 3 OF 8</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '37.5%' }]} />
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Heritage Source & Lore</Text>
        <Text style={styles.sectionSubtitle}>
          Document the oral transmission and narrative lineage of the recipe.
        </Text>

        {/* Form Card */}
        <Card variant="default" style={styles.formCard}>
          <Text style={styles.label}>HOW DID THIS RECIPE REACH YOU? *</Text>
          
          {/* Options List */}
          <View style={styles.optionsList}>
            {SOURCE_OPTIONS.map((option) => {
              const isSelected = heritageSource === option;
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.8}
                  onPress={() => {
                    setErrors((prev) => ({ ...prev, heritageSource: '' }));
                    setHeritageSource(option);
                  }}
                  style={[
                    styles.optionRow,
                    isSelected ? styles.optionRowSelected : styles.optionRowUnselected,
                  ]}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.heritageSource && <Text style={styles.errorText}>{errors.heritageSource}</Text>}

          <View style={styles.separator} />

          <Input
            label="Story Behind Recipe / Narrative Lore *"
            placeholder="Share the family memories, regional associations, and historical context of this dish..."
            value={history}
            onChangeText={(text) => {
              setErrors((prev) => ({ ...prev, history: '' }));
              setHistory(text);
            }}
            multiline={true}
            numberOfLines={4}
            error={errors.history}
          />

          <AutocompleteInput
            label="Who Taught / Passed This Recipe to You?"
            placeholder="e.g. My maternal grandmother, Nani-jaan"
            value={whoTaughtYou}
            onChangeText={setWhoTaughtYou}
            suggestions={['Grandmother', 'Mother', 'Community Elder', 'Village Cook', 'Temple Priest']}
          />

          <View style={styles.numberRow}>
            <AutocompleteInput
              label="Generations Preserved"
              placeholder="e.g. 3"
              value={numGenerations}
              onChangeText={setNumGenerations}
              keyboardType="number-pad"
              suggestions={['2', '3', '4', '5']}
              style={styles.numberInput}
            />

            <AutocompleteInput
              label="Approx. Age (Years)"
              placeholder="e.g. 120"
              value={approxAge}
              onChangeText={setApproxAge}
              keyboardType="number-pad"
              suggestions={['50', '75', '100', '150', '200']}
              style={styles.numberInput}
            />
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
  label: {
    ...FONTS.labelCaps,
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.sm,
    letterSpacing: 1.2,
  },
  optionsList: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radiusMd,
    borderWidth: 1,
  },
  optionRowUnselected: {
    backgroundColor: 'transparent',
    borderColor: COLORS.borderLight,
  },
  optionRowSelected: {
    backgroundColor: COLORS.secondaryBackground,
    borderColor: COLORS.primary,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  numberInput: {
    flex: 1,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
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

export default RecipeHeritageSourceScreen;
