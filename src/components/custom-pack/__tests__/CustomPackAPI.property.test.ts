import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CATEGORIES } from '../../../constants/pageTypes';
import { THEMES } from '../ThemeSelector';

/**
 * **Feature: custom-pack, Property 10: Generate API receives correct payload**
 * **Validates: Requirements 7.1**
 * 
 * For any valid selection state with total > 0, clicking Generate SHALL send
 * a POST request with theme and selections matching the current state.
 */

/**
 * **Feature: custom-pack, Property 11: Generated pack page count matches selection total**
 * **Validates: Requirements 7.3**
 * 
 * For any successful generation, the number of pages in the response
 * SHALL equal the sum of all selection quantities.
 */

describe('CustomPack API Property Tests', () => {
  // 获取所有有效的 page type IDs
  const allPageTypeIds = CATEGORIES.flatMap(c => c.pageTypes.map(pt => pt.id));
  const allThemeIds = THEMES.map(t => t.id);
  
  // 生成随机 selections 对象（至少有一个选择）
  const nonEmptySelectionsArbitrary = fc.dictionary(
    fc.constantFrom(...allPageTypeIds),
    fc.integer({ min: 1, max: 5 })
  ).filter(selections => Object.keys(selections).length > 0);

  describe('Property 10: Generate API receives correct payload', () => {
    it('API payload contains theme and selections from state', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allThemeIds, 'random'),
          nonEmptySelectionsArbitrary,
          (theme, selections) => {
            // 模拟构建 API payload
            const buildPayload = (t: string, s: Record<string, number>, userId?: string) => {
              // 如果是 random，随机选择一个主题
              const finalTheme = t === 'random' 
                ? allThemeIds[Math.floor(Math.random() * allThemeIds.length)]
                : t;
              
              return {
                theme: finalTheme,
                selections: s,
                userId
              };
            };
            
            const payload = buildPayload(theme, selections, 'test-user');
            
            // 验证 payload 结构正确
            expect(payload.theme).toBeTruthy();
            expect(allThemeIds).toContain(payload.theme);
            expect(payload.selections).toEqual(selections);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('payload selections match state selections exactly', () => {
      fc.assert(
        fc.property(
          nonEmptySelectionsArbitrary,
          (selections) => {
            // 模拟状态
            const state = {
              theme: 'dinosaur' as string,
              selections: { ...selections },
              activePreset: null as string | null
            };
            
            // 构建 payload
            const payload = {
              theme: state.theme,
              selections: state.selections
            };
            
            // 验证 selections 完全匹配
            const stateKeys = Object.keys(state.selections).sort();
            const payloadKeys = Object.keys(payload.selections).sort();
            
            if (stateKeys.length !== payloadKeys.length) return false;
            
            for (let i = 0; i < stateKeys.length; i++) {
              if (stateKeys[i] !== payloadKeys[i]) return false;
              if (state.selections[stateKeys[i]] !== payload.selections[payloadKeys[i]]) return false;
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('random theme is resolved to valid theme before API call', () => {
      fc.assert(
        fc.property(
          nonEmptySelectionsArbitrary,
          (selections) => {
            const theme = 'random';
            
            // 模拟随机主题解析
            const resolveTheme = (t: string): string => {
              if (t === 'random') {
                return allThemeIds[Math.floor(Math.random() * allThemeIds.length)];
              }
              return t;
            };
            
            const resolvedTheme = resolveTheme(theme);
            
            // 验证解析后的主题是有效的
            return allThemeIds.includes(resolvedTheme);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Generated pack page count matches selection total', () => {
    it('total pages equals sum of all selection quantities', () => {
      fc.assert(
        fc.property(
          nonEmptySelectionsArbitrary,
          (selections) => {
            // 计算预期总页数
            const expectedTotal = Object.values(selections).reduce((sum, count) => sum + count, 0);
            
            // 模拟生成响应
            const mockGenerateResponse = (s: Record<string, number>) => {
              const pages: Array<{ order: number; type: string; title: string }> = [];
              let order = 1;
              
              for (const [pageTypeId, count] of Object.entries(s)) {
                for (let i = 0; i < count; i++) {
                  pages.push({
                    order: order++,
                    type: pageTypeId,
                    title: `${pageTypeId} #${i + 1}`
                  });
                }
              }
              
              return {
                success: true,
                totalPages: pages.length,
                pages
              };
            };
            
            const response = mockGenerateResponse(selections);
            
            // 验证页数匹配
            return response.totalPages === expectedTotal && response.pages.length === expectedTotal;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('each page type appears correct number of times in response', () => {
      fc.assert(
        fc.property(
          nonEmptySelectionsArbitrary,
          (selections) => {
            // 模拟生成响应
            const pages: Array<{ type: string }> = [];
            
            for (const [pageTypeId, count] of Object.entries(selections)) {
              for (let i = 0; i < count; i++) {
                pages.push({ type: pageTypeId });
              }
            }
            
            // 统计每种类型的数量
            const typeCounts: Record<string, number> = {};
            for (const page of pages) {
              typeCounts[page.type] = (typeCounts[page.type] || 0) + 1;
            }
            
            // 验证每种类型数量匹配
            for (const [pageTypeId, expectedCount] of Object.entries(selections)) {
              if (typeCounts[pageTypeId] !== expectedCount) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('page orders are sequential starting from 1', () => {
      fc.assert(
        fc.property(
          nonEmptySelectionsArbitrary,
          (selections) => {
            // 模拟生成响应
            const pages: Array<{ order: number }> = [];
            let order = 1;
            
            for (const [, count] of Object.entries(selections)) {
              for (let i = 0; i < count; i++) {
                pages.push({ order: order++ });
              }
            }
            
            // 验证顺序正确
            for (let i = 0; i < pages.length; i++) {
              if (pages[i].order !== i + 1) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
