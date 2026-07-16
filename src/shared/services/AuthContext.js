import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipeDraftService } from '../../features/recipes/services/recipeDraftService';
import { recipeSubmissionService } from '../../features/recipes/services/recipeSubmissionService';
import { offlineService } from './offlineService';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [myRecipes, setMyRecipes] = useState([]);
  const [recipeDraft, setRecipeDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const draftSaveTimeoutRef = useRef(null);

  // Load state from storage on mount
  useEffect(() => {
    const loadStorageData = async () => {
      try {
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
        if (storedDraft) {
          setRecipeDraft(JSON.parse(storedDraft));
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

  // Action: Login (stores phone/email temporarily during OTP verification)
  const login = async (userData) => {
    try {
      const mergedUser = { ...user, ...userData };
      setUser(mergedUser);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('@edible_india_authenticated', 'true');
      await AsyncStorage.setItem('@edible_india_user', JSON.stringify(mergedUser));
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Complete Profile Setup (includes optional Institute Name)
  const completeProfileSetup = async (profileData) => {
    try {
      const updatedUser = {
        ...user,
        ...profileData,
        isProfileComplete: true,
      };
      setUser(updatedUser);
      await AsyncStorage.setItem('@edible_india_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Logout
  const logout = async () => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.removeItem('@edible_india_authenticated');
      await AsyncStorage.removeItem('@edible_india_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Add local Recipe
  const addRecipe = async (recipe) => {
    try {
      const newRecipe = await recipeSubmissionService.submitRecipe(recipe);
      if (newRecipe) {
        setMyRecipes((prev) => [newRecipe, ...prev]);
      }
      return newRecipe;
    } catch (e) {
      console.error(e);
      return null;
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

  const saveRecipeDraft = async (draft, stepName = 'RecipeIdentity') => {
    setRecipeDraft(draft);

    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }

    draftSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('@edible_india_recipe_draft', JSON.stringify(draft));
        await recipeDraftService.saveDraft(draft, stepName);
      } catch (e) {
        console.error('Debounced save error:', e);
      }
    }, 500);
  };

  const clearRecipeDraft = async () => {
    try {
      setRecipeDraft(null);
      await AsyncStorage.removeItem('@edible_india_recipe_draft');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        selectedLanguage,
        hasCompletedOnboarding,
        myRecipes,
        recipeDraft,
        isLoading,
        chooseLanguage,
        completeOnboarding,
        login,
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
