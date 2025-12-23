import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectPaperSize } from '../utils/helpers';

const PAPER_SIZE_KEY = '@settings/paperSize';

interface SettingsState {
  paperSize: 'letter' | 'a4';
  isLoading: boolean;
  
  // Actions
  setPaperSize: (size: 'letter' | 'a4') => Promise<void>;
  detectPaperSize: () => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  paperSize: 'letter',
  isLoading: true,

  setPaperSize: async (size: 'letter' | 'a4') => {
    try {
      await AsyncStorage.setItem(PAPER_SIZE_KEY, size);
      set({ paperSize: size });
    } catch (error) {
      console.error('Failed to save paper size:', error);
    }
  },

  detectPaperSize: () => {
    const detectedSize = detectPaperSize();
    set({ paperSize: detectedSize });
  },

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const savedSize = await AsyncStorage.getItem(PAPER_SIZE_KEY);
      if (savedSize === 'letter' || savedSize === 'a4') {
        set({ paperSize: savedSize, isLoading: false });
      } else {
        // 首次启动，自动检测
        const detectedSize = detectPaperSize();
        await AsyncStorage.setItem(PAPER_SIZE_KEY, detectedSize);
        set({ paperSize: detectedSize, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // 出错时使用自动检测
      const detectedSize = detectPaperSize();
      set({ paperSize: detectedSize, isLoading: false });
    }
  },
}));

export default useSettingsStore;
