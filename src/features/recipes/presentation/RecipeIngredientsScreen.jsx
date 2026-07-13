import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ChevronDown, Search, X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import AutocompleteInput from '../../../shared/components/AutocompleteInput';
import { INGREDIENTS } from '../../../core/data/ingredientsData';
import recentCacheService from '../../../core/services/recentCacheService';

const UNIT_CATEGORIES = [
  {
    title: 'Weight',
    items: ['Gram (g)', 'Kilogram (kg)', 'Milligram (mg)']
  },
  {
    title: 'Volume',
    items: ['Millilitre (ml)', 'Litre (L)', 'Teaspoon (tsp)', 'Tablespoon (tbsp)', 'Cup', 'Glass']
  },
  {
    title: 'Count',
    items: ['Piece', 'Slice', 'Clove', 'Leaf', 'Stick', 'Packet', 'Bottle', 'Bowl']
  },
  {
    title: 'Traditional Indian',
    items: ['Pinch', 'Handful', 'Small Bowl (Katori)', 'Large Bowl', 'Ladle']
  },
  {
    title: 'Other',
    items: ['To Taste', 'As Required']
  }
];

export const RecipeIngredientsScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  
  const [serves, setServes] = useState('4');
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: '', notes: '' }
  ]);

  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [dropdownQuery, setDropdownQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [recentIngredients, setRecentIngredients] = useState([]);

  useEffect(() => {
    if (recipeDraft && !isHydrated) {
      if (recipeDraft.serves) {
        setServes(recipeDraft.serves);
      }
      if (recipeDraft.ingredientsList && recipeDraft.ingredientsList.length > 0) {
        setIngredients(recipeDraft.ingredientsList);
      }
      setIsHydrated(true);
    }
  }, [recipeDraft, isHydrated]);

  useEffect(() => {
    recentCacheService.getRecentItems('ingredients').then(setRecentIngredients);
  }, []);

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
    saveRecipeDraft(updatedDraft, 'RecipeIngredients');
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

  const handleOpenDropdown = (index) => {
    setActiveDropdownIndex(index);
    setDropdownQuery('');
    setShowModal(true);
  };

  const handleSelectUnit = (unit) => {
    handleFieldChange(activeDropdownIndex, 'unit', unit);
    setShowModal(false);
    setActiveDropdownIndex(null);
  };

  const handleSelectRecentIngredient = (name) => {
    // If the last ingredient row is empty, populate it. Otherwise add a new row.
    const lastIng = ingredients[ingredients.length - 1];
    if (ingredients.length === 1 && !lastIng.name.trim() && !lastIng.quantity && !lastIng.unit && !lastIng.notes) {
      const updated = [...ingredients];
      updated[0].name = name;
      setIngredients(updated);
    } else {
      setIngredients([...ingredients, { name, quantity: '', unit: '', notes: '' }]);
    }
  };

  const handleNext = () => {
    // Validate ingredients list
    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Validation Error', 'Please specify at least one ingredient name.');
      return;
    }

    validIngredients.forEach((ing) => {
      recentCacheService.addRecentItem('ingredients', ing.name);
    });

    saveCurrentDraft(true);
    navigation.navigate('RecipeCookingMethod');
  };

  const activeIngName = activeDropdownIndex !== null ? (ingredients[activeDropdownIndex]?.name || '') : '';
  const matchedIng = INGREDIENTS.find(
    (ing) => ing.name.toLowerCase() === activeIngName.toLowerCase() ||
             (ing.aliases && ing.aliases.some(alias => alias.toLowerCase() === activeIngName.toLowerCase()))
  );
  const recommendedUnits = matchedIng ? matchedIng.recommendedUnits : [];

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
          
          {recipeDraft?.title && (recipeDraft.title.toLowerCase().includes('kebab') || recipeDraft.title.toLowerCase().includes('chicken')) && (
            <TouchableOpacity
              style={styles.templateBtn}
              onPress={() => {
                const suggested = [
                  { name: 'Chicken', quantity: '500', unit: 'Gram (g)', notes: 'minced' },
                  { name: 'Onion', quantity: '1', unit: 'Piece', notes: 'finely chopped' },
                  { name: 'Ginger', quantity: '1', unit: 'Teaspoon (tsp)', notes: 'paste' },
                  { name: 'Garlic', quantity: '1', unit: 'Teaspoon (tsp)', notes: 'paste' },
                  { name: 'Green Chilli', quantity: '2', unit: 'Piece', notes: 'chopped' },
                  { name: 'Fresh Coriander', quantity: '2', unit: 'Tablespoon (tbsp)', notes: 'chopped' },
                  { name: 'Garam Masala', quantity: '1', unit: 'Teaspoon (tsp)', notes: '' },
                  { name: 'Cumin Seeds', quantity: '1', unit: 'Teaspoon (tsp)', notes: 'powder' }
                ];
                setIngredients(suggested);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.templateBtnText}>💡 Auto-Fill Ingredients for "{recipeDraft.title}"</Text>
            </TouchableOpacity>
          )}

          {recentIngredients.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.dropdownLabel}>Recent Ingredients</Text>
              <View style={styles.miniChipRow}>
                {recentIngredients.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.miniChip}
                    onPress={() => handleSelectRecentIngredient(item)}
                  >
                    <Text style={styles.miniChipText}>+ {item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

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

              <AutocompleteInput
                label="Ingredient Name *"
                placeholder="e.g. Mustard seeds"
                value={item.name}
                onChangeText={(val) => handleFieldChange(index, 'name', val)}
                suggestions={INGREDIENTS}
                style={styles.fieldCompact}
              />

              <View style={styles.proportionRow}>
                <View style={styles.propInput}>
                  <Input
                    label="Quantity"
                    placeholder="e.g. 2"
                    value={item.quantity}
                    onChangeText={(val) => handleFieldChange(index, 'quantity', val)}
                    style={styles.fieldCompact}
                  />
                  <View style={styles.miniChipRow}>
                    {['1', '100', '250', '500'].map((chip) => (
                      <TouchableOpacity
                        key={chip}
                        style={styles.miniChip}
                        onPress={() => handleFieldChange(index, 'quantity', chip)}
                      >
                        <Text style={styles.miniChipText}>{chip}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Searchable Unit Dropdown Trigger */}
                <View style={styles.propInput}>
                  <Text style={styles.dropdownLabel}>Unit</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => handleOpenDropdown(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownValue, !item.unit && styles.placeholderText]} numberOfLines={1}>
                      {item.unit || 'Select Unit'}
                    </Text>
                    <ChevronDown size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <Input
                label="Preparation notes"
                placeholder="e.g. crushed, soaked overnight"
                value={item.notes}
                onChangeText={(val) => handleFieldChange(index, 'notes', val)}
                style={styles.fieldCompact}
              />
              <View style={styles.miniChipRow}>
                {['chopped', 'minced', 'cubed', 'sliced', 'soaked'].map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={styles.miniChip}
                    onPress={() => handleFieldChange(index, 'notes', chip)}
                  >
                    <Text style={styles.miniChipText}>+ {chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
      {/* Searchable Units Modal Selector */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Ingredient Unit</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.modalSearchRow}>
              <Search size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search units (e.g. Gram, Katori, Pinch)..."
                value={dropdownQuery}
                onChangeText={setDropdownQuery}
                placeholderTextColor={COLORS.textMuted}
                autoCorrect={false}
              />
            </View>

            {/* Scrollable list of units */}
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {recommendedUnits.length > 0 && !dropdownQuery && (
                <View style={styles.categoryBlock}>
                  <Text style={[styles.categoryTitle, { color: COLORS.primary }]}>RECOMMENDED UNITS</Text>
                  <View style={styles.optionsList}>
                    {recommendedUnits.map(unit => (
                      <TouchableOpacity
                        key={`rec-${unit}`}
                        style={styles.optionItem}
                        onPress={() => handleSelectUnit(unit)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.optionText, { fontWeight: '700', color: COLORS.secondary }]}>{unit}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {UNIT_CATEGORIES.map(category => {
                const matchedItems = category.items.filter(unit =>
                  unit.toLowerCase().includes(dropdownQuery.toLowerCase())
                );
                
                if (matchedItems.length === 0) return null;

                return (
                  <View key={category.title} style={styles.categoryBlock}>
                    <Text style={styles.categoryTitle}>{category.title.toUpperCase()}</Text>
                    <View style={styles.optionsList}>
                      {matchedItems.map(unit => (
                        <TouchableOpacity
                          key={unit}
                          style={styles.optionItem}
                          onPress={() => handleSelectUnit(unit)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.optionText}>{unit}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dropdownLabel: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: BORDERS.radiusMd,
    paddingHorizontal: SPACING.md,
    height: 40,
  },
  dropdownValue: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    marginRight: 6,
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(47, 43, 40, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FBF7F1',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE3D7',
  },
  modalTitle: {
    ...FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.secondary,
  },
  closeBtn: {
    padding: 4,
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: BORDERS.radiusMd,
    margin: SPACING.lg,
    paddingHorizontal: SPACING.md,
    height: 42,
  },
  modalSearchInput: {
    flex: 1,
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 0,
  },
  modalScroll: {
    paddingHorizontal: SPACING.lg,
  },
  categoryBlock: {
    marginBottom: SPACING.lg,
  },
  categoryTitle: {
    ...FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    letterSpacing: 1.5,
  },
  optionsList: {
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: BORDERS.radiusMd,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EE',
  },
  optionText: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
  },
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
  miniChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
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

export default RecipeIngredientsScreen;
