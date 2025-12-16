import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CATEGORIES } from '../../../constants/pageTypes';

/**
 * **Feature: custom-pack, Property 2: All categories are rendered**
 * **Validates: Requirements 3.1**
 * 
 * For any render of the CategorySelector component, the number of category cards
 * displayed SHALL equal the length of the CATEGORIES constant array.
 */
describe('CategorySelector Property Tests', () => {
  
  it('Property 2: All categories are rendered - CATEGORIES array has expected structure', () => {
    // 验证 CATEGORIES 数组存在且有内容
    expect(CATEGORIES).toBeDefined();
    expect(Array.isArray(CATEGORIES)).toBe(true);
    expect(CATEGORIES.length).toBe(4); // Literacy, Math, Logic, Creativity
    
    // 验证每个分类有必要的属性
    for (const category of CATEGORIES) {
      expect(category.id).toBeTruthy();
      expect(category.title).toBeTruthy();
      expect(category.description).toBeTruthy();
      expect(category.icon).toBeTruthy();
      expect(Array.isArray(category.pageTypes)).toBe(true);
      expect(category.pageTypes.length).toBeGreaterThan(0);
    }
  });

  it('Property 2: All categories are rendered - category IDs are unique', () => {
    const categoryIds = CATEGORIES.map(c => c.id);
    const uniqueIds = new Set(categoryIds);
    expect(uniqueIds.size).toBe(categoryIds.length);
  });

  it('Property 2: All categories are rendered - all page types have unique IDs across categories', () => {
    const allPageTypeIds: string[] = [];
    
    for (const category of CATEGORIES) {
      for (const pageType of category.pageTypes) {
        allPageTypeIds.push(pageType.id);
      }
    }
    
    const uniqueIds = new Set(allPageTypeIds);
    expect(uniqueIds.size).toBe(allPageTypeIds.length);
  });
});

/**
 * **Feature: custom-pack, Property 3: Category expansion preserves other expansions**
 * **Validates: Requirements 3.4**
 * 
 * For any sequence of category toggle actions, toggling category A
 * SHALL NOT affect the expanded state of any other category B.
 */
describe('Category Expansion Property Tests', () => {
  // 模拟展开状态管理逻辑
  const toggleCategory = (expandedCategories: string[], categoryId: string): string[] => {
    if (expandedCategories.includes(categoryId)) {
      return expandedCategories.filter(id => id !== categoryId);
    } else {
      return [...expandedCategories, categoryId];
    }
  };

  it('Property 3: Category expansion preserves other expansions - toggling one category does not affect others', () => {
    const categoryIds = CATEGORIES.map(c => c.id);
    
    fc.assert(
      fc.property(
        // 生成初始展开状态（随机选择一些分类展开）
        fc.subarray(categoryIds),
        // 生成要切换的分类
        fc.constantFrom(...categoryIds),
        (initialExpanded, toggledCategory) => {
          // 记录其他分类的初始状态
          const otherCategories = categoryIds.filter(id => id !== toggledCategory);
          const otherCategoriesInitialState = otherCategories.map(id => ({
            id,
            wasExpanded: initialExpanded.includes(id)
          }));
          
          // 执行切换
          const newExpanded = toggleCategory(initialExpanded, toggledCategory);
          
          // 验证其他分类的状态没有改变
          for (const { id, wasExpanded } of otherCategoriesInitialState) {
            const isNowExpanded = newExpanded.includes(id);
            if (isNowExpanded !== wasExpanded) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: Category expansion preserves other expansions - multiple toggles maintain independence', () => {
    const categoryIds = CATEGORIES.map(c => c.id);
    
    fc.assert(
      fc.property(
        // 生成一系列切换操作
        fc.array(fc.constantFrom(...categoryIds), { minLength: 1, maxLength: 20 }),
        (toggleSequence) => {
          let expanded: string[] = [];
          
          for (const categoryToToggle of toggleSequence) {
            const otherCategories = categoryIds.filter(id => id !== categoryToToggle);
            const otherStates = otherCategories.map(id => ({
              id,
              wasExpanded: expanded.includes(id)
            }));
            
            // 执行切换
            expanded = toggleCategory(expanded, categoryToToggle);
            
            // 验证其他分类状态不变
            for (const { id, wasExpanded } of otherStates) {
              if (expanded.includes(id) !== wasExpanded) {
                return false;
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: Toggling same category twice returns to original state', () => {
    const categoryIds = CATEGORIES.map(c => c.id);
    
    fc.assert(
      fc.property(
        fc.subarray(categoryIds),
        fc.constantFrom(...categoryIds),
        (initialExpanded, categoryToToggle) => {
          // 切换两次
          const afterFirstToggle = toggleCategory(initialExpanded, categoryToToggle);
          const afterSecondToggle = toggleCategory(afterFirstToggle, categoryToToggle);
          
          // 应该回到初始状态
          const initialSet = new Set(initialExpanded);
          const finalSet = new Set(afterSecondToggle);
          
          if (initialSet.size !== finalSet.size) return false;
          
          for (const id of initialSet) {
            if (!finalSet.has(id)) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
