import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import {
  Check,
  Edit,
  MapPin,
  Clock,
  Users,
  BookOpen,
  Sparkles,
  Info,
  AlertTriangle,
  FolderOpen,
  FileText,
  X
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS, BORDERS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import recipeParsingService from '../services/recipeParsingService';
import recipeImportService from '../services/recipeImportService';
import mapScanResultToRecipeDraft from '../utils/mapScanResultToRecipeDraft';
import { useAuth } from '../../../shared/services/AuthContext';
import { API_BASE_URL } from '../../../core/config/apiConfig';
import { apiClient } from '../../../shared/services/apiClient';

export const StructuredRecipeReviewScreen = ({ route, navigation }) => {
  const { saveRecipeDraft, recipeDraft } = useAuth();
  const { sessionId, rawText, sourceImages, ocrConfidence } = route.params || { sessionId: null, rawText: '', sourceImages: [], ocrConfidence: 0.95 };

  const [isLoading, setIsLoading] = useState(true);
  const [parsedData, setParsedData] = useState(null);
  const [activeSegment, setActiveSegment] = useState('structured'); // 'source' or 'structured'
  const [sessionSuggestions, setSessionSuggestions] = useState([]);

  // Edit / Confirmation state variables
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  
  // Suggestion tracking
  const [acceptedSuggestionIds, setAcceptedSuggestionIds] = useState([]);
  const [rejectedSuggestionIds, setRejectedSuggestionIds] = useState([]);

  const runParsing = useCallback(async () => {
    if (!sessionId) {
      // Fallback if no session
      setIsLoading(true);
      try {
        const result = await recipeParsingService.parseRecipeText(rawText);
        setParsedData(result);
      } catch (e) {
        Alert.alert('Parser Error', 'Failed to structure recipe data automatically.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipe-imports/${sessionId}/structure`, {
        method: 'POST'
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.message || 'Structuring failed.');
      }

      setParsedData(resJson.data.structuredExtraction);
      setSessionSuggestions(resJson.data.aiSuggestions || []);
    } catch (e) {
      console.error('Structuring error:', e);
      Alert.alert('Structuring Failed', 'Could not run culinary structuring on server. Falling back to local offline parser.');
      // Local fallback
      const localResult = await recipeParsingService.parseRecipeText(rawText);
      setParsedData(localResult);
    } finally {
      setIsLoading(false);
    }
  }, [rawText, sessionId]);

  useEffect(() => {
    runParsing();
  }, [runParsing]);

  const handleEditField = (field, currentVal) => {
    setEditingField(field);
    setTempValue(currentVal || '');
  };

  const handleSaveEdit = (field) => {
    if (!parsedData) return;
    
    // We update the structured property value and set its provenance to 'extracted' (since user validated it)
    const updatedProp = {
      ...(parsedData[field] || {}),
      value: tempValue,
      provenance: 'extracted' // user overrides to extracted
    };

    setParsedData({
      ...parsedData,
      [field]: updatedProp
    });

    setEditingField(null);
  };

  // Suggestion actions
  const handleAcceptSuggestion = async (field, value, sugId) => {
    if (!parsedData) return;

    if (sessionId && sugId) {
      try {
        const res = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipe-imports/${sessionId}/suggestions/${sugId}`, {
          method: 'PATCH',
          body: JSON.stringify({ decision: 'accepted' })
        });
        if (!res.ok) throw new Error('Failed to update suggestion on server.');
      } catch (err) {
        console.error(err);
        Alert.alert('Sync Error', 'Failed to save choice to server.');
        return;
      }
    }

    setAcceptedSuggestionIds([...acceptedSuggestionIds, sugId || field]);
    
    const updatedProp = {
      ...(parsedData[field] || {}),
      value: value,
      provenance: 'extracted'
    };

    setParsedData({
      ...parsedData,
      [field]: updatedProp
    });

    Alert.alert('Suggestion Accepted', `Approved value for "${field}"`);
  };

  const handleRejectSuggestion = async (field, sugId) => {
    if (sessionId && sugId) {
      try {
        const res = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipe-imports/${sessionId}/suggestions/${sugId}`, {
          method: 'PATCH',
          body: JSON.stringify({ decision: 'rejected' })
        });
        if (!res.ok) throw new Error('Failed to update suggestion on server.');
      } catch (err) {
        console.error(err);
        Alert.alert('Sync Error', 'Failed to save choice to server.');
        return;
      }
    }

    setRejectedSuggestionIds([...rejectedSuggestionIds, sugId || field]);
    
    if (parsedData && parsedData[field]) {
      const updatedProp = {
        ...parsedData[field],
        provenance: 'missing',
        value: ''
      };
      setParsedData({
        ...parsedData,
        [field]: updatedProp
      });
    }

    Alert.alert('Suggestion Rejected', `Removed suggestion for "${field}"`);
  };

  const handleNextStep = async () => {
    if (!parsedData) return;

    setIsLoading(true);
    let finalDraft = null;

    try {
      if (sessionId) {
        // Save to Draft in Mongoose DB via server endpoint
        const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipe-imports/${sessionId}/save-to-draft`, {
          method: 'POST'
        });

        const resJson = await response.json();
        if (!response.ok || !resJson.success) {
          throw new Error(resJson.message || 'Draft creation failed.');
        }

        // Map server response to standard UI draft
        const draftData = resJson.data;
        finalDraft = {
          recipeId: draftData.draftId,
          draftId: draftData.draftId,
          title: draftData.title || '',
          localName: draftData.localName || '',
          nativeScript: draftData.nativeScript || '',
          altNames: draftData.altNames || '',
          history: draftData.history || '',
          region: draftData.region || '',
          state: draftData.state || '',
          district: draftData.district || '',
          tehsil: draftData.tehsil || '',
          village: draftData.village || '',
          serves: String(draftData.serves || '4'),
          prepTime: draftData.prepTime || '',
          cookTime: draftData.cookTime || '',
          totalTime: draftData.totalTime || '',
          ingredientsList: draftData.ingredientsList || [],
          cookingStepsList: (draftData.cookingStepsList || []).map(s => typeof s === 'string' ? { detail: s } : { detail: s.detail || s.stepText || '' }),
          traditionalTips: draftData.traditionalTips || '',
          cultureDetails: draftData.cultureDetails || {},
          status: 'draft',
          scan: {
            pages: recipeDraft?.scan?.pages || [],
            sessionId: sessionId,
            extractionStatus: 'completed',
            originalText: recipeDraft?.scan?.originalText || rawText,
            correctedText: rawText,
            detectedLanguages: parsedData.detectedLanguage ? [parsedData.detectedLanguage] : ['en']
          }
        };
      } else {
        // Standard adapter map function fallback
        finalDraft = mapScanResultToRecipeDraft(
          parsedData,
          acceptedSuggestionIds,
          rejectedSuggestionIds,
          recipeDraft || {},
          {
            pages: recipeDraft?.scan?.pages || [],
            extractionStatus: 'completed',
            originalText: recipeDraft?.scan?.originalText || rawText,
            correctedText: rawText,
            detectedLanguages: parsedData.detectedLanguage ? [parsedData.detectedLanguage] : ['en']
          }
        );
      }

      // Filter missing fields list to see if any required fields are empty
      const missing = recipeImportService.detectMissingFields(finalDraft);
      finalDraft.missingFields = missing;

      // Save draft locally
      await saveRecipeDraft(finalDraft, 'RecipeIdentity');

      setIsLoading(false);
      if (missing.length > 0) {
        navigation.navigate('MissingFields', { draftPayload: finalDraft });
      } else {
        Alert.alert(
          'Draft Created',
          'Recipe details successfully structured and saved to your drafts list.',
          [
            {
              text: 'Open Wizard',
              onPress: () => navigation.navigate('RecipeIdentity')
            }
          ]
        );
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      Alert.alert('Draft Creation Failed', err.message || 'Could not save recipe draft.');
    }
  };

  // Render accessibility badges
  const renderProvenanceBadge = (fieldObj) => {
    if (!fieldObj) return null;
    const prov = fieldObj.provenance || 'extracted';
    
    if (prov === 'extracted') {
      return (
        <View style={[styles.badge, styles.badgeExtracted]}>
          <Check size={10} color="#2E6930" />
          <Text style={[styles.badgeText, styles.textExtracted]}>Extracted Fact</Text>
        </View>
      );
    }
    if (prov === 'normalized') {
      return (
        <View style={[styles.badge, styles.badgeNormalized]}>
          <Info size={10} color="#1F4E79" />
          <Text style={[styles.badgeText, styles.textNormalized]}>Normalized</Text>
        </View>
      );
    }
    if (prov === 'suggested') {
      return (
        <View style={[styles.badge, styles.badgeSuggested]}>
          <Sparkles size={10} color="#C55A11" />
          <Text style={[styles.badgeText, styles.textSuggested]}>AI Suggestion</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, styles.badgeMissing]}>
        <AlertTriangle size={10} color="#C00000" />
        <Text style={[styles.badgeText, styles.textMissing]}>Missing Field</Text>
      </View>
    );
  };

  // Render a field editor block
  const renderFieldCard = (fieldKey, label, icon) => {
    if (!parsedData || !parsedData[fieldKey]) return null;
    const fieldObj = parsedData[fieldKey];
    const isEditing = editingField === fieldKey;

    const isSuggested = fieldObj.provenance === 'suggested';
    const isMissing = fieldObj.provenance === 'missing' || !fieldObj.value;

    return (
      <Card
        key={fieldKey}
        variant="default"
        style={[
          styles.fieldCard,
          isSuggested && styles.fieldCardSuggested,
          isMissing && styles.fieldCardMissing
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {icon}
            <Text style={styles.fieldLabel}>{label}</Text>
            {renderProvenanceBadge(fieldObj)}
          </View>
          <TouchableOpacity onPress={() => handleEditField(fieldKey, fieldObj.value)} style={styles.editBtn}>
            <Edit size={14} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput style={styles.input} value={tempValue} onChangeText={setTempValue} />
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveEdit(fieldKey)}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.fieldValueContainer}>
            <Text style={[styles.fieldValue, isMissing && styles.fieldValueMissing]}>
              {fieldObj.value || '(Not specified)'}
            </Text>
            
            {/* Show AI Suggestion trigger triggers */}
            {isSuggested && (
              <View style={styles.suggestionControls}>
                <Text style={styles.suggestionReasonText}>Reason: {fieldObj.suggestionReason || 'Probable value'}</Text>
                <View style={styles.suggestionBtnRow}>
                  <TouchableOpacity
                    style={styles.sugAcceptBtn}
                    onPress={() => handleAcceptSuggestion(fieldKey, fieldObj.value, fieldKey)}
                  >
                    <Check size={12} color={COLORS.white} />
                    <Text style={styles.sugBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sugRejectBtn}
                    onPress={() => handleRejectSuggestion(fieldKey, fieldKey)}
                  >
                    <X size={12} color={COLORS.white} />
                    <Text style={styles.sugBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </Card>
    );
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

      {/* Main segmented control tab switcher */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'structured' && styles.segmentActiveBtn]}
          onPress={() => setActiveSegment('structured')}
        >
          <FolderOpen size={14} color={activeSegment === 'structured' ? COLORS.primary : COLORS.secondary} />
          <Text style={[styles.segmentText, activeSegment === 'structured' && styles.segmentActiveText]}>Structured Recipe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'source' && styles.segmentActiveBtn]}
          onPress={() => setActiveSegment('source')}
        >
          <FileText size={14} color={activeSegment === 'source' ? COLORS.primary : COLORS.secondary} />
          <Text style={[styles.segmentText, activeSegment === 'source' && styles.segmentActiveText]}>Original Source</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {activeSegment === 'source' ? (
          <View style={styles.sourceSection}>
            <Text style={styles.sectionHeaderTitle}>Recipe Page Images</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.imagesSlider}>
              {sourceImages.map((uri, sIdx) => (
                <View key={sIdx} style={styles.sourceImageFrame}>
                  <Image source={{ uri }} style={styles.sourceImg} resizeMode="cover" />
                  <Text style={styles.imgPageTag}>Page {sIdx + 1}</Text>
                </View>
              ))}
            </ScrollView>

            <Card variant="default" style={styles.textOutputCard}>
              <Text style={styles.textOutputLabel}>Original Transcribed Text</Text>
              <ScrollView style={styles.rawTextContainer} nestedScrollEnabled={true}>
                <Text style={styles.rawText}>{recipeDraft?.scan?.originalText || rawText}</Text>
              </ScrollView>
            </Card>

            <Card variant="default" style={styles.textOutputCard}>
              <Text style={styles.textOutputLabel}>Corrected Text</Text>
              <ScrollView style={styles.rawTextContainer} nestedScrollEnabled={true}>
                <Text style={styles.rawText}>{rawText}</Text>
              </ScrollView>
            </Card>
          </View>
        ) : (
          <View style={styles.structuredSection}>
            {/* Identity Fields */}
            <Text style={styles.blockTitle}>Identity</Text>
            {renderFieldCard('title', 'English Title', <BookOpen size={14} color={COLORS.secondary} />)}
            {renderFieldCard('localName', 'Local / Native Name', <BookOpen size={14} color={COLORS.secondary} />)}
            {renderFieldCard('nativeScript', 'Native Script (e.g. Devanagari)', <BookOpen size={14} color={COLORS.secondary} />)}
            
            {/* Timings and Servings */}
            <Text style={styles.blockTitle}>Timings and Servings</Text>
            <Card variant="default" style={styles.metaGridCard}>
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Users size={14} color={COLORS.secondary} />
                  <Text style={styles.metaColLabel}>Servings</Text>
                  <Text style={styles.metaColVal}>{parsedData.servings?.value || '4'}</Text>
                  <TouchableOpacity style={styles.metaColEdit} onPress={() => handleEditField('servings', parsedData.servings?.value)}>
                    <Edit size={10} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.metaCol}>
                  <Clock size={14} color={COLORS.secondary} />
                  <Text style={styles.metaColLabel}>Prep Time</Text>
                  <Text style={styles.metaColVal}>{parsedData.prepTime?.value || 'N/A'}</Text>
                  <TouchableOpacity style={styles.metaColEdit} onPress={() => handleEditField('prepTime', parsedData.prepTime?.value)}>
                    <Edit size={10} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.metaCol}>
                  <Clock size={14} color={COLORS.secondary} />
                  <Text style={styles.metaColLabel}>Cook Time</Text>
                  <Text style={styles.metaColVal}>{parsedData.cookTime?.value || 'N/A'}</Text>
                  <TouchableOpacity style={styles.metaColEdit} onPress={() => handleEditField('cookTime', parsedData.cookTime?.value)}>
                    <Edit size={10} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
              {editingField && ['servings', 'prepTime', 'cookTime'].includes(editingField) && (
                <View style={styles.metaEditRow}>
                  <TextInput style={styles.input} value={tempValue} onChangeText={setTempValue} />
                  <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveEdit(editingField)}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>

            {/* Ingredients */}
            <Text style={styles.blockTitle}>Ingredients ({parsedData.ingredients?.length || 0})</Text>
            <Card variant="default" style={styles.listCard}>
              <View style={styles.listContainer}>
                {parsedData.ingredients?.map((ing, idx) => {
                  const name = ing.name?.value || '';
                  const qty = ing.quantity?.value || '';
                  const unit = ing.unit?.value || '';
                  const prep = ing.preparation?.value || '';
                  const isSug = ing.name?.provenance === 'suggested';
                  
                  return (
                    <View key={idx} style={[styles.listItem, isSug && styles.listItemSuggested]}>
                      <Text style={styles.itemBullet}>•</Text>
                      <View style={styles.listItemContent}>
                        <Text style={styles.itemText}>
                          <Text style={styles.itemStrong}>{name}</Text>: {qty} {unit} {prep ? `(${prep})` : ''}
                        </Text>
                        {isSug && (
                          <View style={styles.sugMiniTag}>
                            <Sparkles size={8} color="#C55A11" />
                            <Text style={styles.sugMiniTagText}>AI Suggested Ingredient</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Geography & Location */}
            <Text style={styles.blockTitle}>Geography</Text>
            {renderFieldCard('state', 'State of Origin', <MapPin size={14} color={COLORS.secondary} />)}
            {renderFieldCard('district', 'District', <MapPin size={14} color={COLORS.secondary} />)}
            {renderFieldCard('village', 'Village', <MapPin size={14} color={COLORS.secondary} />)}

            {/* Heritage Source */}
            <Text style={styles.blockTitle}>Heritage Source</Text>
            {renderFieldCard('heritageSource', 'Lineage / Lore', <Info size={14} color={COLORS.secondary} />)}
            {renderFieldCard('sourcePerson', 'Source Contributor Name', <Info size={14} color={COLORS.secondary} />)}

            {/* Culture Details */}
            <Text style={styles.blockTitle}>Culture & Cookware</Text>
            {renderFieldCard('traditionalCookware', 'Traditional Cookware', <Info size={14} color={COLORS.secondary} />)}
            {renderFieldCard('culturalAssociation', 'Festive / Ritual ties', <Info size={14} color={COLORS.secondary} />)}
          </View>
        )}

      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Button
          title="Verify & Map to Wizard"
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 8,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: 2,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  segmentActiveBtn: {
    backgroundColor: COLORS.white,
    ...SHADOWS.soft,
  },
  segmentText: {
    ...FONTS.caption,
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  segmentActiveText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  sourceSection: {
    gap: SPACING.md,
  },
  sectionHeaderTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  imagesSlider: {
    flexDirection: 'row',
  },
  sourceImageFrame: {
    width: 140,
    height: 180,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#ECE3D7',
  },
  sourceImg: {
    width: '100%',
    height: '100%',
  },
  imgPageTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: COLORS.white,
    ...FONTS.caption,
    fontSize: 10,
    textAlign: 'center',
    paddingVertical: 2,
  },
  textOutputCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
  },
  textOutputLabel: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 6,
  },
  rawTextContainer: {
    maxHeight: 180,
    backgroundColor: '#FAF8F4',
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    borderRadius: 6,
    padding: 8,
  },
  rawText: {
    ...FONTS.body,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text,
  },
  structuredSection: {},
  blockTitle: {
    ...FONTS.bodyBold,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ECE3D7',
    paddingBottom: 2,
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
  fieldCardSuggested: {
    borderColor: '#FFE699',
    backgroundColor: '#FFFDF6',
  },
  fieldCardMissing: {
    borderColor: '#F8CBAD',
    backgroundColor: '#FFF9F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  fieldLabel: {
    ...FONTS.bodyBold,
    fontSize: 12.5,
    color: COLORS.secondary,
  },
  editBtn: {
    padding: 4,
  },
  fieldValueContainer: {
    paddingTop: 4,
  },
  fieldValue: {
    ...FONTS.body,
    fontSize: 13.5,
    color: COLORS.text,
  },
  fieldValueMissing: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeExtracted: {
    backgroundColor: '#E2F0D9',
  },
  badgeNormalized: {
    backgroundColor: '#D9E1F2',
  },
  badgeSuggested: {
    backgroundColor: '#FFF2CC',
  },
  badgeMissing: {
    backgroundColor: '#FCE4D6',
  },
  badgeText: {
    ...FONTS.caption,
    fontSize: 9,
    fontWeight: '700',
  },
  textExtracted: {
    color: '#385723',
  },
  textNormalized: {
    color: '#1F4E79',
  },
  textSuggested: {
    color: '#C55A11',
  },
  textMissing: {
    color: '#C00000',
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
  suggestionControls: {
    marginTop: 8,
    backgroundColor: '#FAF2EA',
    borderWidth: 0.5,
    borderColor: '#E8D2BF',
    borderRadius: 6,
    padding: 6,
  },
  suggestionReasonText: {
    ...FONTS.caption,
    fontSize: 10,
    color: '#7F6000',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  suggestionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sugAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#385723',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 3,
  },
  sugRejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C00000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 3,
  },
  sugBtnText: {
    ...FONTS.caption,
    fontSize: 9.5,
    color: COLORS.white,
    fontWeight: '700',
  },
  metaGridCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaCol: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    borderRadius: 8,
    padding: 8,
    position: 'relative',
  },
  metaColLabel: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  metaColVal: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  metaColEdit: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  metaEditRow: {
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
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 4,
  },
  listItemSuggested: {
    backgroundColor: '#FFFDF6',
    borderLeftWidth: 2,
    borderLeftColor: '#FFE699',
    paddingLeft: 6,
  },
  itemBullet: {
    marginRight: 6,
    color: COLORS.secondary,
  },
  listItemContent: {
    flex: 1,
  },
  itemText: {
    ...FONTS.body,
    fontSize: 12.5,
    color: COLORS.text,
  },
  itemStrong: {
    fontWeight: '700',
    color: COLORS.secondary,
  },
  sugMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  sugMiniTagText: {
    ...FONTS.caption,
    fontSize: 8.5,
    color: '#C55A11',
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

export default StructuredRecipeReviewScreen;
