import recipeApiService from './recipeApiService';

export const recipeSubmissionService = {
  // Retrieve all submitted recipes from local storage
  async getAllSubmissions() {
    return recipeApiService.getSubmissionsList();
  },

  // Save a new recipe submission
  async submitRecipe(draft) {
    return recipeApiService.submitRecipe(draft);
  }
};

export default recipeSubmissionService;
