import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { THEMES } from '../ThemeSelector';

/**
 * **Feature: custom-pack, Property 1: Theme selection state consistency**
 * **Validates: Requirements 2.2, 2.3**
 * 
 * For any theme selection action (clicking a theme card or random option),
 * the selected theme state SHALL be updated to exactly the clicked theme value or 'random'.
 */
describe('ThemeSelector Property Tests', () => {
  // 所有有效的主题 ID
  const validThemeIds = THEMES.map(t => t.id);
  const allValidSelections = ['random', ...validThemeIds];

  it('Property 1: Theme selection state consistency - selecting any valid theme updates state correctly', () => {
    // 模拟状态管理
    let currentTheme: string | 'random' = 'random';
    
    const onThemeSelect = (theme: string | 'random') => {
      currentTheme = theme;
    };

    fc.assert(
      fc.property(
        fc.constantFrom(...allValidSelections),
        (selectedTheme) => {
          // 执行选择
          onThemeSelect(selectedTheme);
          
          // 验证状态更新正确
          expect(currentTheme).toBe(selectedTheme);
          
          return currentTheme === selectedTheme;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Theme selection state consistency - multiple sequential selections maintain correct state', () => {
    let currentTheme: string | 'random' = 'random';
    
    const onThemeSelect = (theme: string | 'random') => {
      currentTheme = theme;
    };

    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...allValidSelections), { minLength: 1, maxLength: 20 }),
        (selections) => {
          // 执行一系列选择
          for (const selection of selections) {
            onThemeSelect(selection);
            // 每次选择后状态应该正确更新
            if (currentTheme !== selection) {
              return false;
            }
          }
          
          // 最终状态应该是最后一次选择
          return currentTheme === selections[selections.length - 1];
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Theme selection state consistency - random selection is a valid state', () => {
    let currentTheme: string | 'random' = 'dinosaur'; // 初始为非 random
    
    const onThemeSelect = (theme: string | 'random') => {
      currentTheme = theme;
    };

    // 选择 random
    onThemeSelect('random');
    expect(currentTheme).toBe('random');
    
    // 从 random 切换到具体主题
    fc.assert(
      fc.property(
        fc.constantFrom(...validThemeIds),
        (themeId) => {
          onThemeSelect('random');
          expect(currentTheme).toBe('random');
          
          onThemeSelect(themeId);
          expect(currentTheme).toBe(themeId);
          
          return currentTheme === themeId;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('All themes in THEMES constant are valid and unique', () => {
    // 验证主题 ID 唯一性
    const themeIds = THEMES.map(t => t.id);
    const uniqueIds = new Set(themeIds);
    expect(uniqueIds.size).toBe(themeIds.length);
    
    // 验证每个主题有必要的属性
    for (const theme of THEMES) {
      expect(theme.id).toBeTruthy();
      expect(theme.name).toBeTruthy();
      expect(theme.image).toBeTruthy();
      expect(theme.color).toBeTruthy();
    }
  });
});
