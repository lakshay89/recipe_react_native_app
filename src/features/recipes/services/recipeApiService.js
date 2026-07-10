import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineService } from '../../../shared/services/offlineService';

const DRAFTS_KEY = '@edible_india_recipe_drafts_list';
const RECIPES_KEY = '@edible_india_recipes';
const SUBMISSIONS_KEY = '@edible_india_recipe_submissions';

export const recipeApiService = {
  // Helper to map standardized backend data structures
  mapStandardizedModel(data, defaultStatus = 'draft') {
    const now = new Date().toISOString();
    return {
      recipeId: data.recipeId || data.id || Date.now().toString(),
      draftId: data.draftId || '',
      userId: data.userId || 'user_123',
      title: data.title || data.recipeName || '',
      nativeName: data.nativeName || data.localName || '',
      region: data.region || '',
      state: data.state || data.region || '',
      district: data.district || '',
      language: data.language || '',
      ingredients: data.ingredients || data.ingredientsList || [],
      cookingSteps: data.cookingSteps || data.cookingStepsList || [],
      cultureDetails: {
        festival: data.festival || '',
        season: data.season || '',
        community: data.community || '',
        tribe: data.tribe || '',
        dietType: data.dietType || '',
        rarityStatus: data.rarityStatus || '',
        cookingVessel: data.cookingVessel || '',
        cookingMedium: data.cookingMedium || '',
        ...(data.cultureDetails || {})
      },
      heritageSource: data.heritageSource || data.whoTaughtYou || '',
      media: {
        hasHero: data.hasHero || false,
        hasDish: data.hasDish || false,
        hasIngredients: data.hasIngredients || false,
        hasGallery: data.hasGallery || false,
        hasVideo: data.hasVideo || false,
        hasAudio: data.hasAudio || false,
        ...(data.media || {})
      },
      status: data.status || defaultStatus,
      curatorStatus: data.curatorStatus || 'active',
      reviewNotes: data.reviewNotes || '',
      rejectionReason: data.rejectionReason || '',
      changeRequests: data.changeRequests || [],
      version: data.version || 1,
      createdAt: data.createdAt || now,
      updatedAt: now,
      submittedAt: data.submittedAt || (defaultStatus === 'pending_review' ? now : null),
      approvedAt: data.approvedAt || null,
      rejectedAt: data.rejectedAt || null,
      publishedAt: data.publishedAt || null,
      archivedAt: data.archivedAt || null,
      createdBy: data.createdBy || 'user_123',
      reviewedBy: data.reviewedBy || '',
      metadata: {
        gpsCoords: data.gpsCoords || '',
        isBorderRegion: data.isBorderRegion || false,
        approxAge: data.approxAge || '',
        serves: data.serves || '4',
        prepTime: data.prepTime || '',
        cookTime: data.cookTime || '',
        totalTime: data.totalTime || '',
        traditionalTips: data.traditionalTips || '',
        ...(data.metadata || {})
      },
      
      // Pass-through legacy fields for existing UI component compatibility
      id: data.id || data.recipeId || Date.now().toString(),
      localName: data.localName || data.nativeName || '',
      nativeScript: data.nativeScript || '',
      englishName: data.englishName || '',
      altNames: data.altNames || '',
      history: data.history || data.heritageSource || '',
      tehsil: data.tehsil || '',
      village: data.village || '',
      gpsCoords: data.gpsCoords || '',
      isBorderRegion: data.isBorderRegion || false,
      whoTaughtYou: data.whoTaughtYou || '',
      numGenerations: data.numGenerations || '',
      approxAge: data.approxAge || '',
      serves: data.serves || '4',
      ingredientsList: data.ingredientsList || data.ingredients || [],
      prepTime: data.prepTime || '',
      cookTime: data.cookTime || '',
      totalTime: data.totalTime || '',
      cookingStepsList: data.cookingStepsList || data.cookingSteps || [],
      instructions: data.instructions || data.cookingSteps || '',
      traditionalTips: data.traditionalTips || '',
    };
  },

  async createRecipeDraft(draftData) {
    try {
      const drafts = await this.getRecipeDrafts();
      const newDraft = this.mapStandardizedModel(draftData, 'draft');
      newDraft.draftId = newDraft.recipeId;
      drafts.push(newDraft);
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      return newDraft;
    } catch (e) {
      console.error('Error creating recipe draft', e);
      return null;
    }
  },

  async updateRecipeDraft(recipeId, draftData) {
    try {
      const drafts = await this.getRecipeDrafts();
      const index = drafts.findIndex(d => d.recipeId === recipeId || d.draftId === recipeId);
      if (index === -1) {
        // Fallback: create draft if not exists
        return this.createRecipeDraft(draftData);
      }
      const updated = this.mapStandardizedModel({ ...drafts[index], ...draftData }, 'draft');
      updated.draftId = recipeId;
      updated.recipeId = recipeId;
      drafts[index] = updated;
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      return updated;
    } catch (e) {
      console.error('Error updating recipe draft', e);
      return null;
    }
  },

  async getRecipeDrafts() {
    try {
      const stored = await AsyncStorage.getItem(DRAFTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error fetching recipe drafts list', e);
      return [];
    }
  },

  async deleteRecipeDraft(recipeId) {
    try {
      const drafts = await this.getRecipeDrafts();
      const filtered = drafts.filter(d => d.recipeId !== recipeId && d.draftId !== recipeId);
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Error deleting recipe draft', e);
      return false;
    }
  },

  async submitRecipe(draftData) {
    try {
      const now = new Date().toISOString();
      const online = offlineService.isConnected();
      const targetStatus = online ? 'Pending Review' : 'Waiting for Internet';
      
      const submission = this.mapStandardizedModel(draftData, targetStatus);
      submission.submittedAt = now;
      if (!online) {
        submission.curatorStatus = 'waiting_for_internet';
        submission.reviewNotes = 'Pending internet connection to sync.';
      } else {
        submission.curatorStatus = 'pending_review';
        submission.reviewNotes = 'Heritage experts pending review.';
      }

      // Save to submissions list
      const submissions = await this.getSubmissionsList();
      submissions.push(submission);
      await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

      // Sync to general recipes list
      const storedRecipes = await AsyncStorage.getItem(RECIPES_KEY);
      const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
      const index = recipes.findIndex(r => r.recipeId === submission.recipeId || r.id === submission.id);
      if (index > -1) {
        recipes[index] = submission;
      } else {
        recipes.unshift(submission);
      }
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));

      // Discard active drafts
      await this.deleteRecipeDraft(draftData.draftId || draftData.recipeId);

      return submission;
    } catch (e) {
      console.error('Error submitting recipe curation', e);
      return null;
    }
  },

  async getSubmissionsList() {
    try {
      const stored = await AsyncStorage.getItem(SUBMISSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error fetching recipe submissions list', e);
      return [];
    }
  },

  async getPendingRecipes() {
    try {
      const recipes = await this.getRecipesList();
      return recipes.filter(r => r.status === 'pending_review' || r.status === 'Pending Review' || r.status === 'changes_requested');
    } catch (e) {
      console.error('Error fetching pending review recipes', e);
      return [];
    }
  },

  async getPublishedRecipes() {
    try {
      const recipes = await this.getRecipesList();
      return recipes.filter(r => r.status === 'approved' || r.status === 'Approved' || r.status === 'published' || r.status === 'Published');
    } catch (e) {
      console.error('Error fetching published recipes', e);
      return [];
    }
  },

  async getRejectedRecipes() {
    try {
      const recipes = await this.getRecipesList();
      return recipes.filter(r => r.status === 'rejected' || r.status === 'Rejected');
    } catch (e) {
      console.error('Error fetching rejected recipes', e);
      return [];
    }
  },

  async getRecipeById(recipeId) {
    try {
      const recipes = await this.getRecipesList();
      return recipes.find(r => r.recipeId === recipeId || r.id === recipeId) || null;
    } catch (e) {
      console.error('Error fetching recipe by id', e);
      return null;
    }
  },

  async updateRecipeStatus(recipeId, status, reviewNotes = '', rejectionReason = '') {
    try {
      const recipes = await this.getRecipesList();
      const index = recipes.findIndex(r => r.recipeId === recipeId || r.id === recipeId);
      if (index === -1) return null;
      
      const updated = {
        ...recipes[index],
        status,
        updatedAt: new Date().toISOString(),
        reviewNotes,
        rejectionReason,
      };

      if (status === 'approved') updated.approvedAt = new Date().toISOString();
      if (status === 'rejected') updated.rejectedAt = new Date().toISOString();
      if (status === 'published') updated.publishedAt = new Date().toISOString();
      if (status === 'archived') updated.archivedAt = new Date().toISOString();

      recipes[index] = updated;
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
      return updated;
    } catch (e) {
      console.error('Error updating recipe status', e);
      return null;
    }
  },

  async archiveRecipe(recipeId) {
    return this.updateRecipeStatus(recipeId, 'archived');
  },

  async getRecipesList() {
    try {
      const stored = await AsyncStorage.getItem(RECIPES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading all recipes list', e);
      return [];
    }
  }
};

export default recipeApiService;
