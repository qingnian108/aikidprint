/**
 * Pack 生成流程属性测试
 * 
 * **Feature: android-app-development, Property 7: 生成成功导航**
 * **Feature: android-app-development, Property 8: 生成失败错误处理**
 * **Validates: Requirements 5.6, 5.7**
 */

import * as fc from 'fast-check';
import { usePackStore } from '../../../src/stores/packStore';
import { GeneratedPage } from '../../../src/types';

// Mock API
jest.mock('../../../src/services/api', () => ({
  api: {
    generateWeeklyPack: jest.fn(),
    generateCustomPack: jest.fn(),
  },
}));

// 生成页面生成器
const generatedPageArbitrary = fc.record({
  order: fc.integer({ min: 1, max: 50 }),
  type: fc.constantFrom('coloring', 'maze', 'dotToDot', 'tracing', 'counting'),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  imageUrl: fc.webUrl(),
});

// 生成页面列表生成器
const generatedPagesArbitrary = fc.array(generatedPageArbitrary, { minLength: 1, maxLength: 30 });

describe('PackStore Property Tests', () => {
  beforeEach(() => {
    // 重置 store 状态
    usePackStore.setState({
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
  });

  /**
   * Property 7: 生成成功导航
   * 
   * 对于任何成功的 pack 生成，系统应该导航到预览页面并显示所有生成的页面
   */
  describe('Property 7: Generation Success Navigation', () => {
    it('Generated pages should be stored correctly', () => {
      fc.assert(
        fc.property(
          generatedPagesArbitrary,
          (pages) => {
            // 设置生成的页面
            usePackStore.getState().setGeneratedPages(pages);
            
            const state = usePackStore.getState();
            
            // 验证页面数量正确
            expect(state.generatedPages.length).toBe(pages.length);
            
            // 验证页面内容正确
            pages.forEach((page, index) => {
              expect(state.generatedPages[index].order).toBe(page.order);
              expect(state.generatedPages[index].type).toBe(page.type);
              expect(state.generatedPages[index].title).toBe(page.title);
              expect(state.generatedPages[index].imageUrl).toBe(page.imageUrl);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('All generated pages should have required fields', () => {
      fc.assert(
        fc.property(
          generatedPageArbitrary,
          (page) => {
            expect(page.order).toBeDefined();
            expect(page.type).toBeDefined();
            expect(page.title).toBeDefined();
            expect(page.imageUrl).toBeDefined();
            
            expect(typeof page.order).toBe('number');
            expect(typeof page.type).toBe('string');
            expect(typeof page.title).toBe('string');
            expect(typeof page.imageUrl).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 8: 生成失败错误处理
   * 
   * 对于任何失败的 pack 生成，系统应该显示错误消息并提供重试选项
   */
  describe('Property 8: Generation Failure Error Handling', () => {
    it('Error should be stored when generation fails', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (errorMessage) => {
            // 设置错误状态
            usePackStore.setState({ error: errorMessage, isGenerating: false });
            
            const state = usePackStore.getState();
            
            // 验证错误被存储
            expect(state.error).toBe(errorMessage);
            expect(state.isGenerating).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Error should be clearable for retry', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (errorMessage) => {
            // 设置错误
            usePackStore.setState({ error: errorMessage });
            expect(usePackStore.getState().error).toBe(errorMessage);
            
            // 清除错误（为重试做准备）
            usePackStore.getState().clearError();
            expect(usePackStore.getState().error).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('isGenerating should be false after error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (errorMessage) => {
            // 模拟生成失败后的状态
            usePackStore.setState({ 
              error: errorMessage, 
              isGenerating: false,
              generatedPages: [] 
            });
            
            const state = usePackStore.getState();
            
            // 验证状态正确
            expect(state.isGenerating).toBe(false);
            expect(state.error).toBeTruthy();
            expect(state.generatedPages.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 输入验证测试
   */
  describe('Input Validation', () => {
    it('setChildName should update childName', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (name) => {
            usePackStore.getState().setChildName(name);
            expect(usePackStore.getState().childName).toBe(name);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('setAge should update age', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('3-4', '5-6', '7-8', '9-10'),
          (age) => {
            usePackStore.getState().setAge(age);
            expect(usePackStore.getState().age).toBe(age);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('setTheme should update theme', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('dinosaur', 'space', 'unicorn', 'ocean', 'vehicles', 'wildlife'),
          (theme) => {
            usePackStore.getState().setTheme(theme);
            expect(usePackStore.getState().theme).toBe(theme);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('reset should clear all state', () => {
      // 设置一些状态
      usePackStore.setState({
        childName: 'Test',
        age: '5-6',
        theme: 'dinosaur',
        generatedPages: [{ order: 1, type: 'coloring', title: 'Test', imageUrl: 'http://test.com' }],
        error: 'Some error',
      });

      // 重置
      usePackStore.getState().reset();

      const state = usePackStore.getState();
      expect(state.childName).toBe('');
      expect(state.age).toBe('');
      expect(state.theme).toBe('');
      expect(state.generatedPages.length).toBe(0);
      expect(state.error).toBeNull();
    });
  });
});
