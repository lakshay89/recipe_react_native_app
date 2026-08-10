import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineService } from '../../../shared/services/offlineService';
import { API_BASE_URL } from '../../../core/config/apiConfig';
import { apiClient } from '../../../shared/services/apiClient';

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

      // Preserve scan properties and disclosures
      scan: data.scan || null,
      originalScanSourceMetadata: data.originalScanSourceMetadata || (data.scan ? data.scan.pages : null),
      originalOCRText: data.originalOCRText || data.scan?.originalText || '',
      correctedOCRText: data.correctedOCRText || data.scan?.correctedText || '',
      acceptedAISuggestions: data.acceptedAISuggestions || data.scan?.acceptedSuggestionIds || [],
      aiDisclosure: data.aiDisclosure !== undefined ? data.aiDisclosure : !!data.scan,

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
      const newDraft = this.mapStandardizedModel(draftData, 'draft');
      newDraft.draftId = newDraft.recipeId;

      // Save locally first
      const drafts = await this.getLocalRecipeDrafts();
      drafts.push(newDraft);
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));

      // Sync with backend if online
      if (offlineService.isConnected()) {
        try {
          const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipes/drafts`, {
            method: 'POST',
            body: JSON.stringify(newDraft)
          });
          if (response.ok) {
            const resJson = await response.json();
            if (resJson.success && resJson.data) {
              // Update local draft with backend's returned document
              const idx = drafts.findIndex(d => d.draftId === newDraft.draftId);
              if (idx !== -1) {
                drafts[idx] = resJson.data;
                await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
              }
              return resJson.data;
            }
          }
        } catch (syncErr) {
          console.warn('Backend sync failed during create draft, relying on offline cache', syncErr);
        }
      }

      return newDraft;
    } catch (e) {
      console.error('Error creating recipe draft', e);
      return null;
    }
  },

  async updateRecipeDraft(recipeId, draftData) {
    try {
      const drafts = await this.getLocalRecipeDrafts();
      const index = drafts.findIndex(d => d.recipeId === recipeId || d.draftId === recipeId);
      if (index === -1) {
        return this.createRecipeDraft(draftData);
      }
      const updated = this.mapStandardizedModel({ ...drafts[index], ...draftData }, 'draft');
      updated.draftId = recipeId;
      updated.recipeId = recipeId;
      drafts[index] = updated;
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));

      // Sync with backend if online
      if (offlineService.isConnected()) {
        try {
          const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipes/drafts`, {
            method: 'POST',
            body: JSON.stringify(updated)
          });
          if (response.ok) {
            const resJson = await response.json();
            if (resJson.success && resJson.data) {
              const idx = drafts.findIndex(d => d.draftId === recipeId);
              if (idx !== -1) {
                drafts[idx] = resJson.data;
                await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
              }
              return resJson.data;
            }
          }
        } catch (syncErr) {
          console.warn('Backend sync failed during update draft, relying on offline cache', syncErr);
        }
      }

      return updated;
    } catch (e) {
      console.error('Error updating recipe draft', e);
      return null;
    }
  },

  async getLocalRecipeDrafts() {
    try {
      const stored = await AsyncStorage.getItem(DRAFTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  async getRecipeDrafts() {
    try {
      // If online, fetch from backend and sync/update the local cache
      if (offlineService.isConnected()) {
        try {
          const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipes/drafts`);
          if (response.ok) {
            const resJson = await response.json();
            if (resJson.success && Array.isArray(resJson.data)) {
              await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(resJson.data));
              return resJson.data;
            }
          }
        } catch (syncErr) {
          console.warn('Backend fetch failed during getRecipeDrafts, falling back to local cache', syncErr);
        }
      }

      // Offline fallback
      return this.getLocalRecipeDrafts();
    } catch (e) {
      console.error('Error fetching recipe drafts list', e);
      return this.getLocalRecipeDrafts();
    }
  },

  async deleteRecipeDraft(recipeId) {
    try {
      const drafts = await this.getLocalRecipeDrafts();
      const filtered = drafts.filter(d => d.recipeId !== recipeId && d.draftId !== recipeId);
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));

      // Sync delete with backend if online
      if (offlineService.isConnected()) {
        try {
          const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipes/drafts/${recipeId}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            console.warn('Failed to delete draft from backend database, will clear on next sync');
          }
        } catch (syncErr) {
          console.warn('Backend sync failed during delete draft, relying on offline cache', syncErr);
        }
      }

      return true;
    } catch (e) {
      console.error('Error deleting recipe draft', e);
      return false;
    }
  },


  async submitRecipe(draftData, declaration, consent, aiDisclosureConfirmed, idempotencyKey) {
    try {
      const draftId = draftData.draftId || draftData.recipeId;
      const draftVersion = draftData.version || 1;

      if (!offlineService.isConnected()) {
        throw new Error('Your draft is saved on this device. Connect to the internet to submit it for review.');
      }

      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipe-drafts/${draftId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          draftVersion,
          idempotencyKey: idempotencyKey || `idemp-${draftId}-${Date.now()}`,
          declaration: declaration || { informationIsAccurate: true, permissionToSubmit: true, termsAccepted: true },
          consent: consent || { publicationPermission: true, sourceAttributionPermission: true, mediaUsagePermission: true },
          aiDisclosureConfirmed: aiDisclosureConfirmed !== undefined ? aiDisclosureConfirmed : true
        })
      });

      if (!response.ok) {
        const resErr = await response.json();
        throw new Error(resErr.message || (resErr.error && resErr.error.message) || 'Submission failed');
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        // Discard local draft
        await this.deleteRecipeDraft(draftId);

        // Save to local submissions list
        const submissions = await this.getSubmissionsList();
        const serverSub = resJson.data;
        const idx = submissions.findIndex(s => s.submissionId === serverSub.submissionId);
        if (idx > -1) {
          submissions[idx] = serverSub;
        } else {
          submissions.unshift(serverSub);
        }
        await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

        // Sync to local recipes list for general dashboard display
        const storedRecipes = await AsyncStorage.getItem(RECIPES_KEY);
        const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
        const rIdx = recipes.findIndex(r => r.recipeId === draftId || r.id === draftId);
        if (rIdx > -1) {
          recipes[rIdx] = serverSub;
        } else {
          recipes.unshift(serverSub);
        }
        await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));

        return serverSub;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.error('Error submitting recipe curation', e);
      throw e;
    }
  },

  async getSubmissionsList() {
    try {
      if (offlineService.isConnected()) {
        try {
          const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/submissions`);
          if (response.ok) {
            const resJson = await response.json();
            if (resJson.success && Array.isArray(resJson.data)) {
              await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(resJson.data));
              return resJson.data;
            }
          }
        } catch (syncErr) {
          console.warn('Backend fetch failed during getSubmissionsList, falling back to local cache', syncErr);
        }
      }
      const stored = await AsyncStorage.getItem(SUBMISSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error fetching recipe submissions list', e);
      return [];
    }
  },

  async getSubmissionById(submissionId) {
    try {
      if (offlineService.isConnected()) {
        try {
          const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/submissions/${submissionId}`);
          if (response.ok) {
            const resJson = await response.json();
            if (resJson.success && resJson.data) {
              return resJson.data;
            }
          }
        } catch (syncErr) {
          console.warn('Backend fetch failed during getSubmissionById', syncErr);
        }
      }
      const list = await this.getSubmissionsList();
      return list.find(s => s.submissionId === submissionId) || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async withdrawSubmission(submissionId) {
    try {
      if (!offlineService.isConnected()) {
        throw new Error('Connect to the internet to withdraw submission.');
      }
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/submissions/${submissionId}/withdraw`, {
        method: 'POST'
      });
      if (!response.ok) {
        const resErr = await response.json();
        throw new Error(resErr.message || 'Withdrawal failed');
      }
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        const list = await this.getSubmissionsList();
        const idx = list.findIndex(s => s.submissionId === submissionId);
        if (idx > -1) {
          list[idx] = resJson.data;
          await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
        }
        return resJson.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async resubmitSubmission(submissionId, draftData, declaration, consent, aiDisclosureConfirmed) {
    try {
      if (!offlineService.isConnected()) {
        throw new Error('Connect to the internet to resubmit.');
      }
      const draftVersion = draftData.version || 1;
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/submissions/${submissionId}/resubmit`, {
        method: 'POST',
        body: JSON.stringify({
          draftVersion,
          declaration,
          consent,
          aiDisclosureConfirmed
        })
      });
      if (!response.ok) {
        const resErr = await response.json();
        throw new Error(resErr.message || 'Resubmission failed');
      }
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        const list = await this.getSubmissionsList();
        const idx = list.findIndex(s => s.submissionId === submissionId);
        if (idx > -1) {
          list[idx] = resJson.data;
          await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
        }
        return resJson.data;
      }
      throw new Error('Invalid response');
    } catch (e) {
      console.error(e);
      throw e;
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
  },

  async initiateUpload(assetType, originalFileName, mimeType, size, draftId) {
    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/media/uploads/initiate`, {
        method: 'POST',
        body: JSON.stringify({ assetType, originalFileName, mimeType, size, draftId })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Initiation failed');
      }
      return await response.json();
    } catch (e) {
      console.error('Error initiating media upload', e);
      throw e;
    }
  },

  async uploadFile(uploadUrl, method, fields, fileUri, fileType, fileName, onProgress) {
    const isMock = fileUri && !fileUri.startsWith('/') && !fileUri.startsWith('file:') && !fileUri.startsWith('content:');
    if (isMock) {
      if (onProgress) {
        onProgress(50);
        setTimeout(() => onProgress(100), 100);
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Mock asset upload simulated successfully.' });
        }, 200);
      });
    }

    return new Promise(async (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = uploadUrl.startsWith('http') ? uploadUrl : `${API_BASE_URL}${uploadUrl}`;
      xhr.open(method || 'POST', url);
      xhr.timeout = 25000; // 25s timeout

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            resolve(res);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network upload error'));
      xhr.ontimeout = () => reject(new Error('Upload request timed out'));

      if (method === 'PUT') {
        try {
          const fileResponse = await fetch(fileUri);
          const blob = await fileResponse.blob();
          xhr.setRequestHeader('Content-Type', fileType || 'image/jpeg');
          xhr.send(blob);
        } catch (err) {
          reject(new Error(`Failed to read file for PUT upload: ${err.message}`));
        }
      } else {
        const formData = new FormData();
        if (fields) {
          Object.keys(fields).forEach((key) => {
            formData.append(key, fields[key]);
          });
        }
        formData.append('file', {
          uri: fileUri,
          type: fileType || 'image/jpeg',
          name: fileName || 'file.jpg'
        });

        xhr.send(formData);
      }
    });
  },

  async completeUpload(assetId) {
    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/media/uploads/${assetId}/complete`, {
        method: 'POST'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Completion failed');
      }
      return await response.json();
    } catch (e) {
      console.error('Error completing media upload', e);
      throw e;
    }
  },

  async deleteMediaAsset(assetId) {
    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/media/${assetId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Deletion failed');
      }
      return await response.json();
    } catch (e) {
      console.error('Error deleting media asset', e);
      throw e;
    }
  },

  async register(fullName, email, mobile, password) {
    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ fullName, email, mobile, password, termsAccepted: true })
      });
      if (!response.ok) {
        let errJson = {};
        try {
          errJson = await response.json();
        } catch (_) {}
        throw new Error(errJson.message || 'Registration failed');
      }
      return await response.json();
    } catch (e) {
      console.error('Registration failed', e);
      throw normalizeAuthError(e, 'Registration failed');
    }
  },

  async verifyEmail(verificationId, otp) {
    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/auth/verify-email`, {
        method: 'POST',
        body: JSON.stringify({ verificationId, otp })
      });
      if (!response.ok) {
        let errJson = {};
        try {
          errJson = await response.json();
        } catch (_) {}
        throw new Error(errJson.message || 'Verification failed');
      }
      return await response.json();
    } catch (e) {
      console.error('Verification failed', e);
      throw normalizeAuthError(e, 'Verification failed');
    }
  },

  async resendVerification(email) {
    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/auth/resend-verification`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        let errJson = {};
        try {
          errJson = await response.json();
        } catch (_) {}
        throw new Error(errJson.message || 'Resend failed');
      }
      return await response.json();
    } catch (e) {
      console.error('Resend verification failed', e);
      throw normalizeAuthError(e, 'Resend failed');
    }
  }
};

function normalizeAuthError(e, defaultMsg) {
  const errorObj = new Error(defaultMsg);
  errorObj.code = 'SERVER_ERROR';
  errorObj.status = null;

  if (!e) return errorObj;

  const msg = String(e.message || '');
  if (msg.includes('Network request failed') || msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
    errorObj.code = 'NETWORK_UNREACHABLE';
    errorObj.message = 'Unable to connect to the server. Check your connection and try again.';
  } else if (msg.includes('timeout') || msg.includes('AbortSignal')) {
    errorObj.code = 'REQUEST_TIMEOUT';
    errorObj.message = 'The request timed out. Please try again.';
  } else if (msg.includes('400') || msg.includes('Validation') || msg.includes('required')) {
    errorObj.code = 'INVALID_INPUT';
    errorObj.message = e.message;
  } else if (msg.includes('409') || msg.includes('already registered') || msg.includes('exists') || msg.includes('duplicate')) {
    errorObj.code = 'ACCOUNT_EXISTS';
    errorObj.message = e.message;
  } else if (msg.includes('unverified') || msg.includes('verify')) {
    errorObj.code = 'ACCOUNT_UNVERIFIED';
    errorObj.message = e.message;
  } else if (msg.includes('credentials') || msg.includes('password') || msg.includes('401')) {
    errorObj.code = 'INVALID_CREDENTIALS';
    errorObj.message = e.message;
  } else if (msg.includes('expired')) {
    errorObj.code = 'VERIFICATION_EXPIRED';
    errorObj.message = e.message;
  } else if (msg.includes('too many') || msg.includes('429')) {
    errorObj.code = 'TOO_MANY_ATTEMPTS';
    errorObj.message = e.message;
  } else {
    errorObj.message = e.message || defaultMsg;
  }

  return errorObj;
}

export default recipeApiService;
