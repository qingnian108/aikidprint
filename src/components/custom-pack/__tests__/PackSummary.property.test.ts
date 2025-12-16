import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CATEGORIES } from '../../../constants/pageTypes';
import { calculateTotalPages, calculateCategoryCounts } from '../PackSummary';

/**
 * **Feature: custom-pack, Property 6: Total count equals sum of selections**
 * **Validates: Requirements 5.1**
 * 
 * For any selection state, the displayed total page count SHALL equal
 * the sum of all values in the selections record.
 */

/**
 * **Feature: custom-pack, Property 7: Category counts are correctly aggregated**
 * **Validates: Requirements 5.2**
 * 
 * For any selection state, the count displayed for each category SHALL equal
 * the sum of quantities for all page types belonging to that category.
 */

describe('PackSummary Property Tests', () => {
  // 获取所有 page type IDs
  const allPageTypeIds = CATEGORIES.flatMap(c => c.pageTypes.map(pt => pt.id));
  
  // 生成随机 selections 对象
  const selectionsArbitrary = fc.dictionary(
    fc.constantFrom(...allPageTypeIds),
    fc.integer({ min: 0, max: 10 })
  );

  describe('Property 6: Total count equals sum of selections', () => {
    it('total count equals sum of all selection values', () => {
      fc.assert(
        fc.property(
          selectionsArbitrary,
          (selections) => {
            const total = calculateTotalPages(selections);
            const expectedTotal = Object.values(selections).reduce((sum, count) => sum + count, 0);
            return total === expectedTotal;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('empty selections returns 0', () => {
      const total = calculateTotalPages({});
      expect(total).toBe(0);
    });

    it('single selection returns that value', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allPageTypeIds),
          fc.integer({ min: 0, max: 10 }),
          (pageTypeId, count) => {
            const selections = { [pageTypeId]: count };
            const total = calculateTotalPages(selections);
            return total === count;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('total is non-negative for any valid selections', () => {
      fc.assert(
        fc.property(
          selectionsArbitrary,
          (selections) => {
            const total = calculateTotalPages(selections);
            return total >= 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Category counts are correctly aggregated', () => {
    it('category count equals sum of its page type quantities', () => {
      fc.assert(
        fc.property(
          selectionsArbitrary,
          (selections) => {
            const categoryCounts = calculateCategoryCounts(selections, CATEGORIES);
            
            for (const category of CATEGORIES) {
              const expectedCount = category.pageTypes.reduce(
                (sum, pt) => sum + (selections[pt.id] || 0),
                0
              );
              
              if (categoryCounts[category.id] !== expectedCount) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('sum of category counts equals total count', () => {
      fc.assert(
        fc.property(
          selectionsArbitrary,
          (selections) => {
            const total = calculateTotalPages(selections);
            const categoryCounts = calculateCategoryCounts(selections, CATEGORIES);
            const categorySum = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
            
            return total === categorySum;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('empty selections returns 0 for all categories', () => {
      const categoryCounts = calculateCategoryCounts({}, CATEGORIES);
      
      for (const category of CATEGORIES) {
        expect(categoryCounts[category.id]).toBe(0);
      }
    });

    it('selection in one category only affects that category count', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...CATEGORIES),
          fc.integer({ min: 0, max: CATEGORIES[0].pageTypes.length - 1 }),
          fc.integer({ min: 1, max: 10 }),
          (category, pageTypeIndex, count) => {
            // 确保索引有效
            if (pageTypeIndex >= category.pageTypes.length) return true;
            
            const pageTypeId = category.pageTypes[pageTypeIndex].id;
            const selections = { [pageTypeId]: count };
            const categoryCounts = calculateCategoryCounts(selections, CATEGORIES);
            
            // 只有选中的分类应该有计数
            for (const cat of CATEGORIES) {
              if (cat.id === category.id) {
                if (categoryCounts[cat.id] !== count) return false;
              } else {
                if (categoryCounts[cat.id] !== 0) return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all category counts are non-negative', () => {
      fc.assert(
        fc.property(
          selectionsArbitrary,
          (selections) => {
            const categoryCounts = calculateCategoryCounts(selections, CATEGORIES);
            
            for (const count of Object.values(categoryCounts)) {
              if (count < 0) return false;
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
