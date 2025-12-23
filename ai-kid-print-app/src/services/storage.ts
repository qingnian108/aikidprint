/**
 * 本地存储服务
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: '@auth/token',
  USER_DATA: '@auth/user',
  SETTINGS: '@settings',
  ONBOARDING_COMPLETE: '@app/onboarding',
};

export const storageService = {
  // Auth
  setAuthToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  },

  getAuthToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  },

  removeAuthToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  },

  // User Data
  setUserData: async (data: object): Promise<void> => {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(data));
  },

  getUserData: async <T>(): Promise<T | null> => {
    const json = await AsyncStorage.getItem(KEYS.USER_DATA);
    return json ? JSON.parse(json) : null;
  },

  removeUserData: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.USER_DATA);
  },

  // Settings
  setSetting: async (key: string, value: any): Promise<void> => {
    const settings = await storageService.getSettings();
    settings[key] = value;
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSetting: async <T>(key: string, defaultValue: T): Promise<T> => {
    const settings = await storageService.getSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },

  getSettings: async (): Promise<Record<string, any>> => {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    return json ? JSON.parse(json) : {};
  },

  // Onboarding
  setOnboardingComplete: async (): Promise<void> => {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
  },

  isOnboardingComplete: async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  },

  // Clear all
  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};

export default storageService;
