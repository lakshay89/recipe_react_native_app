import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const RecipeCookingMethodScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [totalTime, setTotalTime] = useState('');
  const [cookingSteps, setCookingSteps] = useState([{ detail: '' }]);
  const [traditionalTips, setTraditionalTips] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (recipeDraft && !isHydrated) {
      setPrepTime(recipeDraft.prepTime || '');
      setCookTime(recipeDraft.cookTime || '');
      setTotalTime(recipeDraft.totalTime || '');
      setTraditionalTips(recipeDraft.traditionalTips || '');
      if (recipeDraft.cookingStepsList && recipeDraft.cookingStepsList.length > 0) {
        setCookingSteps(recipeDraft.cookingStepsList);
      }
      setIsHydrated(true);
    }
  }, [recipeDraft, isHydrated]);

  // Auto calculate total time
  useEffect(() => {
    const prep = parseInt(prepTime, 10) || 0;
    const cook = parseInt(cookTime, 10) || 0;
    if (prep > 0 || cook > 0) {
      setTotalTime((prep + cook).toString());
    } else {
      setTotalTime('');
    }
  }, [prepTime, cookTime]);

  const saveCurrentDraft = (silent = true) => {
    // Format instructions list into a single clean string
    const formattedText = cookingSteps
      .filter((step) => step.detail.trim())
      .map((step, index) => `Step ${index + 1}: ${step.detail.trim()}`)
      .join('\n');

    const updatedDraft = {
      ...(recipeDraft || {}),
      prepTime,
      cookTime,
      totalTime,
      cookingStepsList: cookingSteps,
      instructions: formattedText, // Map to main model string
      traditionalTips,
    };
    saveRecipeDraft(updatedDraft, 'RecipeCookingMethod');
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

  const handleAddStep = () => {
    setCookingSteps([...cookingSteps, { detail: '' }]);
  };

  const handleRemoveStep = (index) => {
    if (cookingSteps.length === 1) return;
    const newSteps = [...cookingSteps];
    newSteps.splice(index, 1);
    setCookingSteps(newSteps);
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...cookingSteps];
    newSteps[index].detail = value;
    setCookingSteps(newSteps);
  };

  const handleNext = () => {
    const validSteps = cookingSteps.filter((step) => step.detail.trim());
    if (validSteps.length === 0) {
      Alert.alert('Validation Error', 'Please specify at least one cooking instruction step.');
      return;
    }

    saveCurrentDraft(true);
    navigation.navigate('RecipeCulture');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Add Recipe" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>STEP 5 OF 8</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '62.5%' }]} />
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Cooking Method</Text>
        <Text style={styles.sectionSubtitle}>
          Specify prep/cook durations and outline traditional preparation steps.
        </Text>

        {/* Form Card */}
        <Card variant="default" style={styles.formCard}>
          {/* Timings Row */}
          <View style={styles.timingsRow}>
            <Input
              label="Prep Time (mins)"
              placeholder="e.g. 15"
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="number-pad"
              style={styles.timingInput}
            />

            <Input
              label="Cook Time (mins)"
              placeholder="e.g. 30"
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="number-pad"
              style={styles.timingInput}
            />

            <Input
              label="Total Time (mins)"
              placeholder="e.g. 45"
              value={totalTime}
              onChangeText={setTotalTime}
              keyboardType="number-pad"
              style={styles.timingInput}
            />
          </View>

          <View style={styles.miniChipRow}>
            <Text style={styles.miniLabel}>Prep: </Text>
            {['15', '20', '30', '45', '60'].map((chip) => (
              <TouchableOpacity
                key={`prep-${chip}`}
                style={styles.miniChip}
                onPress={() => setPrepTime(chip)}
              >
                <Text style={styles.miniChipText}>{chip}m</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.miniChipRow, { marginTop: 4, marginBottom: 12 }]}>
            <Text style={styles.miniLabel}>Cook: </Text>
            {['15', '20', '30', '45', '60'].map((chip) => (
              <TouchableOpacity
                key={`cook-${chip}`}
                style={styles.miniChip}
                onPress={() => setCookTime(chip)}
              >
                <Text style={styles.miniChipText}>{chip}m</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.separator} />

          {recipeDraft?.title && (recipeDraft.title.toLowerCase().includes('kebab') || recipeDraft.title.toLowerCase().includes('chicken')) && (
            <TouchableOpacity
              style={styles.templateBtn}
              onPress={() => {
                const suggestedSteps = [
                  { detail: 'In a bowl, mix minced chicken with chopped onion, ginger-garlic paste, and green chillies.' },
                  { detail: 'Add garam masala, cumin seeds, salt, and fresh coriander, and marinate for 30 minutes.' },
                  { detail: 'Shape the mixture onto skewers firmly.' },
                  { detail: 'Cook on a hot tawa or grill over charcoal heat until golden and fully cooked.' },
                  { detail: 'Serve hot with lemon wedges and mint chutney.' }
                ];
                setCookingSteps(suggestedSteps);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.templateBtnText}>💡 Auto-Fill Steps for "{recipeDraft.title}"</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.label}>STEP-BY-STEP METHOD *</Text>

          {/* Dynamic instruction inputs */}
          {cookingSteps.map((item, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepLabel}>Step {index + 1}</Text>
                {cookingSteps.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveStep(index)}
                    style={styles.removeBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <Input
                placeholder="e.g. Wash and boil potatoes in salted water until tender..."
                value={item.detail}
                onChangeText={(val) => handleStepChange(index, val)}
                multiline={true}
                numberOfLines={3}
                style={styles.stepInputBox}
              />
            </View>
          ))}

          {/* Add Step Button */}
          <Button
            title="+ Add Step"
            variant="outline"
            onPress={handleAddStep}
            style={styles.addStepButton}
          />

          <View style={styles.separator} />

          <Input
            label="Traditional Cooking Tips"
            placeholder="e.g. Using a brass pot increases heat retention, or grind spices on a sil-batta..."
            value={traditionalTips}
            onChangeText={setTraditionalTips}
            multiline={true}
            numberOfLines={2}
          />

          <View style={styles.chipRow}>
            {['Cook on charcoal', 'Use iron tawa', 'Slow cooking', 'Clay pot cooking'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.suggestionChip}
                onPress={() => {
                  setTraditionalTips((prev) => {
                    const cleanPrev = prev.trim();
                    if (!cleanPrev) return chip;
                    return `${cleanPrev}, ${chip.toLowerCase()}`;
                  });
                }}
              >
                <Text style={styles.suggestionChipText}>+ {chip}</Text>
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
  timingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  timingInput: {
    flex: 1,
    marginVertical: 0,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  label: {
    ...FONTS.labelCaps,
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.md,
    letterSpacing: 1.2,
  },
  stepRow: {
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDERS.radiusMd,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stepLabel: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  removeBtn: {
    paddingHorizontal: SPACING.xs,
  },
  removeText: {
    ...FONTS.caption,
    fontWeight: '700',
    color: COLORS.error,
  },
  stepInputBox: {
    marginVertical: 0,
  },
  addStepButton: {
    borderColor: COLORS.primary,
    marginVertical: SPACING.sm,
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
  miniChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.xs,
  },
  miniLabel: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    width: 45,
  },
  miniChip: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  miniChipText: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.primary,
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
  templateBtn: {
    backgroundColor: '#F7EDE2',
    borderWidth: 1.5,
    borderColor: '#ECE3D7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  templateBtnText: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.primary,
  },
});

export default RecipeCookingMethodScreen;
