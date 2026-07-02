import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [myRecipes, setMyRecipes] = useState([]);
  const [recipeDraft, setRecipeDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      const newRecipe = {
        ...recipe,
        id: Date.now().toString(),
        isApproved: false, // Only approved recipes become public (starts as false/draft)
        status: 'Pending Review',
        createdAt: new Date().toISOString(),
      };
      const updatedRecipes = [newRecipe, ...myRecipes];
      setMyRecipes(updatedRecipes);
      await AsyncStorage.setItem('@edible_india_recipes', JSON.stringify(updatedRecipes));
      return newRecipe;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Action: Edit local Recipe
  const editRecipe = async (recipeId, updatedData) => {
    try {
      const updatedRecipes = myRecipes.map((r) => {
        if (r.id === recipeId) {
          // If already published/approved, edits must trigger review state
          const wasApproved = r.status === 'Approved';
          return {
            ...r,
            ...updatedData,
            status: wasApproved ? 'Pending Edits Review' : 'Pending Review',
            isApproved: false, // goes back to unapproved until admin reviews
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

  const saveRecipeDraft = async (draft) => {
    try {
      setRecipeDraft(draft);
      await AsyncStorage.setItem('@edible_india_recipe_draft', JSON.stringify(draft));
    } catch (e) {
      console.error(e);
    }
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
