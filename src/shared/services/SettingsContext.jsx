import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext({});

const STORAGE_KEYS = {
  LANGUAGE: '@edible_india_settings_language',
  NOTIFICATIONS: '@edible_india_settings_notifications',
  OFFLINE_MODE: '@edible_india_settings_offline_mode',
  FILE_LIMIT: '@edible_india_settings_file_limit',
  DARK_MODE: '@edible_india_settings_dark_mode',
};

const DEFAULT_SETTINGS = {
  language: 'English',
  notificationPreferences: {
    recipeApproved: true,
    recipeRejected: true,
    reviewerFeedback: true,
    newCollection: true,
    appAnnouncements: false,
  },
  offlineMode: false,
  offlineFileLimit: '500 MB',
  darkModePreference: false,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [
          storedLang,
          storedNotifs,
          storedOffline,
          storedLimit,
          storedDark,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.FILE_LIMIT),
          AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE),
        ]);

        setSettings({
          language: storedLang || DEFAULT_SETTINGS.language,
          notificationPreferences: storedNotifs
            ? JSON.parse(storedNotifs)
            : DEFAULT_SETTINGS.notificationPreferences,
          offlineMode: storedOffline === 'true',
          offlineFileLimit: storedLimit || DEFAULT_SETTINGS.offlineFileLimit,
          darkModePreference: storedDark === 'true',
        });
      } catch (error) {
        console.error('Error loading settings from storage:', error);
      } finally {
        setIsSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = async (key, value) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);

      switch (key) {
        case 'language':
          await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, value);
          break;
        case 'notificationPreferences':
          await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(value));
          break;
        case 'offlineMode':
          await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, String(value));
          break;
        case 'offlineFileLimit':
          await AsyncStorage.setItem(STORAGE_KEYS.FILE_LIMIT, value);
          break;
        case 'darkModePreference':
          await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, String(value));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_MODE),
        AsyncStorage.removeItem(STORAGE_KEYS.FILE_LIMIT),
        AsyncStorage.removeItem(STORAGE_KEYS.DARK_MODE),
      ]);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isSettingsLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
