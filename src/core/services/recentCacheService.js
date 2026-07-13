import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_ITEMS = 5;

export const recentCacheService = {
  getRecentItems: async (key) => {
    try {
      const data = await AsyncStorage.getItem(`@edible_india_recent_${key}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error loading recent items:', e);
      return [];
    }
  },

  addRecentItem: async (key, item) => {
    if (!item || typeof item !== 'string' || item.trim() === '') return;
    try {
      const current = await recentCacheService.getRecentItems(key);
      const cleanItem = item.trim();
      
      // Remove any existing duplicate and prepend to top
      const filtered = current.filter(i => i.toLowerCase() !== cleanItem.toLowerCase());
      const updated = [cleanItem, ...filtered].slice(0, MAX_ITEMS);
      
      await AsyncStorage.setItem(`@edible_india_recent_${key}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving recent item:', e);
    }
  }
};

export default recentCacheService;
