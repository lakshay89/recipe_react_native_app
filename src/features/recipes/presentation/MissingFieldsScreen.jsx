import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { AlertTriangle, Sparkles, BookOpen, Check, HelpCircle, ArrowRight, CornerDownRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import recipeImportService from '../services/recipeImportService';
import { useAuth } from '../../../shared/services/AuthContext';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export const MissingFieldsScreen = ({ route, navigation }) => {
  const { saveRecipeDraft } = useAuth();
  const { draftPayload } = route.params || { draftPayload: {} };
  
  const [draft, setDraft] = useState(draftPayload);
  const [userAnswers, setUserAnswers] = useState({}); // { [field]: text }
  const [aiSuggestions, setAiSuggestions] = useState({}); // { [field]: text }
  const [loadingSuggestions, setLoadingSuggestions] = useState({}); // { [field]: boolean }

  const missingFields = draft.missingFields || [];

  // Generate a clarification question per missing field
  const getClarificationQuestion = (field) => {
    switch (field) {
      case 'title':
        return 'What is the name of this heritage recipe?';
      case 'region':
      case 'state':
        return 'Where did this recipe originate? (State or Region)';
      case 'prepTime':
        return 'The preparation time is missing. Would you like to estimate it?';
      case 'cookTime':
        return 'The cooking time is missing. Would you like to estimate it?';
      case 'serves':
        return 'How many people does this recipe serve?';
      case 'ingredientsList':
        return 'The ingredients list was not detected. Would you like to add it?';
      case 'cookingStepsList':
        return 'No preparation or cooking steps were found. Would you like to estimate them?';
      default:
        return `The field "${field}" is incomplete. Would you like to add details?`;
    }
  };

  const handleTextAnswer = (field, text) => {
    setUserAnswers({
      ...userAnswers,
      [field]: text
    });
  };

  const handleSaveAnswer = async (field, value, source = 'manually_entered') => {
    if (!value || !value.trim()) {
      Alert.alert('Empty answer', 'Please enter a value before saving.');
      return;
    }

    const updatedDraft = {
      ...draft,
      [field]: value,
      sourceTracking: {
        ...(draft.sourceTracking || {}),
        [field]: {
          value,
          source,
          requiresConfirmation: false
        }
      }
    };

    // Re-evaluate missing fields
    updatedDraft.missingFields = recipeImportService.detectMissingFields(updatedDraft);
    setDraft(updatedDraft);
    
    // Automatically save draft to AsyncStorage
    await saveRecipeDraft(updatedDraft, 'RecipeIdentity');
    Alert.alert('Field Saved', `Updated "${field}" successfully.`);
  };

  const handleMarkUnknown = async (field) => {
    await handleSaveAnswer(field, 'Unknown', 'user_corrected');
  };

  const handleGenerateSuggestion = async (field) => {
    setLoadingSuggestions({
      ...loadingSuggestions,
      [field]: true
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/recipes/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Recipe title is "${draft.title || 'Untitled'}". State is "${draft.state || 'Unknown'}". Suggest a reasonable standard estimate for "${field}".`
        }),
      });

      const resJson = await response.json();
      
      let suggestionText = '';
      if (response.ok && resJson.success && resJson.data) {
        suggestionText = resJson.data[field] || '';
      }

      if (!suggestionText) {
        suggestionText = getLocalSuggestion(field);
      }

      setAiSuggestions({
        ...aiSuggestions,
        [field]: suggestionText
      });
    } catch (e) {
      setAiSuggestions({
        ...aiSuggestions,
        [field]: getLocalSuggestion(field)
      });
    } finally {
      setLoadingSuggestions({
        ...loadingSuggestions,
        [field]: false
      });
    }
  };

  const getLocalSuggestion = (field) => {
    switch (field) {
      case 'serves': return '4';
      case 'prepTime': return '15 mins';
      case 'cookTime': return '30 mins';
      case 'state': return 'Punjab';
      default: return 'Refer to cooking notes';
    }
  };

  const handleSaveAndContinue = async () => {
    // Map any current unsaved input box values before continuing
    let finalDraft = { ...draft };
    let hasUpdated = false;

    Object.keys(userAnswers).forEach((field) => {
      const val = userAnswers[field];
      if (val && val.trim() && !finalDraft[field]) {
        hasUpdated = true;
        finalDraft[field] = val;
        finalDraft.sourceTracking = {
          ...(finalDraft.sourceTracking || {}),
          [field]: { value: val, source: 'manually_entered', requiresConfirmation: false }
        };
      }
    });

    if (hasUpdated) {
      finalDraft.missingFields = recipeImportService.detectMissingFields(finalDraft);
      setDraft(finalDraft);
    }

    await saveRecipeDraft(finalDraft, 'RecipeIdentity');

    Alert.alert(
      'Draft Ready',
      'Missing fields resolved. Continuing to final curation wizard...',
      [
        {
          text: 'Open Wizard',
          onPress: () => navigation.navigate('RecipeIdentity'),
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />
      <Header title="Resolve Incomplete Fields" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Warning Plaque Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color="#7F6000" style={styles.warningIcon} />
          <Text style={styles.warningText}>
            We found {missingFields.length} incomplete parameter{missingFields.length > 1 ? 's' : ''} in the AI recipe scan.
          </Text>
        </View>

        {/* Missing fields mapped to interactive cards */}
        {missingFields.map((field) => {
          const question = getClarificationQuestion(field);
          const answer = userAnswers[field] || '';
          const sug = aiSuggestions[field] || '';
          const isLoadingSug = loadingSuggestions[field] || false;

          return (
            <Card key={field} variant="default" style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <HelpCircle size={16} color={COLORS.secondary} />
                <Text style={styles.questionLabel}>{getFieldLabel(field)}</Text>
              </View>
              
              <Text style={styles.questionText}>{question}</Text>

              {/* Text Input Row */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={answer}
                  onChangeText={(txt) => handleTextAnswer(field, txt)}
                  placeholder="Type your answer here..."
                  placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => handleSaveAnswer(field, answer)}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>

              {/* AI suggestion blocks */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.aiBtn}
                  onPress={() => handleGenerateSuggestion(field)}
                  disabled={isLoadingSug}
                >
                  <Sparkles size={11} color={COLORS.primary} />
                  <Text style={styles.aiBtnText}>
                    {isLoadingSug ? 'Querying AI...' : 'Suggest with AI'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={() => handleMarkUnknown(field)}
                >
                  <Text style={styles.skipBtnText}>Mark as Unknown</Text>
                </TouchableOpacity>
              </View>

              {/* Show fetched AI suggestion */}
              {sug !== '' && (
                <View style={styles.suggestionBox}>
                  <View style={styles.suggestionHeader}>
                    <Sparkles size={12} color="#7F6000" />
                    <Text style={styles.suggestionTitle}>AI Suggestion:</Text>
                  </View>
                  <Text style={styles.suggestionTextValue}>{sug}</Text>
                  <TouchableOpacity
                    style={styles.suggestionAcceptBtn}
                    onPress={() => handleSaveAnswer(field, sug, 'ai_suggested')}
                  >
                    <Check size={11} color={COLORS.white} />
                    <Text style={styles.suggestionAcceptText}>Accept Suggestion</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        })}

      </ScrollView>

      {/* Footer Forward Action */}
      <View style={styles.footer}>
        <Button
          title="Save Draft & Continue"
          variant="primary"
          onPress={handleSaveAndContinue}
          style={styles.nextBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const getFieldLabel = (field) => {
  switch (field) {
    case 'title': return 'Recipe Name';
    case 'state':
    case 'region': return 'Origin Region';
    case 'prepTime': return 'Preparation Time';
    case 'cookTime': return 'Cooking Time';
    case 'serves': return 'Servings';
    case 'ingredientsList': return 'Ingredients';
    case 'cookingStepsList': return 'Cooking Steps';
    default: return field;
  }
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
  questionCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  questionLabel: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  questionText: {
    ...FONTS.bodyBold,
    fontSize: 13.5,
    color: COLORS.secondary,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 12.5,
    color: COLORS.text,
    backgroundColor: '#FAF8F4',
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  saveBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  aiBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  skipBtn: {
    paddingVertical: 4,
  },
  skipBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
  suggestionBox: {
    marginTop: 8,
    backgroundColor: '#FFFDF6',
    borderWidth: 0.5,
    borderColor: '#FFE699',
    borderRadius: 6,
    padding: 8,
    gap: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionTitle: {
    ...FONTS.caption,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7F6000',
  },
  suggestionTextValue: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.text,
  },
  suggestionAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#385723',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 3,
    marginTop: 4,
  },
  suggestionAcceptText: {
    ...FONTS.caption,
    fontSize: 9.5,
    color: COLORS.white,
    fontWeight: '700',
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
