import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipeDraftService } from '../../features/recipes/services/recipeDraftService';
import { recipeSubmissionService } from '../../features/recipes/services/recipeSubmissionService';
import { recipeApiService } from '../../features/recipes/services/recipeApiService';
import { offlineService } from './offlineService';
import { API_BASE_URL } from '../../core/config/apiConfig';
import { tokenStorage, apiClient } from './apiClient';
import { AppState } from 'react-native';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [myRecipes, setMyRecipes] = useState([]);
  const [recipeDraft, setRecipeDraft] = useState(null);
  const [savingState, setSavingState] = useState('Saved');
  const [isLoading, setIsLoading] = useState(true);
  const draftSaveTimeoutRef = useRef(null);

  // Load state from storage on mount
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        await tokenStorage.loadTokens();

        // Expose global hook for token refresh failure logout
        global.onAuthExpired = () => {
          logout();
        };

        const [
          storedAuth,
          storedUser,
          storedLanguage,
          storedOnboarding,
          storedRecipes,
          storedDraft,
        ] = await Promise.all([
          AsyncStorage.getItem('@edible_india_authenticated'),
          AsyncStorage.getItem('@edible_india_user'),
          AsyncStorage.getItem('@edible_india_language'),
          AsyncStorage.getItem('@edible_india_onboarding'),
          AsyncStorage.getItem('@edible_india_recipes'),
          AsyncStorage.getItem('@edible_india_recipe_draft'),
        ]);

        if (storedAuth === 'true') {
          setIsAuthenticated(true);
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedLanguage) {
          setSelectedLanguage(storedLanguage);
        }
        if (storedOnboarding === 'true') {
          setHasCompletedOnboarding(true);
        }
        if (storedRecipes) {
          setMyRecipes(JSON.parse(storedRecipes));
        }

        // Recovery & Merge logic
        const onlineStatus = offlineService.isConnected();
        let loadedDraft = storedDraft ? JSON.parse(storedDraft) : null;

        if (loadedDraft) {
          setRecipeDraft(loadedDraft);
        }

        // Asynchronously sync and merge server drafts in background
        if (storedAuth === 'true' && onlineStatus) {
          setTimeout(async () => {
            try {
              const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipes/drafts`);
              if (response.ok) {
                const resJson = await response.json();
                if (resJson.success && Array.isArray(resJson.data)) {
                  const serverDrafts = resJson.data;
                  const mergedList = [];

                  for (const serverD of serverDrafts) {
                    const localStr = await AsyncStorage.getItem(`@edible_india_draft_${serverD.draftId}`);
                    if (localStr) {
                      const localD = JSON.parse(localStr);
                      const localTime = localD.clientUpdatedAt ? new Date(localD.clientUpdatedAt) : new Date(0);
                      const serverTime = serverD.clientUpdatedAt ? new Date(serverD.clientUpdatedAt) : new Date(serverD.updatedAt || 0);

                      if (localD.isDirty && localTime > serverTime) {
                        mergedList.push(localD);
                      } else {
                        const updatedD = { ...serverD, isDirty: false };
                        await AsyncStorage.setItem(`@edible_india_draft_${serverD.draftId}`, JSON.stringify(updatedD));
                        mergedList.push(updatedD);
                      }
                    } else {
                      const updatedD = { ...serverD, isDirty: false };
                      await AsyncStorage.setItem(`@edible_india_draft_${serverD.draftId}`, JSON.stringify(updatedD));
                      mergedList.push(updatedD);
                    }
                  }

                  await AsyncStorage.setItem('@edible_india_recipe_drafts_list', JSON.stringify(mergedList));

                  // Refresh active draft state with server values safely in background
                  setRecipeDraft(prev => {
                    if (prev) {
                      const mergedActive = mergedList.find(d => d.draftId === prev.draftId);
                      if (mergedActive) {
                        AsyncStorage.setItem('@edible_india_recipe_draft', JSON.stringify(mergedActive));
                        return mergedActive;
                      }
                    }
                    return prev;
                  });
                }
              }
            } catch (e) {
              console.warn('Failed to retrieve and merge server drafts on startup', e);
            }
          }, 0);
        }
      } catch (error) {
        console.error('Error loading auth data from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // Offline sync listener
  useEffect(() => {
    return offlineService.subscribe(async (online) => {
      if (online) {
        await flushSyncQueue();
        try {
          const storedRecipes = await AsyncStorage.getItem('@edible_india_recipes');
          if (storedRecipes) {
            const recipes = JSON.parse(storedRecipes);
            let hasChanges = false;
            const updated = recipes.map(r => {
              const s = (r.status || '').toLowerCase();
              if (s === 'waiting for internet' || s === 'waiting_for_internet') {
                hasChanges = true;
                return {
                  ...r,
                  status: 'Pending Review',
                  curatorStatus: 'pending_review',
                  reviewNotes: 'Heritage experts pending review.',
                  updatedAt: new Date().toISOString()
                };
              }
              return r;
            });
            if (hasChanges) {
              setMyRecipes(updated);
              await AsyncStorage.setItem('@edible_india_recipes', JSON.stringify(updated));

              const storedSubmissions = await AsyncStorage.getItem('@edible_india_recipe_submissions');
              if (storedSubmissions) {
                const submissions = JSON.parse(storedSubmissions);
                const updatedSubs = submissions.map(s => {
                  const status = (s.status || '').toLowerCase();
                  if (status === 'waiting for internet' || status === 'waiting_for_internet') {
                    return {
                      ...s,
                      status: 'Pending Review',
                      curatorStatus: 'pending_review',
                      reviewNotes: 'Heritage experts pending review.',
                      updatedAt: new Date().toISOString()
                    };
                  }
                  return s;
                });
                await AsyncStorage.setItem('@edible_india_recipe_submissions', JSON.stringify(updatedSubs));
              }
            }
          }
        } catch (e) {
          console.error('Offline synchronization error', e);
        }
      }
    });
  }, []);

  // Action: Select Language
  const chooseLanguage = async (lang) => {
    try {
      setSelectedLanguage(lang);
      await AsyncStorage.setItem('@edible_india_language', lang);
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Complete Onboarding
  const completeOnboarding = async () => {
    try {
      setHasCompletedOnboarding(true);
      await AsyncStorage.setItem('@edible_india_onboarding', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Login (real backend authentication)
  const login = async (identifier, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      if (!response.ok) {
        const resErr = await response.json();
        throw new Error(resErr.message || 'Login failed');
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        const { user: backendUser, tokens } = resJson.data;
        setUser(backendUser);
        setIsAuthenticated(true);
        await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        await AsyncStorage.setItem('@edible_india_authenticated', 'true');
        await AsyncStorage.setItem('@edible_india_user', JSON.stringify(backendUser));

        // Guest drafts migration trigger!
        const drafts = await recipeDraftService.getAllDrafts();
        if (drafts.length > 0) {
          try {
            await fetch(`${API_BASE_URL}/api/v1/recipes/drafts/migrate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.accessToken}`
              },
              body: JSON.stringify(drafts)
            });
          } catch (migrateErr) {
            console.warn('Guest drafts migration failed during login', migrateErr);
          }
        }

        return backendUser;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Action: Register User (real backend registration)
  const registerUser = async (fullName, email, mobile, password) => {
    return await recipeApiService.register(fullName, email, mobile, password);
  };

  // Action: Complete Profile Setup (real backend integration)
  const completeProfileSetup = async (profileData) => {
    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const resErr = await response.json();
        throw new Error(resErr.message || 'Profile setup failed');
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setUser(resJson.data);
        await AsyncStorage.setItem('@edible_india_user', JSON.stringify(resJson.data));
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Action: Logout (real backend session termination)
  const logout = async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (e) {
      console.warn('Logout api cleanup failed', e);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      await tokenStorage.clearTokens();
      await AsyncStorage.removeItem('@edible_india_authenticated');
      await AsyncStorage.removeItem('@edible_india_user');
    }
  };

  // Action: Add local Recipe (Submit to Backend Review)
  const addRecipe = async (recipe, declaration, consent, aiDisclosureConfirmed, idempotencyKey) => {
    try {
      const newRecipe = await recipeSubmissionService.submitRecipe(recipe, declaration, consent, aiDisclosureConfirmed, idempotencyKey);
      if (newRecipe) {
        setMyRecipes((prev) => [newRecipe, ...prev]);
      }
      return newRecipe;
    } catch (e) {
      console.error('Submission failed in AuthContext addRecipe:', e);
      throw e;
    }
  };

  // Action: Edit local Recipe (Pre-published)
  const editRecipe = async (recipeId, updatedData) => {
    try {
      const updatedRecipes = myRecipes.map((r) => {
        if (r.id === recipeId) {
          const nextVersion = r.versions ? r.versions.length + 1 : 2;
          const currentVersions = r.versions || [];
          return {
            ...r,
            ...updatedData,
            versions: [
              ...currentVersions,
              {
                version: nextVersion,
                date: new Date().toISOString(),
                status: r.status,
                changes: 'Contributor updated info',
              }
            ]
          };
        }
        return r;
      });
      setMyRecipes(updatedRecipes);
      await AsyncStorage.setItem('@edible_india_recipes', JSON.stringify(updatedRecipes));
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Duplicate local Recipe
  const duplicateRecipe = async (recipeId) => {
    try {
      const target = myRecipes.find((r) => r.id === recipeId);
      if (!target) return;
      const duplicated = {
        ...target,
        id: Date.now().toString(),
        title: `Copy of ${target.title}`,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        versions: [
          {
            version: 1,
            date: new Date().toISOString(),
            status: 'Draft',
            changes: 'Duplicated from existing archive entry',
          }
        ],
        reviewHistory: [],
      };
      const updatedRecipes = [duplicated, ...myRecipes];
      setMyRecipes(updatedRecipes);
      await AsyncStorage.setItem('@edible_india_recipes', JSON.stringify(updatedRecipes));
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Delete local Recipe (only allowed for Draft status)
  const deleteRecipe = async (recipeId) => {
    try {
      const updatedRecipes = myRecipes.filter((r) => r.id !== recipeId);
      setMyRecipes(updatedRecipes);
      await AsyncStorage.setItem('@edible_india_recipes', JSON.stringify(updatedRecipes));
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Submit Update Request for Published Recipes
  const submitUpdateRequest = async (recipeId, updatedFields) => {
    try {
      const updatedRecipes = myRecipes.map((r) => {
        if (r.id === recipeId) {
          const nextVersion = r.versions ? r.versions.length + 1 : 2;
          const currentVersions = r.versions || [
            { version: 1, date: r.createdAt || new Date().toISOString(), status: r.status, changes: 'Original Submission' }
          ];

          return {
            ...r,
            status: 'Update Under Review',
            pendingUpdate: updatedFields, // Keep original published intact but attach pending fields
            versions: [
              ...currentVersions,
              {
                version: nextVersion,
                date: new Date().toISOString(),
                status: 'Update Under Review',
                changes: 'Contributor submitted update request',
              }
            ],
            reviewHistory: [
              ...(r.reviewHistory || []),
              {
                date: new Date().toISOString(),
                status: 'Update Under Review',
                notes: 'Heritage review initiated on update request.',
              }
            ]
          };
        }
        return r;
      });
      setMyRecipes(updatedRecipes);
      await AsyncStorage.setItem('@edible_india_recipes', JSON.stringify(updatedRecipes));
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Resubmit a rejected recipe
  const resubmitRecipe = async (recipeId, updatedFields) => {
    try {
      const updatedRecipes = myRecipes.map((r) => {
        if (r.id === recipeId) {
          const nextVersion = r.versions ? r.versions.length + 1 : 2;
          const currentVersions = r.versions || [];
          return {
            ...r,
            ...updatedFields,
            status: 'Pending Review',
            versions: [
              ...currentVersions,
              {
                version: nextVersion,
                date: new Date().toISOString(),
                status: 'Pending Review',
                changes: 'Resubmitted after changes',
              }
            ],
            reviewHistory: [
              ...(r.reviewHistory || []),
              {
                date: new Date().toISOString(),
                status: 'Pending Review',
                notes: 'Resubmission received. Reviewing changes.',
              }
            ]
          };
        }
        return r;
      });
      setMyRecipes(updatedRecipes);
      await AsyncStorage.setItem('@edible_india_recipes', JSON.stringify(updatedRecipes));
    } catch (e) {
      console.error(e);
    }
  };

  const getStoredQueue = async () => {
    try {
      const stored = await AsyncStorage.getItem('@edible_india_sync_queue');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const queueSyncAction = async (action) => {
    try {
      const currentQueue = await getStoredQueue();
      const filtered = currentQueue.filter(item => item.draftId !== action.draftId);
      filtered.push(action);
      await AsyncStorage.setItem('@edible_india_sync_queue', JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to queue sync action', e);
    }
  };

  const executeRemoteSave = async (draft, force = false) => {
    if (!offlineService.isConnected()) {
      setSavingState('SavedLocallyWaiting');
      return;
    }
    setSavingState('Syncing');
    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipes/drafts${force ? '?force=true' : ''}`, {
        method: 'POST',
        body: JSON.stringify(draft)
      });

      if (response.status === 409) {
        const resJson = await response.json();
        setSavingState('Conflict');
        global.pendingConflict = {
          localDraft: draft,
          serverDraft: resJson.errors?.serverDraft || resJson.errors
        };
        if (global.onConflictDetected) {
          global.onConflictDetected(resJson.errors?.serverDraft || resJson.errors);
        }
        throw { status: 409, message: 'Conflict detected' };
      }

      if (!response.ok) {
        setSavingState('SyncFailed');
        throw { status: response.status, message: 'Sync failed' };
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setSavingState('Saved');
        setRecipeDraft(prev => {
          const clientVer = prev ? (prev.version || 1) : 1;
          const serverVer = resJson.data.version || 1;
          if (clientVer > serverVer) {
            return prev;
          }
          const syncedDraft = { ...resJson.data, isDirty: false };
          AsyncStorage.setItem(`@edible_india_draft_${syncedDraft.draftId}`, JSON.stringify(syncedDraft));
          AsyncStorage.setItem('@edible_india_recipe_draft', JSON.stringify(syncedDraft));
          return syncedDraft;
        });
        return resJson.data;
      }
    } catch (err) {
      if (err.status !== 409) {
        setSavingState('SyncFailed');
      }
      throw err;
    }
  };

  const executeRemoteDelete = async (draftId) => {
    if (!offlineService.isConnected()) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipes/drafts/${draftId}`, {
        method: 'DELETE',
        signal: controller.signal
      });
      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete draft on remote server');
      }
    } catch (err) {
      console.warn('executeRemoteDelete failed', err);
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const flushSyncQueue = async () => {
    if (!offlineService.isConnected()) return;
    const queue = await getStoredQueue();
    if (queue.length === 0) return;

    const currentUserId = user?.id || 'guest_user';
    const myQueue = queue.filter(item => item.userId === currentUserId);
    if (myQueue.length === 0) return;

    for (const item of myQueue) {
      try {
        if (item.type === 'SAVE') {
          await executeRemoteSave(item.draftData);
        } else if (item.type === 'DELETE') {
          await executeRemoteDelete(item.draftId);
        }
        const freshQueue = await getStoredQueue();
        const updated = freshQueue.filter(x => x.draftId !== item.draftId);
        await AsyncStorage.setItem('@edible_india_sync_queue', JSON.stringify(updated));
      } catch (err) {
        if (err.status === 409 || err.status === 401 || err.status === 403 || err.status === 400) {
          const freshQueue = await getStoredQueue();
          const updated = freshQueue.filter(x => x.draftId !== item.draftId);
          await AsyncStorage.setItem('@edible_india_sync_queue', JSON.stringify(updated));
        }
      }
    }
  };

  const flushPendingSave = async () => {
    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
      draftSaveTimeoutRef.current = null;
    }
    if (recipeDraft && recipeDraft.isDirty && offlineService.isConnected()) {
      try {
        await executeRemoteSave(recipeDraft);
      } catch (err) {
        console.warn('flushPendingSave execution failed', err);
      }
    }
  };

  const resolveConflict = async (resolution) => {
    if (!global.pendingConflict) return;
    const { localDraft, serverDraft } = global.pendingConflict;

    if (resolution === 'keep_local') {
      try {
        const bumpedDraft = {
          ...localDraft,
          version: (serverDraft.version || 1) + 1,
          clientUpdatedAt: new Date().toISOString()
        };
        await executeRemoteSave(bumpedDraft, true);
        global.pendingConflict = null;
      } catch (err) {
        console.error('Conflict resolution keep_local failed', err);
      }
    } else if (resolution === 'keep_server') {
      const syncedDraft = { ...serverDraft, isDirty: false };
      setRecipeDraft(syncedDraft);
      setSavingState('Saved');
      await AsyncStorage.setItem(`@edible_india_draft_${syncedDraft.draftId}`, JSON.stringify(syncedDraft));
      await AsyncStorage.setItem('@edible_india_recipe_draft', JSON.stringify(syncedDraft));
      global.pendingConflict = null;
    }
  };

  const saveRecipeDraft = async (draft, stepName = 'RecipeIdentity') => {
    setSavingState('SavingLocally');

    const draftId = draft.draftId || draft.recipeId || `draft-${Date.now()}`;
    const prevDraft = recipeDraft || {};

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
      ...prevDraft,
      ...draft,
      draftId,
      recipeId: draftId,
      currentStep: stepName,
      completionPercentage: percentage,
      version: (prevDraft.version || 0) + 1,
      clientUpdatedAt: new Date().toISOString(),
      isDirty: true
    };

    setRecipeDraft(enriched);

    try {
      await AsyncStorage.setItem('@edible_india_recipe_draft', JSON.stringify(enriched));
      await AsyncStorage.setItem(`@edible_india_draft_${draftId}`, JSON.stringify(enriched));

      const localList = await recipeApiService.getLocalRecipeDrafts();
      const idx = localList.findIndex(d => d.draftId === draftId);
      if (idx === -1) {
        localList.push(enriched);
      } else {
        localList[idx] = enriched;
      }
      await AsyncStorage.setItem('@edible_india_recipe_drafts_list', JSON.stringify(localList));

      if (!offlineService.isConnected()) {
        setSavingState('SavedLocallyWaiting');
        await queueSyncAction({
          type: 'SAVE',
          draftId,
          draftData: enriched,
          userId: user?.id || 'guest_user'
        });
      } else {
        if (draftSaveTimeoutRef.current) {
          clearTimeout(draftSaveTimeoutRef.current);
        }
        draftSaveTimeoutRef.current = setTimeout(async () => {
          try {
            await executeRemoteSave(enriched);
          } catch (e) {
            console.warn('Remote sync failed', e);
          }
        }, 2000);
      }
    } catch (e) {
      console.error('saveRecipeDraft local write failed', e);
      setSavingState('SyncFailed');
    }
  };

  const clearRecipeDraft = async () => {
    try {
      if (recipeDraft) {
        const draftId = recipeDraft.draftId;
        
        // If offline, queue local delete action and sync later
        if (!offlineService.isConnected()) {
          setRecipeDraft(null);
          await AsyncStorage.removeItem('@edible_india_recipe_draft');
          if (draftId) {
            await AsyncStorage.removeItem(`@edible_india_draft_${draftId}`);
            const localList = await recipeApiService.getLocalRecipeDrafts();
            const updatedList = localList.filter(d => d.draftId !== draftId);
            await AsyncStorage.setItem('@edible_india_recipe_drafts_list', JSON.stringify(updatedList));
          }
          await queueSyncAction({
            type: 'DELETE',
            draftId,
            userId: user?.id || 'guest_user'
          });
        } else {
          // If online, perform remote delete first
          if (draftId) {
            try {
              await executeRemoteDelete(draftId);
            } catch (err) {
              const errMsg = String(err.message || err || '');
              const isNetworkError = errMsg.includes('Network request failed') || errMsg.includes('aborted') || err.name === 'AbortError';
              if (isNetworkError) {
                // Connection/offline failure: queue sync deletion action for later deletion,
                // and clear locally now to avoid blocking the user flow
                await queueSyncAction({
                  type: 'DELETE',
                  draftId,
                  userId: user?.id || 'guest_user'
                });
              } else {
                // For other valid server responses (like 403), rethrow to log/handle
                throw err;
              }
            }
          }

          // Clear local storage after successful remote delete (or queued sync delete)
          setRecipeDraft(null);
          await AsyncStorage.removeItem('@edible_india_recipe_draft');
          if (draftId) {
            await AsyncStorage.removeItem(`@edible_india_draft_${draftId}`);
            const localList = await recipeApiService.getLocalRecipeDrafts();
            const updatedList = localList.filter(d => d.draftId !== draftId);
            await AsyncStorage.setItem('@edible_india_recipe_drafts_list', JSON.stringify(updatedList));
          }
        }
      }
    } catch (e) {
      console.error('clearRecipeDraft failed', e);
    }
  };

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        await flushPendingSave();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [recipeDraft]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        selectedLanguage,
        hasCompletedOnboarding,
        myRecipes,
        recipeDraft,
        savingState,
        isLoading,
        chooseLanguage,
        completeOnboarding,
        login,
        registerUser,
        completeProfileSetup,
        logout,
        addRecipe,
        editRecipe,
        duplicateRecipe,
        deleteRecipe,
        submitUpdateRequest,
        resubmitRecipe,
        saveRecipeDraft,
        clearRecipeDraft,
        flushPendingSave,
        resolveConflict,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
