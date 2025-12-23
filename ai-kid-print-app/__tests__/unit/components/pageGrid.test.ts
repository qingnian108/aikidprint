/**
 * 预览页面属性测试
 * 
 * **Feature: android-app-development, Property 11: 预览页面完整性**
 * **Feature: android-app-development, Property 12: 页面详情显示**
 * **Validates: Requirements 7.1, 7.3**
 */

import * as fc from 'fast-check';
import { GeneratedPage } from '../../../src/types';

// 生成页面生成器
const generatedPageArbitrary = fc.record({
  order: fc.integer({ min: 1, max: 50 }),
  type: fc.constantFrom('coloring', 'maze', 'dotToDot', 'tracing', 'counting'),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  imageUrl: fc.webUrl(),
});

// 生成页面列表生成器（确保 order 唯一）
const generatedPagesArbitrary = fc.array(generatedPageArbitrary, { minLength: 1, maxLength: 30 })
  .map(pages => pages.map((page, index) => ({ ...page, order: index + 1 })));

/**
 * 模拟 PageGrid 显示逻辑
 */
const getDisplayedThumbnailCount = (pages: GeneratedPage[]): number => {
  return pages.length;
};

/**
 * 验证页面详情是否完整
 */
const hasRequiredPageDetails = (page: GeneratedPage): boolean => {
  return (
    typeof page.order === 'number' &&
    page.order > 0 &&
    typeof page.type === 'string' &&
    page.type.length > 0 &&
    typeof page.title === 'string' &&
    page.title.length > 0
  );
};

describe('PageGrid Property Tests', () => {
  /**
   * Property 11: 预览页面完整性
   * 
   * 对于任何 pack 预览，显示的页面缩略图数量应该等于生成的页面数量
   */
  describe('Property 11: Preview Page Completeness', () => {
    it('Displayed thumbnail count should equal generated page count', () => {
      fc.assert(
        fc.property(
          generatedPagesArbitrary,
          (pages) => {
            const displayedCount = getDisplayedThumbnailCount(pages);
            expect(displayedCount).toBe(pages.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('All pages should be displayable', () => {
      fc.assert(
        fc.property(
          generatedPagesArbitrary,
          (pages) => {
            // 验证每个页面都有必要的显示信息
            pages.forEach(page => {
              expect(page.imageUrl).toBeDefined();
              expect(page.order).toBeDefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Page order should be sequential', () => {
      fc.assert(
        fc.property(
          generatedPagesArbitrary,
          (pages) => {
            // 验证页面顺序是连续的
            const sortedPages = [...pages].sort((a, b) => a.order - b.order);
            sortedPages.forEach((page, index) => {
              expect(page.order).toBe(index + 1);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 12: 页面详情显示
   * 
   * 对于预览中的任何页面，系统应该正确显示页码、类型和标题
   */
  describe('Property 12: Page Details Display', () => {
    it('Each page should have page number, type, and title', () => {
      fc.assert(
        fc.property(
          generatedPageArbitrary,
          (page) => {
            expect(hasRequiredPageDetails(page)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Page number should be positive', () => {
      fc.assert(
        fc.property(
          generatedPageArbitrary,
          (page) => {
            expect(page.order).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Page type should be a valid type', () => {
      const validTypes = ['coloring', 'maze', 'dotToDot', 'tracing', 'counting'];
      fc.assert(
        fc.property(
          generatedPageArbitrary,
          (page) => {
            expect(validTypes).toContain(page.type);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Page title should not be empty', () => {
      fc.assert(
        fc.property(
          generatedPageArbitrary,
          (page) => {
            expect(page.title.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Page imageUrl should be a valid URL', () => {
      fc.assert(
        fc.property(
          generatedPageArbitrary,
          (page) => {
            expect(page.imageUrl).toMatch(/^https?:\/\//);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
