import recipeApiService from './recipeApiService';

export const recipeDraftService = {
  // Retrieve list of all saved drafts
  async getAllDrafts() {
    return recipeApiService.getRecipeDrafts();
  },

  // Save/Update a single draft record
  async saveDraft(draftData, stepName = 'RecipeIdentity') {
    const meta = {
      AddRecipeIntro: 0,
      RecipeIdentity: 12.5,
      RecipeLocation: 25,
      RecipeHeritageSource: 37.5,
      RecipeIngredients: 50,
      RecipeCookingMethod: 62.5,
      RecipeCulture: 75,
      RecipeMediaUpload: 87.5,
      RecipePreview: 100,
    };
    
    const percentage = meta[stepName] || 12.5;
    
    const enriched = {
      ...draftData,
      currentStep: stepName,
      completionPercentage: percentage,
      status: 'draft',
    };

    const draftId = draftData.draftId || draftData.recipeId;
    if (draftId) {
      return recipeApiService.updateRecipeDraft(draftId, enriched);
    } else {
      return recipeApiService.createRecipeDraft(enriched);
    }
  },

  // Delete a draft by ID
  async deleteDraft(draftId) {
    await recipeApiService.deleteRecipeDraft(draftId);
    return recipeApiService.getRecipeDrafts();
  },

  // Retrieve a single draft by ID
  async getDraftById(draftId) {
    const drafts = await recipeApiService.getRecipeDrafts();
    return drafts.find(d => d.draftId === draftId || d.recipeId === draftId) || null;
  }
};

export default recipeDraftService;
