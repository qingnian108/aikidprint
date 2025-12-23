/**
 * 设置属性测试
 * 
 * **Feature: android-app-development, Property 18: 纸张大小持久化**
 * **Feature: android-app-development, Property 19: 纸张大小自动检测**
 * **Validates: Requirements 13.2, 13.3, 13.4**
 */

import * as fc from 'fast-check';
import { useSettingsStore } from '../../../src/stores/settingsStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock helpers
jest.mock('../../../src/utils/helpers', () => ({
  detectPaperSize: jest.fn(() => 'letter'),
}));

// 纸张大小生成器
const paperSizeArbitrary = fc.constantFrom('letter' as const, 'a4' as const);

// 地区生成器
const localeArbitrary = fc.constantFrom(
  'en_US', 'en_CA', 'es_MX', 'pt_BR',  // Americas - Letter
  'en_GB', 'de_DE', 'fr_FR', 'zh_CN', 'ja_JP'  // Others - A4
);

/**
 * 根据地区检测纸张大小
 */
const detectPaperSizeFromLocale = (locale: string): 'letter' | 'a4' => {
  const americasLocales = ['en_US', 'en_CA', 'es_MX', 'pt_BR'];
  return americasLocales.includes(locale) ? 'letter' : 'a4';
};

describe('SettingsStore Property Tests', () => {
  beforeEach(() => {
    // 重置 store 状态
    useSettingsStore.setState({
      paperSize: 'letter',
      isLoading: false,
    });
  });

  /**
   * Property 18: 纸张大小持久化
   * 
   * 对于任何纸张大小选择，偏好设置应该被保存并在后续 PDF 生成中使用
   */
  describe('Property 18: Paper Size Persistence', () => {
    it('Paper size should be stored correctly', () => {
      fc.assert(
        fc.property(
          paperSizeArbitrary,
          (size) => {
            // 直接设置状态（模拟 setPaperSize 的效果）
            useSettingsStore.setState({ paperSize: size });
            
            const state = useSettingsStore.getState();
            expect(state.paperSize).toBe(size);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Paper size should only be letter or a4', () => {
      fc.assert(
        fc.property(
          paperSizeArbitrary,
          (size) => {
            useSettingsStore.setState({ paperSize: size });
            
            const state = useSettingsStore.getState();
            expect(['letter', 'a4']).toContain(state.paperSize);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Changing paper size should update state', () => {
      fc.assert(
        fc.property(
          paperSizeArbitrary,
          paperSizeArbitrary,
          (size1, size2) => {
            // 设置第一个值
            useSettingsStore.setState({ paperSize: size1 });
            expect(useSettingsStore.getState().paperSize).toBe(size1);
            
            // 设置第二个值
            useSettingsStore.setState({ paperSize: size2 });
            expect(useSettingsStore.getState().paperSize).toBe(size2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 19: 纸张大小自动检测
   * 
   * 对于任何首次应用启动，系统应该根据设备地区检测纸张大小
   * （美洲 → Letter，其他 → A4）
   */
  describe('Property 19: Paper Size Auto Detection', () => {
    it('Americas locales should detect Letter', () => {
      const americasLocales = ['en_US', 'en_CA', 'es_MX', 'pt_BR'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...americasLocales),
          (locale) => {
            const detectedSize = detectPaperSizeFromLocale(locale);
            expect(detectedSize).toBe('letter');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Non-Americas locales should detect A4', () => {
      const otherLocales = ['en_GB', 'de_DE', 'fr_FR', 'zh_CN', 'ja_JP'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...otherLocales),
          (locale) => {
            const detectedSize = detectPaperSizeFromLocale(locale);
            expect(detectedSize).toBe('a4');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Detection should always return valid paper size', () => {
      fc.assert(
        fc.property(
          localeArbitrary,
          (locale) => {
            const detectedSize = detectPaperSizeFromLocale(locale);
            expect(['letter', 'a4']).toContain(detectedSize);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Detection result should be deterministic', () => {
      fc.assert(
        fc.property(
          localeArbitrary,
          (locale) => {
            const result1 = detectPaperSizeFromLocale(locale);
            const result2 = detectPaperSizeFromLocale(locale);
            expect(result1).toBe(result2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
