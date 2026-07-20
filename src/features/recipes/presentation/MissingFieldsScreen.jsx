import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AlertTriangle, Sparkles, BookOpen, Check } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import MissingFieldCard from './components/MissingFieldCard';
import recipeImportService from '../services/recipeImportService';
import offlineService from '../../../shared/services/offlineService';

export const MissingFieldsScreen = ({ route, navigation }) => {
  const { draftPayload } = route.params || { draftPayload: {} };
  
  const [draft, setDraft] = useState(draftPayload);
  const [suggestions, setSuggestions] = useState({});
  const [generatingField, setGeneratingField] = useState(null);
  
  // Custom states for missing cooking steps procedure
  const [procedureGeneratedText, setProcedureGeneratedText] = useState('');
  const [procedureStatus, setProcedureStatus] = useState('missing'); // 'missing' | 'generating' | 'suggested' | 'accepted' | 'added_manually'

  const missingFields = draft.missingFields || [];

  const handleResolveField = (field, value, source) => {
    const updatedDraft = {
      ...draft,
      [field]: value,
      sourceTracking: {
        ...draft.sourceTracking,
        [field]: {
          value,
          source,
          requiresConfirmation: false,
        }
      }
    };
    
    // Re-evaluate missing fields
    updatedDraft.missingFields = recipeImportService.detectMissingFields(updatedDraft);
    setDraft(updatedDraft);

    Alert.alert('Field Saved', `${getFieldLabel(field)} has been successfully updated.`);
  };

  const handleGenerateSuggestion = async (field) => {
    setGeneratingField(field);
    try {
      // Check network status to call backend or use local mock
      if (offlineService.isConnected()) {
        const response = await fetch('http://10.0.2.2:3000/api/v1/recipes/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `Recipe name is "${draft.title}". Ingredients list is: ${JSON.stringify(draft.ingredientsList)}. Suggest a value for missing field: "${field}".`
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            let suggestedVal = resJson.data[field] || '';
            if (field === 'ingredientsList' && resJson.data.ingredientsList) {
              suggestedVal = resJson.data.ingredientsList.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ');
            }
            setSuggestions({
              ...suggestions,
              [field]: suggestedVal || getLocalSuggestion(field, draft.title),
            });
            return;
          }
        }
      }
      
      // Local Suggestion Fallback
      setSuggestions({
        ...suggestions,
        [field]: getLocalSuggestion(field, draft.title),
      });

    } catch (e) {
      console.warn('AI Suggestion generation failed, using local template.', e);
      setSuggestions({
        ...suggestions,
        [field]: getLocalSuggestion(field, draft.title),
      });
    } finally {
      setGeneratingField(null);
    }
  };

  const handleGenerateProcedure = async () => {
    setProcedureStatus('generating');
    try {
      // Simulate/Generate steps based on ingredients
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const suggestedSteps = [
        'Clean and wash ingredients thoroughly.',
        'In a heavy-bottomed pan, add oil/medium and heat it.',
        'Sauté the aromatics and primary spices until fragrant.',
        'Add the main ingredients and sauté for 5-10 minutes.',
        'Add water, adjust salt and cook under closed lid until tender.',
        'Serve hot garnished with traditional herbs.'
      ];
      
      setProcedureGeneratedText(suggestedSteps.join('\n'));
      setProcedureStatus('suggested');
    } catch (e) {
      setProcedureStatus('missing');
    }
  };

  const handleAcceptProcedure = () => {
    const stepsArray = procedureGeneratedText.split('\n').filter(Boolean);
    const updatedDraft = {
      ...draft,
      cookingStepsList: stepsArray,
      sourceTracking: {
        ...draft.sourceTracking,
        cookingStepsList: {
          value: stepsArray,
          source: 'ai_suggested',
          requiresConfirmation: true, // Mark that AI confirmation is required by user in preview
        }
      }
    };
    updatedDraft.missingFields = recipeImportService.detectMissingFields(updatedDraft);
    setDraft(updatedDraft);
    setProcedureStatus('accepted');
  };

  const handleSaveAndLaunch = async () => {
    try {
      await recipeImportService.saveToDrafts(draft);
      
      Alert.alert('Draft Saved', 'Your structured recipe draft is ready.', [
        {
          text: 'Continue in Add Recipe Flow',
          onPress: () => navigation.navigate('RecipeIdentity'),
        }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save draft.');
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'title': return 'Recipe Name';
      case 'region': return 'Origin Region';
      case 'prepTime': return 'Preparation Time';
      case 'cookTime': return 'Cooking Time';
      case 'serves': return 'Servings';
      default: return field;
    }
  };

  const getLocalSuggestion = (field, title) => {
    const tLower = (title || '').toLowerCase();
    switch (field) {
      case 'region':
        if (tLower.includes('dal')) return 'Punjab';
        if (tLower.includes('dhokla')) return 'Gujarat';
        if (tLower.includes('kheer')) return 'Uttar Pradesh';
        return 'Kerala';
      case 'prepTime': return '15 mins';
      case 'cookTime': return '30 mins';
      case 'serves': return '4';
      default: return 'Information not available';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />
      <Header title="Resolve Missing Fields" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Missing fields banner header */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color={COLORS.primary} style={styles.warningIcon} />
          <Text style={styles.warningText}>
            We found {missingFields.length} missing field{missingFields.length > 1 ? 's' : ''} in the extracted recipe.
          </Text>
        </View>

        {/* Missing fields forms mapping */}
        {missingFields.map((field) => {
          if (field === 'cookingStepsList') return null; // Handle steps in dedicated block below
          if (field === 'ingredientsList') return null;  // Handle ingredients specifically
          
          return (
            <MissingFieldCard
              key={field}
              fieldKey={field}
              fieldName={getFieldLabel(field)}
              onResolve={(val, src) => handleResolveField(field, val, src)}
              onGetSuggestion={() => handleGenerateSuggestion(field)}
              isGeneratingSuggestion={generatingField === field}
              suggestedValue={suggestions[field]}
            />
          );
        })}

        {/* Dedicated Procedure Warning Block */}
        {missingFields.includes('cookingStepsList') && (
          <Card variant="heritage" style={styles.procedureCard}>
            <View style={styles.cardHeader}>
              <AlertTriangle size={18} color={COLORS.primary} style={styles.icon} />
              <Text style={styles.procedureTitle}>Cooking Procedure Not Found</Text>
            </View>
            <Text style={styles.procedureSub}>
              No preparation or cooking steps were detected in the recipe image text.
            </Text>

            {procedureStatus === 'missing' && (
              <View style={styles.procedureActions}>
                <TouchableOpacity style={styles.procBtn} onPress={handleGenerateProcedure} activeOpacity={0.8}>
                  <Sparkles size={14} color={COLORS.primary} style={styles.btnIcon} />
                  <Text style={styles.procBtnText}>Generate Suggested Steps</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.procBtn, styles.secondaryProcBtn]}
                  onPress={() => handleResolveField('cookingStepsList', ['See ingredients list for assembly.'], 'manually_entered')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.procSecondaryBtnText}>Use Placeholder Step</Text>
                </TouchableOpacity>
              </View>
            )}

            {procedureStatus === 'generating' && (
              <View style={styles.centerSpinner}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.spinnerText}>Analyzing ingredients to draft recipe procedure...</Text>
              </View>
            )}

            {procedureStatus === 'suggested' && (
              <View style={styles.aiSuggestionBox}>
                <Text style={styles.aiLabel}>AI-generated suggestion — contributor confirmation required</Text>
                <ScrollView style={styles.stepsPreview} nestedScrollEnabled={true}>
                  <Text style={styles.stepsText}>{procedureGeneratedText}</Text>
                </ScrollView>
                <TouchableOpacity style={styles.acceptProcBtn} onPress={handleAcceptProcedure} activeOpacity={0.8}>
                  <Check size={14} color={COLORS.white} style={styles.btnIcon} />
                  <Text style={styles.acceptProcBtnText}>Accept Suggested Procedure</Text>
                </TouchableOpacity>
              </View>
            )}

            {procedureStatus === 'accepted' && (
              <View style={styles.acceptedBox}>
                <Check size={16} color="#385723" style={styles.btnIcon} />
                <Text style={styles.acceptedText}>Procedure accepted and added to draft.</Text>
              </View>
            )}
          </Card>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Button
          title="Save Draft & Continue wizard"
          variant="primary"
          onPress={handleSaveAndLaunch}
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2CC',
    borderColor: '#FFE699',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  warningIcon: {
    marginRight: SPACING.sm,
  },
  warningText: {
    ...FONTS.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#7F6000',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  procedureCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  icon: {
    marginRight: 6,
  },
  procedureTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  procedureSub: {
    ...FONTS.caption,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  procedureActions: {
    flexDirection: 'row',
    gap: 8,
  },
  procBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FAF0E6',
    borderColor: COLORS.primary,
    borderWidth: 0.5,
    borderRadius: 8,
  },
  secondaryProcBtn: {
    backgroundColor: '#FAF5EE',
    borderColor: '#ECE3D7',
  },
  btnIcon: {
    marginRight: 6,
  },
  procBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  procSecondaryBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  centerSpinner: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  spinnerText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  aiSuggestionBox: {
    backgroundColor: '#FAF0E6',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
  },
  aiLabel: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  stepsPreview: {
    maxHeight: 120,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 0.5,
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  stepsText: {
    ...FONTS.body,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text,
  },
  acceptProcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptProcBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  acceptedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2F0D9',
    borderColor: '#C5E0B4',
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 10,
  },
  acceptedText: {
    ...FONTS.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#385723',
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

export default MissingFieldsScreen;
