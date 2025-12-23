import { create } from 'zustand';
import { GeneratedPage, Selections } from '../types';
import { api } from '../services/api';

interface PackState {
  // Weekly Pack 状态
  childName: string;
  age: string;
  theme: string;
  generatedPages: GeneratedPage[];
  packId: string | null;
  weekNumber: number | null;
  isGenerating: boolean;
  error: string | null;

  // Custom Pack 状态
  selections: Selections;
  totalPages: number;

  // Weekly Pack Actions
  setChildName: (name: string) => void;
  setAge: (age: string) => void;
  setTheme: (theme: string) => void;
  generateWeeklyPack: () => Promise<void>;

  // Custom Pack Actions
  setSelection: (pageTypeId: string, quantity: number) => void;
  clearSelections: () => void;
  generateCustomPack: () => Promise<void>;

  // 通用 Actions
  reset: () => void;
  clearError: () => void;
  setGeneratedPages: (pages: GeneratedPage[]) => void;
}

// 计算总页数
const calculateTotalPages = (selections: Selections): number => {
  return Object.values(selections).reduce((sum, count) => sum + count, 0);
};

export const usePackStore = create<PackState>((set, get) => ({
  // 初始状态
  childName: '',
  age: '',
  theme: '',
  generatedPages: [],
  packId: null,
  weekNumber: null,
  isGenerating: false,
  error: null,
  selections: {},
  totalPages: 0,

  // Weekly Pack Actions
  setChildName: (name: string) => {
    set({ childName: name });
  },

  setAge: (age: string) => {
    set({ age });
  },

  setTheme: (theme: string) => {
    set({ theme });
  },

  generateWeeklyPack: async () => {
    const { childName, age, theme } = get();

    // 验证输入
    if (!childName.trim()) {
      set({ error: '请输入孩子的名字' });
      return;
    }
    if (!age) {
      set({ error: '请选择年龄' });
      return;
    }
    if (!theme) {
      set({ error: '请选择主题' });
      return;
    }

    set({ isGenerating: true, error: null });

    try {
      const result = await api.generateWeeklyPack({
        childName: childName.trim(),
        age,
        theme,
      });

      set({
        generatedPages: result.pages,
        packId: result.packId,
        weekNumber: result.weekNumber,
        isGenerating: false,
      });
    } catch (error: any) {
      set({
        error: error.message || '生成失败，请重试',
        isGenerating: false,
      });
      throw error;
    }
  },

  // Custom Pack Actions
  setSelection: (pageTypeId: string, quantity: number) => {
    const { selections } = get();
    const newSelections = { ...selections };

    if (quantity <= 0) {
      delete newSelections[pageTypeId];
    } else {
      newSelections[pageTypeId] = quantity;
    }

    set({
      selections: newSelections,
      totalPages: calculateTotalPages(newSelections),
    });
  },

  clearSelections: () => {
    set({ selections: {}, totalPages: 0 });
  },

  generateCustomPack: async () => {
    const { theme, selections, totalPages } = get();

    // 验证输入
    if (!theme) {
      set({ error: '请选择主题' });
      return;
    }
    if (totalPages === 0) {
      set({ error: '请至少选择一个页面类型' });
      return;
    }

    set({ isGenerating: true, error: null });

    try {
      const result = await api.generateCustomPack({
        theme,
        selections,
      });

      set({
        generatedPages: result.pages,
        packId: result.packId,
        isGenerating: false,
      });
    } catch (error: any) {
      set({
        error: error.message || '生成失败，请重试',
        isGenerating: false,
      });
      throw error;
    }
  },

  // 通用 Actions
  reset: () => {
    set({
      childName: '',
      age: '',
      theme: '',
      generatedPages: [],
      packId: null,
      weekNumber: null,
      isGenerating: false,
      error: null,
      selections: {},
      totalPages: 0,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  setGeneratedPages: (pages: GeneratedPage[]) => {
    set({ generatedPages: pages });
  },
}));

export default usePackStore;
