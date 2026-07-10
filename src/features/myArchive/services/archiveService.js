import recipeApiService from '../../recipes/services/recipeApiService';

export const archiveService = {
  // Retrieve pending review submissions
  async getPendingRecipes() {
    return recipeApiService.getPendingRecipes();
  },

  // Retrieve published curation recipes
  async getPublishedRecipes() {
    return recipeApiService.getPublishedRecipes();
  },

  // Retrieve rejected curation recipes
  async getRejectedRecipes() {
    return recipeApiService.getRejectedRecipes();
  },

  // Fetch single recipe curation details
  async getRecipeById(recipeId) {
    return recipeApiService.getRecipeById(recipeId);
  },

  // Mark curation recipe as archived
  async archiveRecipe(recipeId) {
    return recipeApiService.archiveRecipe(recipeId);
  },

  // Update recipe verification state
  async updateRecipeStatus(recipeId, status, reviewNotes = '', rejectionReason = '') {
    return recipeApiService.updateRecipeStatus(recipeId, status, reviewNotes, rejectionReason);
  }
};

export default archiveService;
