import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUILT_IN_RECIPES } from './recipeNameData';

const CUSTOM_RECIPES_KEY = '@edible_india_custom_recipe_names';

// In-memory cache to prevent constant AsyncStorage reads
let customRecipesCache = null;

/**
 * Normalizes a recipe name:
 * - Trims leading/trailing spaces
 * - Collapses repeated spaces to a single space
 * - Capitalizes each word nicely
 * - Returns empty string if it contains only symbols/numbers
 */
export const normalizeRecipeName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  // Collapse spaces and trim
  let normalized = name.replace(/\s+/g, ' ').trim();
  
  // Ensure the name contains at least one letter character
  if (!/[a-zA-Z]/.test(normalized)) {
    return '';
  }

  // Capitalize each word for a premium clean display format
  normalized = normalized
    .split(' ')
    .map((word) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return normalized;
};

/**
 * Checks if a recipe name already exists in the built-in or custom lists.
 * Comparison is case-insensitive and normalized.
 */
export const recipeNameExists = async (name) => {
  const normalizedNew = normalizeRecipeName(name);
  if (!normalizedNew) return false;

  const allNames = await getAllRecipeNames();
  return allNames.some(
    (existingName) => normalizeRecipeName(existingName) === normalizedNew
  );
};

/**
 * Loads custom names from AsyncStorage and merges them with built-in ones.
 * Removes duplicate entries using normalization.
 */
export const getAllRecipeNames = async () => {
  let customNames = [];
  try {
    if (customRecipesCache !== null) {
      customNames = customRecipesCache;
    } else {
      const stored = await AsyncStorage.getItem(CUSTOM_RECIPES_KEY);
      if (stored) {
        customNames = JSON.parse(stored);
        if (Array.isArray(customNames)) {
          customRecipesCache = customNames;
        } else {
          customNames = [];
        }
      }
    }
  } catch (error) {
    console.error('Failed to load custom recipe names from AsyncStorage', error);
  }

  // Merge built-in and custom names, ensuring no duplicates via normalization map
  const uniqueNamesMap = new Map();

  BUILT_IN_RECIPES.forEach((name) => {
    const normalized = normalizeRecipeName(name);
    if (normalized && !uniqueNamesMap.has(normalized)) {
      uniqueNamesMap.set(normalized, name);
    }
  });

  customNames.forEach((name) => {
    const normalized = normalizeRecipeName(name);
    if (normalized && !uniqueNamesMap.has(normalized)) {
      uniqueNamesMap.set(normalized, name);
    }
  });

  return Array.from(uniqueNamesMap.values());
};

/**
 * Returns suggestions that partially match the case-insensitive search query.
 */
export const searchRecipeNames = async (query) => {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const allNames = await getAllRecipeNames();

  return allNames.filter((name) =>
    name.toLowerCase().includes(normalizedQuery)
  );
};

/**
 * Adds a new custom recipe name to AsyncStorage if it does not already exist.
 */
export const addCustomRecipeName = async (name) => {
  const normalized = normalizeRecipeName(name);
  if (!normalized) {
    throw new Error('Invalid recipe name.');
  }

  const exists = await recipeNameExists(normalized);
  if (exists) {
    return normalized; // Already exists, reuse existing entry
  }

  // Load latest custom list
  let customNames = [];
  try {
    const stored = await AsyncStorage.getItem(CUSTOM_RECIPES_KEY);
    if (stored) {
      customNames = JSON.parse(stored);
      if (!Array.isArray(customNames)) {
        customNames = [];
      }
    }
  } catch (e) {
    console.error('Error loading custom recipe names to append', e);
  }

  // Add and save
  customNames.push(normalized);
  customRecipesCache = customNames;

  try {
    await AsyncStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(customNames));
  } catch (e) {
    console.error('Error saving custom recipe name to AsyncStorage', e);
    throw e;
  }

  return normalized;
};
