import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Check, Edit, MapPin, Clock, Users, BookOpen } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import ConfidenceBadge from './components/ConfidenceBadge';
import SourceBadge from './components/SourceBadge';
import recipeParsingService from '../services/recipeParsingService';
import recipeImportService from '../services/recipeImportService';

export const StructuredRecipeReviewScreen = ({ route, navigation }) => {
  const { rawText, sourceImages, ocrConfidence } = route.params || { rawText: '', sourceImages: [], ocrConfidence: 0.95 };

  const [isLoading, setIsLoading] = useState(true);
  const [parsedData, setParsedData] = useState(null);
  
  // Confirmed fields tracker
  const [confirmed, setConfirmed] = useState({
    title: false,
    localName: false,
    region: false,
    prepTime: false,
    cookTime: false,
    serves: false,
    ingredientsList: false,
    cookingStepsList: false,
  });

  // Edit states for individual fields
  const [editingField, setEditingField] = useState(null); // 'title' | 'localName' | 'region' | 'prepTime' | 'cookTime' | 'serves'
  const [tempValue, setTempValue] = useState('');
  const [corrections, setCorrections] = useState({});

  const runParsing = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await recipeParsingService.parseRecipeText(rawText);
      setParsedData(result);
    } catch (e) {
      Alert.alert('Parser Error', 'Failed to structure recipe data automatically. You can review and enter manually.');
    } finally {
      setIsLoading(false);
    }
  }, [rawText]);

  useEffect(() => {
    runParsing();
  }, [runParsing]);

  const handleConfirmField = (field) => {
    setConfirmed({
      ...confirmed,
      [field]: true,
    });
  };

  const handleEditField = (field, currentVal) => {
    setEditingField(field);
    setTempValue(currentVal || '');
  };

  const handleSaveEdit = (field) => {
    setParsedData({
      ...parsedData,
      [field]: tempValue,
    });
    setCorrections({
      ...corrections,
      [field]: tempValue,
    });
    setConfirmed({
      ...confirmed,
      [field]: true, // Auto-confirm on edit
    });
    setEditingField(null);
  };

  const handleNextStep = () => {
    // Stage 7: Draft creation
    const finalDraft = recipeImportService.buildImportDraft(parsedData, rawText, sourceImages, corrections);
    
    // Check if there are missing fields
    if (finalDraft.missingFields.length > 0) {
      navigation.navigate('MissingFields', { draftPayload: finalDraft });
    } else {
      saveAndLaunchWizard(finalDraft);
    }
  };

  const saveAndLaunchWizard = async (draft) => {
    try {
      await recipeImportService.saveToDrafts(draft);
      Alert.alert('Draft Created', 'Recipe details successfully structured and saved to your drafts list.', [
        {
          text: 'Open Wizard',
          onPress: () => navigation.navigate('RecipeIdentity'),
        }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save draft.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="AI Recipe Structuring" showBack={true} showAvatar={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Structuring recipe fields via culinary parser...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />
      <Header title="Confirm Recipe Fields" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quality Check Status Plaque */}
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Extraction Completeness</Text>
          <ConfidenceBadge confidence={ocrConfidence} />
        </View>

        {/* 1. Recipe Name field */}
        <Card variant="default" style={[styles.fieldCard, confirmed.title && styles.confirmedCard]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.fieldLabel}>Recipe Name</Text>
              <SourceBadge source={corrections.title ? 'user_corrected' : 'ocr_extracted'} />
            </View>
            <TouchableOpacity onPress={() => handleEditField('title', parsedData.title)} style={styles.editBtn}>
              <Edit size={14} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
          {editingField === 'title' ? (
            <View style={styles.editRow}>
              <TextInput style={styles.input} value={tempValue} onChangeText={setTempValue} />
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveEdit('title')}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fieldValueRow}>
              <Text style={styles.fieldValue}>{parsedData.title || '(Not found)'}</Text>
              {!confirmed.title && (
                <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirmField('title')}>
                  <Check size={14} color={COLORS.white} />
                  <Text style={styles.confirmBtnText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        {/* 2. Local Name field */}
        <Card variant="default" style={[styles.fieldCard, confirmed.localName && styles.confirmedCard]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.fieldLabel}>Local / Native Name</Text>
              <SourceBadge source={corrections.localName ? 'user_corrected' : 'ocr_extracted'} />
            </View>
            <TouchableOpacity onPress={() => handleEditField('localName', parsedData.localName)} style={styles.editBtn}>
              <Edit size={14} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
          {editingField === 'localName' ? (
            <View style={styles.editRow}>
              <TextInput style={styles.input} value={tempValue} onChangeText={setTempValue} />
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveEdit('localName')}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fieldValueRow}>
              <Text style={styles.fieldValue}>{parsedData.localName || '(Not found)'}</Text>
              {!confirmed.localName && (
                <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirmField('localName')}>
                  <Check size={14} color={COLORS.white} />
                  <Text style={styles.confirmBtnText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        {/* 3. Metadata Row (Servings, Prep, Cook) */}
        <Card variant="default" style={styles.metaCard}>
          <Text style={styles.sectionTitle}>Preparation Details</Text>
          <View style={styles.metaGrid}>
            {/* Serves */}
            <View style={styles.metaItem}>
              <Users size={14} color={COLORS.secondary} style={styles.metaIcon} />
              <Text style={styles.metaLabel}>Serves</Text>
              <Text style={styles.metaValue}>{parsedData.serves || '4'}</Text>
              <TouchableOpacity style={styles.metaEditBtn} onPress={() => handleEditField('serves', parsedData.serves)}>
                <Edit size={10} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            
            {/* Prep Time */}
            <View style={styles.metaItem}>
              <Clock size={14} color={COLORS.secondary} style={styles.metaIcon} />
              <Text style={styles.metaLabel}>Prep Time</Text>
              <Text style={styles.metaValue}>{parsedData.prepTime || 'N/A'}</Text>
              <TouchableOpacity style={styles.metaEditBtn} onPress={() => handleEditField('prepTime', parsedData.prepTime)}>
                <Edit size={10} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Cook Time */}
            <View style={styles.metaItem}>
              <Clock size={14} color={COLORS.secondary} style={styles.metaIcon} />
              <Text style={styles.metaLabel}>Cook Time</Text>
              <Text style={styles.metaValue}>{parsedData.cookTime || 'N/A'}</Text>
              <TouchableOpacity style={styles.metaEditBtn} onPress={() => handleEditField('cookTime', parsedData.cookTime)}>
                <Edit size={10} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {editingField && ['serves', 'prepTime', 'cookTime'].includes(editingField) && (
            <View style={styles.metaEditInputRow}>
              <TextInput style={styles.input} value={tempValue} onChangeText={setTempValue} />
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveEdit(editingField)}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* 4. Geography details */}
        <Card variant="default" style={[styles.fieldCard, confirmed.region && styles.confirmedCard]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} color={COLORS.secondary} />
              <Text style={styles.fieldLabel}>Origin / State</Text>
            </View>
            <TouchableOpacity onPress={() => handleEditField('region', parsedData.region)} style={styles.editBtn}>
              <Edit size={14} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
          {editingField === 'region' ? (
            <View style={styles.editRow}>
              <TextInput style={styles.input} value={tempValue} onChangeText={setTempValue} />
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveEdit('region')}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fieldValueRow}>
              <Text style={styles.fieldValue}>{parsedData.region || parsedData.state || '(Not found)'}</Text>
              {!confirmed.region && (
                <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirmField('region')}>
                  <Check size={14} color={COLORS.white} />
                  <Text style={styles.confirmBtnText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        {/* 5. Ingredients list preview */}
        <Card variant="default" style={styles.listCard}>
          <View style={styles.listHeader}>
            <BookOpen size={16} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Ingredients List ({parsedData.ingredientsList?.length || 0})</Text>
          </View>
          <View style={styles.listContainer}>
            {parsedData.ingredientsList?.map((ing, idx) => (
              <View key={ing.id || idx} style={styles.listItem}>
                <Text style={styles.itemBullet}>•</Text>
                <Text style={styles.itemText}>
                  <Text style={styles.itemStrong}>{ing.name}</Text>: {ing.quantity} {ing.unit} {ing.notes ? `(${ing.notes})` : ''}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Footer Forward Action */}
      <View style={styles.footer}>
        <Button
          title="Verify & Proceed"
          variant="primary"
          onPress={handleNextStep}
          style={styles.nextBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  statusBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 12,
    padding: 10,
    marginBottom: SPACING.md,
  },
  statusLabel: {
    ...FONTS.caption,
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  fieldCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    ...SHADOWS.soft,
  },
  confirmedCard: {
    borderColor: '#C5E0B4',
    backgroundColor: '#FAFDF6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  fieldLabel: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  editBtn: {
    padding: 4,
  },
  fieldValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  confirmBtnText: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '700',
  },
  editRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    color: COLORS.text,
    backgroundColor: '#FAF8F4',
    ...FONTS.body,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  saveText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },
  metaCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    ...SHADOWS.soft,
  },
  sectionTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#FAF5EE',
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  metaIcon: {
    marginBottom: 4,
  },
  metaLabel: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metaValue: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  metaEditBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  metaEditInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  listCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    ...SHADOWS.soft,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  listContainer: {
    gap: 6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemBullet: {
    marginRight: 6,
    color: COLORS.secondary,
  },
  itemText: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
  },
  itemStrong: {
    fontWeight: '700',
    color: COLORS.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: '#FBF7F1',
    borderTopWidth: 1,
    borderTopColor: '#ECE3D7',
  },
  nextBtn: {
    width: '100%',
  },
});

export default StructuredRecipeReviewScreen;
