/**
 * Maps the structured result of an AI image scan to the canonical recipe draft schema
 * consumed by the manual recipe curation wizard.
 *
 * @param {object} structuredResult The verified/corrected result returned by the backend
 * @param {Array<string>} acceptedSuggestionIds IDs of AI suggestions accepted by the user
 * @param {Array<string>} rejectedSuggestionIds IDs of AI suggestions rejected by the user
 * @param {object} currentDraft Existing recipe draft (if editing or recovering)
 * @param {object} scanMetadata Source metadata (original pages, texts, AI disclosure)
 * @returns {object} Canonical recipe draft payload
 */
export function mapScanResultToRecipeDraft(
  structuredResult,
  acceptedSuggestionIds = [],
  rejectedSuggestionIds = [],
  currentDraft = {},
  scanMetadata = {}
) {
  if (!structuredResult) return currentDraft || {};

  const accepted = new Set(acceptedSuggestionIds);

  // Helper to resolve a single field value with suggestions checks
  const resolveField = (fieldObj, fieldName = '') => {
    if (!fieldObj) return '';
    const { value, provenance, suggestionReason } = fieldObj;
    
    if (provenance === 'suggested') {
      // Suggestion requires explicit user approval
      const isAccepted = accepted.has(fieldName) || accepted.has(value);
      return isAccepted ? value : '';
    }
    
    if (provenance === 'missing') {
      return '';
    }
    
    return value || '';
  };

  // Helper to safely merge without overwriting existing non-empty user-entered fields
  const safeMerge = (key, newValue, fallbackValue = '') => {
    const existingVal = currentDraft[key];
    if (existingVal !== undefined && existingVal !== null && String(existingVal).trim() !== '') {
      return existingVal; // Keep user value
    }
    return newValue !== undefined && newValue !== null && String(newValue).trim() !== '' ? newValue : fallbackValue;
  };

  // Map ingredients list
  const ingredientsList = (structuredResult.ingredients || []).map((ing, idx) => {
    const name = resolveField(ing.name, `ingredient_name_${idx}`);
    const quantity = resolveField(ing.quantity, `ingredient_qty_${idx}`);
    const unit = resolveField(ing.unit, `ingredient_unit_${idx}`);
    const preparation = resolveField(ing.preparation, `ingredient_prep_${idx}`);

    // If ingredient is a suggestion and is rejected, skip it
    const suggestionId = `ingredient_${idx}`;
    if (ing.name?.provenance === 'suggested' && !accepted.has(suggestionId)) {
      return null;
    }

    return {
      id: ing.id || `ing-${Date.now()}-${idx}`,
      name: name || '',
      quantity: quantity || '',
      unit: unit || 'Piece',
      notes: preparation || '',
      category: 'Other'
    };
  }).filter(Boolean);

  // Map cooking steps
  const sortedSteps = [...(structuredResult.cookingSteps || [])].sort((a, b) => a.stepNumber - b.stepNumber);
  const cookingStepsList = sortedSteps.map((step, idx) => {
    const text = resolveField(step.stepText, `step_${idx}`);
    
    const suggestionId = `step_${idx}`;
    if (step.stepText?.provenance === 'suggested' && !accepted.has(suggestionId)) {
      return null;
    }
    
    return { detail: text || '' };
  }).filter(Boolean);

  const flatRecipe = {
    // Standard Identifiers
    recipeId: currentDraft.recipeId || currentDraft.id || `recipe-${Date.now()}`,
    draftId: currentDraft.draftId || currentDraft.recipeId || `recipe-${Date.now()}`,
    
    // Canonical text fields with safe merging
    title: safeMerge('title', resolveField(structuredResult.title, 'title')),
    localName: safeMerge('localName', resolveField(structuredResult.localName, 'localName')),
    nativeScript: safeMerge('nativeScript', resolveField(structuredResult.nativeScript, 'nativeScript')),
    altNames: safeMerge('altNames', ''),
    
    // Timings and servings
    serves: safeMerge('serves', resolveField(structuredResult.servings, 'servings'), '4'),
    prepTime: safeMerge('prepTime', resolveField(structuredResult.prepTime, 'prepTime')),
    cookTime: safeMerge('cookTime', resolveField(structuredResult.cookTime, 'cookTime')),
    totalTime: safeMerge('totalTime', `${resolveField(structuredResult.prepTime, 'prepTime')} + ${resolveField(structuredResult.cookTime, 'cookTime')}`.replace(/\s*\+\s*$/, '')),

    // Geography details
    state: safeMerge('state', resolveField(structuredResult.state, 'state')),
    district: safeMerge('district', resolveField(structuredResult.district, 'district')),
    region: safeMerge('region', resolveField(structuredResult.state, 'state')),
    tehsil: safeMerge('tehsil', ''),
    village: safeMerge('village', resolveField(structuredResult.village, 'village')),

    // Heritage and lineage fields
    history: safeMerge('history', resolveField(structuredResult.heritageSource, 'heritageSource') || resolveField(structuredResult.description, 'description')),
    heritageSource: safeMerge('heritageSource', resolveField(structuredResult.heritageSource, 'heritageSource') || resolveField(structuredResult.description, 'description')),
    whoTaughtYou: safeMerge('whoTaughtYou', resolveField(structuredResult.sourcePerson, 'sourcePerson')),
    numGenerations: safeMerge('numGenerations', ''),
    approxAge: safeMerge('approxAge', ''),
    gpsCoords: safeMerge('gpsCoords', ''),
    isBorderRegion: safeMerge('isBorderRegion', false),

    // Traditional Cookware / Vessel
    cookingVessel: safeMerge('cookingVessel', resolveField(structuredResult.traditionalCookware, 'traditionalCookware')),

    // Lists
    ingredientsList: currentDraft.ingredientsList && currentDraft.ingredientsList.length > 0 ? currentDraft.ingredientsList : ingredientsList,
    cookingStepsList: currentDraft.cookingStepsList && currentDraft.cookingStepsList.length > 0 ? currentDraft.cookingStepsList : cookingStepsList,
    instructions: currentDraft.instructions && currentDraft.instructions.length > 0 ? currentDraft.instructions : cookingStepsList,
    traditionalTips: safeMerge('traditionalTips', resolveField(structuredResult.notes, 'notes')),

    // Culture Details
    cultureDetails: {
      festival: safeMerge('festival', resolveField(structuredResult.culturalAssociation, 'culturalAssociation')),
      season: safeMerge('season', ''),
      community: safeMerge('community', resolveField(structuredResult.communityInfo, 'communityInfo')),
      tribe: safeMerge('tribe', ''),
      cookingVessel: safeMerge('cookingVessel', resolveField(structuredResult.traditionalCookware, 'traditionalCookware')),
      cookingMedium: safeMerge('cookingMedium', ''),
      ...(currentDraft.cultureDetails || {})
    },

    status: 'draft',
  };

  // Enriched draft properties for preservation
  return {
    ...flatRecipe,
    
    // Scan details preserved separately
    scan: {
      pages: scanMetadata.pages || currentDraft.scan?.pages || [],
      extractionStatus: scanMetadata.extractionStatus || currentDraft.scan?.extractionStatus || 'completed',
      originalText: scanMetadata.originalText || currentDraft.scan?.originalText || '',
      correctedText: scanMetadata.correctedText || currentDraft.scan?.correctedText || '',
      detectedLanguages: scanMetadata.detectedLanguages || currentDraft.scan?.detectedLanguages || [],
      structuredResult: structuredResult,
      acceptedSuggestionIds,
      rejectedSuggestionIds,
      lastSavedAt: Date.now()
    },
    
    id: flatRecipe.recipeId,
    confidence: structuredResult.isOfflineParsed ? 0.7 : 0.95,
    importedAt: currentDraft.importedAt || new Date().toISOString(),
    aiDisclosure: true,
    originalScanSourceMetadata: scanMetadata.pages || currentDraft.scan?.pages || [],
    originalOCRText: scanMetadata.originalText || currentDraft.scan?.originalText || '',
    correctedOCRText: scanMetadata.correctedText || currentDraft.scan?.correctedText || '',
    acceptedAISuggestions: acceptedSuggestionIds
  };
}

export default mapScanResultToRecipeDraft;
