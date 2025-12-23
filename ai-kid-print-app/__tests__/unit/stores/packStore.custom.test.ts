/**
 * Custom Pack 数量计算属性测试
 * 
 * **Feature: android-app-development, Property 10: 页面数量计算**
 * **Validates: Requirements 6.3**
 * 
 * *For any* quantity adjustment in Custom Pack, the total page count 
 * SHALL equal the sum of all selected quantities.
 */

import * as fc from 'fast-check';
import { usePackStore } from '../../../src/stores/packStore';

// Mock API
jest.mock('../../../src/services/api', () => ({
  api: {
    generateWeeklyPack: jest.fn(),
    generateCustomPack: jest.fn(),
  },
}));

// 页面类型 ID 生成器
const pageTypeIdArbitrary = fc.constantFrom(
  'coloring',
  'maze',
  'dotToDot',
  'tracing',
  'counting',
  'matching',
  'patterns',
  'shapes'
);

// 数量生成器 (0-10)
const quantityArbitrary = fc.integer({ min: 0, max: 10 });

// 选择记录生成器
const selectionsArbitrary = fc.dictionary(
  pageTypeIdArbitrary,
  fc.integer({ min: 1, max: 10 })
);

describe('Custom Pack Property Tests', () => {
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
   * Property 10: 页面数量计算
   * 
   * 对于任何数量调整，总页数应该等于所有选择数量的总和
   */
  describe('Property 10: Page Count Calculation', () => {
    it('Total pages should equal sum of all selections', () => {
      fc.assert(
        fc.property(
          selectionsArbitrary,
          (selections) => {
            // 设置选择
            Object.entries(selections).forEach(([pageTypeId, quantity]) => {
              usePackStore.getState().setSelection(pageTypeId, quantity);
            });

            const state = usePackStore.getState();
            
            // 计算预期总数
            const expectedTotal = Object.values(state.selections).reduce(
              (sum, count) => sum + count,
              0
            );

            // 验证总页数正确
            expect(state.totalPages).toBe(expectedTotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Setting quantity to 0 should remove the selection', () => {
      fc.assert(
        fc.property(
          pageTypeIdArbitrary,
          fc.integer({ min: 1, max: 10 }),
          (pageTypeId, initialQuantity) => {
            // 先设置一个数量
            usePackStore.getState().setSelection(pageTypeId, initialQuantity);
            expect(usePackStore.getState().selections[pageTypeId]).toBe(initialQuantity);

            // 设置为 0
            usePackStore.getState().setSelection(pageTypeId, 0);
            
            // 验证已被移除
            expect(usePackStore.getState().selections[pageTypeId]).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Updating quantity should update total correctly', () => {
      fc.assert(
        fc.property(
          pageTypeIdArbitrary,
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 10 }),
          (pageTypeId, quantity1, quantity2) => {
            // 先清除状态
            usePackStore.getState().clearSelections();
            
            // 设置初始数量
            usePackStore.getState().setSelection(pageTypeId, quantity1);
            expect(usePackStore.getState().totalPages).toBe(quantity1);

            // 更新数量
            usePackStore.getState().setSelection(pageTypeId, quantity2);
            expect(usePackStore.getState().totalPages).toBe(quantity2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('clearSelections should reset total to 0', () => {
      fc.assert(
        fc.property(
          selectionsArbitrary,
          (selections) => {
            // 设置一些选择
            Object.entries(selections).forEach(([pageTypeId, quantity]) => {
              usePackStore.getState().setSelection(pageTypeId, quantity);
            });

            // 清除所有选择
            usePackStore.getState().clearSelections();

            const state = usePackStore.getState();
            expect(state.selections).toEqual({});
            expect(state.totalPages).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Multiple selections should sum correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.tuple(pageTypeIdArbitrary, fc.integer({ min: 1, max: 5 })),
            { minLength: 1, maxLength: 5 }
          ),
          (selectionsArray) => {
            // 清除之前的选择
            usePackStore.getState().clearSelections();

            // 设置多个选择
            selectionsArray.forEach(([pageTypeId, quantity]) => {
              usePackStore.getState().setSelection(pageTypeId, quantity);
            });

            const state = usePackStore.getState();
            
            // 计算预期总数（注意：相同 pageTypeId 会被覆盖）
            const expectedTotal = Object.values(state.selections).reduce(
              (sum, count) => sum + count,
              0
            );

            expect(state.totalPages).toBe(expectedTotal);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
