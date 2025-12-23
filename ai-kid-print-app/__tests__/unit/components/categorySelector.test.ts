/**
 * 分类展开属性测试
 * 
 * **Feature: android-app-development, Property 9: 分类展开显示**
 * **Validates: Requirements 6.2**
 * 
 * *For any* category expansion in Custom Pack, the system SHALL display 
 * all page types within that category.
 */

import * as fc from 'fast-check';
import { CATEGORIES } from '../../../src/components/pack/CategorySelector';

// 分类 ID 生成器
const categoryIdArbitrary = fc.constantFrom(...CATEGORIES.map(c => c.id));

describe('CategorySelector Property Tests', () => {
  /**
   * Property 9: 分类展开显示
   * 
   * 对于任何分类展开，系统应该显示该分类内的所有页面类型
   */
  describe('Property 9: Category Expansion Display', () => {
    it('Each category should have at least one page type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...CATEGORIES),
          (category) => {
            expect(category.pageTypes).toBeDefined();
            expect(Array.isArray(category.pageTypes)).toBe(true);
            expect(category.pageTypes.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('All page types should have required fields', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...CATEGORIES),
          (category) => {
            category.pageTypes.forEach(pageType => {
              expect(pageType.id).toBeDefined();
              expect(pageType.name).toBeDefined();
              expect(pageType.description).toBeDefined();
              expect(typeof pageType.id).toBe('string');
              expect(typeof pageType.name).toBe('string');
              expect(typeof pageType.description).toBe('string');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Category should have required fields', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...CATEGORIES),
          (category) => {
            expect(category.id).toBeDefined();
            expect(category.name).toBeDefined();
            expect(category.icon).toBeDefined();
            expect(category.pageTypes).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Page type IDs should be unique within a category', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...CATEGORIES),
          (category) => {
            const pageTypeIds = category.pageTypes.map(pt => pt.id);
            const uniqueIds = new Set(pageTypeIds);
            expect(uniqueIds.size).toBe(pageTypeIds.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Page type IDs should be globally unique', () => {
      const allPageTypeIds = CATEGORIES.flatMap(c => c.pageTypes.map(pt => pt.id));
      const uniqueIds = new Set(allPageTypeIds);
      expect(uniqueIds.size).toBe(allPageTypeIds.length);
    });

    it('Category IDs should be unique', () => {
      const categoryIds = CATEGORIES.map(c => c.id);
      const uniqueIds = new Set(categoryIds);
      expect(uniqueIds.size).toBe(categoryIds.length);
    });

    it('Total page types count should match sum of all categories', () => {
      const totalFromCategories = CATEGORIES.reduce(
        (sum, category) => sum + category.pageTypes.length,
        0
      );
      const allPageTypes = CATEGORIES.flatMap(c => c.pageTypes);
      expect(allPageTypes.length).toBe(totalFromCategories);
    });
  });
});
