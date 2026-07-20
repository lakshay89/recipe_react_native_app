import { recipeDraftService } from './recipeDraftService';

export const recipeImportService = {
  /**
   * Initializes a new empty import session draft
   */
  createImportSession() {
    const importId = `import-${Date.now()}`;
    return {
      importId,
      sourceImages: [],
      rawExtractedText: '',
      structuredFields: {},
      confidence: 1.0,
      missingFields: [],
      generatedFields: [],
      userCorrections: {},
      importedAt: new Date().toISOString(),
      status: 'draft',
      currentStep: 'RecipeIdentity',
    };
  },

  /**
   * Maps parsed recipe keys to flat draft attributes + sets source tracking fields
   * @param {object} parsedData Extracted JSON data
   * @param {string} rawText Reviewed raw text
   * @param {Array<string>} sourceImages Array of local image URIs
   * @returns {object} Standardized draft payload
   */
  buildImportDraft(parsedData, rawText, sourceImages, corrections = {}) {
    const now = new Date().toISOString();
    const recipeId = `recipe-${Date.now()}`;
    
    // 1. Build standard fields for immediate wizard prefilling compatibility
    const flatRecipe = {
      recipeId,
      draftId: recipeId,
      title: parsedData.title || '',
      localName: parsedData.localName || '',
      nativeScript: parsedData.nativeScript || '',
      altNames: parsedData.altNames || '',
      history: parsedData.history || parsedData.heritageSource || '',
      region: parsedData.region || '',
      state: parsedData.state || parsedData.region || '',
      district: parsedData.district || '',
      tehsil: parsedData.tehsil || '',
      village: parsedData.village || '',
      serves: parsedData.serves || '4',
      prepTime: parsedData.prepTime || '',
      cookTime: parsedData.cookTime || '',
      totalTime: parsedData.totalTime || '',
      ingredientsList: parsedData.ingredientsList || [],
      cookingStepsList: parsedData.cookingStepsList || [],
      instructions: parsedData.cookingStepsList || [],
      traditionalTips: parsedData.traditionalTips || '',
      cultureDetails: {
        festival: parsedData.festival || '',
        season: parsedData.season || '',
        community: parsedData.community || '',
        tribe: parsedData.tribe || '',
        cookingVessel: parsedData.cookingVessel || '',
        cookingMedium: parsedData.cookingMedium || '',
      },
      status: 'draft',
    };

    // 2. Build detailed field source tracking descriptors
    const sourceTracking = {};
    const defaultSource = parsedData.isOfflineParsed ? 'manually_entered' : 'ocr_extracted';
    
    const stringKeys = ['title', 'localName', 'region', 'state', 'prepTime', 'cookTime', 'serves'];
    stringKeys.forEach(key => {
      const val = flatRecipe[key];
      const isCorrected = corrections[key] !== undefined;
      sourceTracking[key] = {
        value: isCorrected ? corrections[key] : val,
        source: isCorrected ? 'user_corrected' : defaultSource,
        requiresConfirmation: !isCorrected, // requires confirmation if not verified/corrected
      };
    });

    // Handle instructions/cookingSteps specifically
    const isProcedureGenerated = parsedData.isProcedureGenerated || false;
    sourceTracking['cookingStepsList'] = {
      value: flatRecipe.cookingStepsList,
      source: isProcedureGenerated ? 'ai_suggested' : defaultSource,
      requiresConfirmation: isProcedureGenerated,
    };

    // 3. Build enriched draft output
    return {
      ...flatRecipe,
      importId: `import-${Date.now()}`,
      sourceImages,
      rawExtractedText: rawText,
      confidence: parsedData.isOfflineParsed ? 0.7 : 0.95,
      missingFields: this.detectMissingFields(flatRecipe),
      generatedFields: isProcedureGenerated ? ['cookingStepsList'] : [],
      userCorrections: corrections,
      importedAt: now,
      sourceTracking,
      currentStep: 'RecipeIdentity',
    };
  },

  /**
   * Identifies missing or empty fields requiring review
   */
  detectMissingFields(recipe) {
    const missing = [];
    if (!recipe.title) missing.push('title');
    if (!recipe.region && !recipe.state) missing.push('region');
    if (!recipe.ingredientsList || recipe.ingredientsList.length === 0) missing.push('ingredientsList');
    if (!recipe.cookingStepsList || recipe.cookingStepsList.length === 0) missing.push('cookingStepsList');
    if (!recipe.prepTime) missing.push('prepTime');
    if (!recipe.cookTime) missing.push('cookTime');
    if (!recipe.serves) missing.push('serves');
    return missing;
  },

  /**
   * Persists draft to standard draft storage
   */
  async saveToDrafts(draftPayload) {
    return recipeDraftService.saveDraft(draftPayload, 'RecipeIdentity');
  }
};

export default recipeImportService;
