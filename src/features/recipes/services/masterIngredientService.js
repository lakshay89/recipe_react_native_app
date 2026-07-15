import AsyncStorage from '@react-native-async-storage/async-storage';
import { INGREDIENTS } from '../../../core/data/ingredientsData';

const CUSTOM_INGREDIENTS_KEY = '@edible_india_custom_ingredients';

// In-memory cache to prevent constant AsyncStorage reads and re-merging
let cachedMergedIngredients = null;
let customIngredientsCache = null;

/**
 * Normalizes an ingredient name:
 * - Trims leading/trailing spaces
 * - Collapses repeated spaces to a single space
 * - Capitalizes each word nicely
 * - Returns empty string if it contains only symbols/numbers
 */
export const normalizeIngredientName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  // Collapse spaces and trim
  let normalized = name.replace(/\s+/g, ' ').trim();
  
  // Ensure it contains at least one letter character
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
 * Loads custom ingredients from AsyncStorage and merges them with the master dataset.
 * Removes duplicate entries based on normalized names.
 * Caches in-memory to keep searches fast.
 */
export const getAllIngredients = async (forceRefresh = false) => {
  if (cachedMergedIngredients !== null && !forceRefresh) {
    return cachedMergedIngredients;
  }

  let customIngredients = [];
  try {
    if (customIngredientsCache !== null && !forceRefresh) {
      customIngredients = customIngredientsCache;
    } else {
      const stored = await AsyncStorage.getItem(CUSTOM_INGREDIENTS_KEY);
      if (stored) {
        customIngredients = JSON.parse(stored);
        if (Array.isArray(customIngredients)) {
          customIngredientsCache = customIngredients;
        } else {
          customIngredients = [];
        }
      }
    }
  } catch (error) {
    console.error('Failed to load custom ingredients from AsyncStorage', error);
  }

  const uniqueIngredientsMap = new Map();

  // Load master ingredients
  INGREDIENTS.forEach((item) => {
    const normalized = normalizeIngredientName(item.name);
    if (normalized && !uniqueIngredientsMap.has(normalized)) {
      uniqueIngredientsMap.set(normalized, {
        id: item.id,
        name: item.name,
        category: item.category,
        aliases: item.aliases || [],
        recommendedUnits: item.recommendedUnits || ['Gram (g)', 'Piece']
      });
    }
  });

  // Load custom ingredients, overriding or adding
  customIngredients.forEach((item) => {
    const normalized = normalizeIngredientName(item.name);
    if (normalized && !uniqueIngredientsMap.has(normalized)) {
      uniqueIngredientsMap.set(normalized, {
        id: item.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: item.name,
        category: item.category || 'Other',
        aliases: item.aliases || [],
        recommendedUnits: item.recommendedUnits || ['Gram (g)', 'Piece']
      });
    }
  });

  cachedMergedIngredients = Array.from(uniqueIngredientsMap.values());
  return cachedMergedIngredients;
};

/**
 * Searches and filters ingredients based on case-insensitive query.
 * Sorted alphabetically.
 */
export const searchIngredients = async (query) => {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const allIngredients = await getAllIngredients();

  const filtered = allIngredients.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
    const aliasMatch = item.aliases && item.aliases.some((alias) =>
      alias.toLowerCase().includes(normalizedQuery)
    );
    const categoryMatch = item.category && item.category.toLowerCase().includes(normalizedQuery);
    return nameMatch || aliasMatch || categoryMatch;
  });

  // Return alphabetically sorted list
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Checks if an ingredient exists (case-insensitively).
 */
export const ingredientExists = async (name) => {
  const normalizedNew = normalizeIngredientName(name);
  if (!normalizedNew) return false;

  const allIngredients = await getAllIngredients();
  return allIngredients.some(
    (item) => normalizeIngredientName(item.name) === normalizedNew
  );
};

/**
 * Saves a new custom ingredient to AsyncStorage if it does not already exist.
 */
export const addCustomIngredient = async (name, category = 'Other') => {
  const normalizedName = normalizeIngredientName(name);
  if (!normalizedName) {
    throw new Error('Invalid ingredient name.');
  }

  const allIngredients = await getAllIngredients();
  const existing = allIngredients.find(
    (item) => normalizeIngredientName(item.name) === normalizedName
  );

  if (existing) {
    return existing; // Already exists, reuse the existing entry
  }

  const id = `custom-${normalizeIngredientName(name).toLowerCase().replace(/\s+/g, '-')}`;
  const newIngredient = {
    id,
    name: normalizedName,
    category: category || 'Other',
    aliases: [],
    recommendedUnits: ['Gram (g)', 'Piece', 'Cup']
  };

  // Load custom list
  let customIngredients = [];
  try {
    const stored = await AsyncStorage.getItem(CUSTOM_INGREDIENTS_KEY);
    if (stored) {
      customIngredients = JSON.parse(stored);
      if (!Array.isArray(customIngredients)) {
        customIngredients = [];
      }
    }
  } catch (e) {
    console.error('Error loading custom ingredients to append', e);
  }

  customIngredients.push(newIngredient);
  customIngredientsCache = customIngredients;
  cachedMergedIngredients = null; // Invalidate cache to force merge on next read

  try {
    await AsyncStorage.setItem(CUSTOM_INGREDIENTS_KEY, JSON.stringify(customIngredients));
  } catch (e) {
    console.error('Error saving custom ingredient to AsyncStorage', e);
    throw e;
  }

  // Force cache refresh
  await getAllIngredients(true);

  return newIngredient;
};
