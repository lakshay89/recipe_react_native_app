import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

export const RecipeIngredientsScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  
  const [serves, setServes] = useState('4');
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: '', notes: '' }
  ]);

  useEffect(() => {
    if (recipeDraft) {
      if (recipeDraft.serves) {
        setServes(recipeDraft.serves);
      }
      if (recipeDraft.ingredientsList && recipeDraft.ingredientsList.length > 0) {
        setIngredients(recipeDraft.ingredientsList);
      }
    }
  }, [recipeDraft]);

  const saveCurrentDraft = (silent = true) => {
    // Also build a formatted string representing the ingredient details
    const formattedText = ingredients
      .filter((ing) => ing.name.trim())
      .map((ing) => `${ing.name.trim()} (${ing.quantity || ''} ${ing.unit || ''}) ${ing.notes ? `- ${ing.notes}` : ''}`)
      .join('\n');

    const updatedDraft = {
      ...(recipeDraft || {}),
      serves,
      ingredientsList: ingredients,
      ingredients: formattedText, // Map to main model string
    };
    saveRecipeDraft(updatedDraft);
    if (!silent) {
      Alert.alert('Draft Saved', 'Your progress has been saved locally.');
    }
    return updatedDraft;
  };

  const handleAddRow = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '', notes: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (ingredients.length === 1) return;
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleFieldChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleNext = () => {
    // Validate ingredients list
    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Validation Error', 'Please specify at least one ingredient name.');
      return;
    }

    saveCurrentDraft(true);
    navigation.navigate('RecipeCookingMethod');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Add Recipe" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>STEP 4 OF 8</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '50%' }]} />
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Ingredients List</Text>
        <Text style={styles.sectionSubtitle}>
          Define servings proportion and detail each raw ingredient.
        </Text>

        {/* Form Card */}
        <Card variant="default" style={styles.formCard}>
          <Input
            label="Servings (Serves Count) *"
            placeholder="e.g. 4"
            value={serves}
            onChangeText={setServes}
            keyboardType="number-pad"
          />

          <View style={styles.separator} />
          
          <Text style={styles.label}>INGREDIENTS DETAILS *</Text>

          {/* Dynamic rows */}
          {ingredients.map((item, index) => (
            <View key={index} style={styles.ingredientRowCard}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowNumber}>Ingredient #{index + 1}</Text>
                {ingredients.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveRow(index)}
                    style={styles.removeBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label="Ingredient Name *"
                placeholder="e.g. Mustard seeds"
                value={item.name}
                onChangeText={(val) => handleFieldChange(index, 'name', val)}
                style={styles.fieldCompact}
              />

              <View style={styles.proportionRow}>
                <Input
                  label="Quantity"
                  placeholder="e.g. 2"
                  value={item.quantity}
                  onChangeText={(val) => handleFieldChange(index, 'quantity', val)}
                  style={styles.propInput}
                />
                
                <Input
                  label="Unit"
                  placeholder="e.g. tsp, grams"
                  value={item.unit}
                  onChangeText={(val) => handleFieldChange(index, 'unit', val)}
                  style={styles.propInput}
                />
              </View>

              <Input
                label="Preparation notes"
                placeholder="e.g. crushed, soaked overnight"
                value={item.notes}
                onChangeText={(val) => handleFieldChange(index, 'notes', val)}
                style={styles.fieldCompact}
              />
            </View>
          ))}

          {/* Add Row Button */}
          <Button
            title="+ Add Ingredient"
            variant="outline"
            onPress={handleAddRow}
            style={styles.addRowButton}
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
  ingredientRowCard: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDERS.radiusMd,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  rowNumber: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  removeBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  removeBtnText: {
    ...FONTS.caption,
    fontWeight: '700',
    color: COLORS.error,
  },
  fieldCompact: {
    marginVertical: 0,
    marginBottom: SPACING.sm,
  },
  proportionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  propInput: {
    flex: 1,
    marginVertical: 0,
  },
  addRowButton: {
    borderColor: COLORS.primary,
    marginVertical: SPACING.md,
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

export default RecipeIngredientsScreen;
