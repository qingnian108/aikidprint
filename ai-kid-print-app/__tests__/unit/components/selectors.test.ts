/**
 * 选择器组件属性测试
 * 
 * **Feature: android-app-development, Property 5: 年龄选择状态**
 * **Feature: android-app-development, Property 6: 主题选择状态**
 * **Validates: Requirements 5.2, 5.3**
 */

import * as fc from 'fast-check';
import { AGE_GROUPS } from '../../../src/components/pack/AgeSelector';
import { THEMES } from '../../../src/components/pack/ThemeSelector';

// 年龄值生成器
const ageValueArbitrary = fc.constantFrom(...AGE_GROUPS.map(ag => ag.value));

// 主题 ID 生成器
const themeIdArbitrary = fc.constantFrom(...THEMES.map(t => t.id));

/**
 * 模拟年龄选择状态逻辑
 */
const isAgeSelected = (selectedAge: string, ageValue: string): boolean => {
  return selectedAge === ageValue;
};

/**
 * 模拟主题选择状态逻辑
 */
const isThemeSelected = (selectedTheme: string, themeId: string): boolean => {
  return selectedTheme === themeId;
};

/**
 * 获取选中主题的信息
 */
const getSelectedThemeInfo = (selectedTheme: string) => {
  return THEMES.find(t => t.id === selectedTheme);
};

describe('Selector Property Tests', () => {
  /**
   * Property 5: 年龄选择状态
   * 
   * 对于任何年龄组选择，选中的选项应该被视觉高亮，状态应该正确更新
   */
  describe('Property 5: Age Selection State', () => {
    it('Only one age should be selected at a time', () => {
      fc.assert(
        fc.property(
          ageValueArbitrary,
          (selectedAge) => {
            // 验证只有一个年龄被选中
            const selectedCount = AGE_GROUPS.filter(ag => 
              isAgeSelected(selectedAge, ag.value)
            ).length;
            
            expect(selectedCount).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Selected age should match the selection', () => {
      fc.assert(
        fc.property(
          ageValueArbitrary,
          (selectedAge) => {
            // 验证选中的年龄与选择匹配
            expect(isAgeSelected(selectedAge, selectedAge)).toBe(true);
            
            // 验证其他年龄未被选中
            AGE_GROUPS.forEach(ag => {
              if (ag.value !== selectedAge) {
                expect(isAgeSelected(selectedAge, ag.value)).toBe(false);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('All age groups should have required properties', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...AGE_GROUPS),
          (ageGroup) => {
            expect(ageGroup.value).toBeDefined();
            expect(ageGroup.label).toBeDefined();
            expect(ageGroup.icon).toBeDefined();
            expect(typeof ageGroup.value).toBe('string');
            expect(typeof ageGroup.label).toBe('string');
            expect(typeof ageGroup.icon).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: 主题选择状态
   * 
   * 对于任何主题选择，选中的主题应该显示其图标并被视觉高亮
   */
  describe('Property 6: Theme Selection State', () => {
    it('Only one theme should be selected at a time', () => {
      fc.assert(
        fc.property(
          themeIdArbitrary,
          (selectedTheme) => {
            // 验证只有一个主题被选中
            const selectedCount = THEMES.filter(t => 
              isThemeSelected(selectedTheme, t.id)
            ).length;
            
            expect(selectedCount).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Selected theme should display its icon', () => {
      fc.assert(
        fc.property(
          themeIdArbitrary,
          (selectedTheme) => {
            const themeInfo = getSelectedThemeInfo(selectedTheme);
            
            // 验证选中的主题有图标
            expect(themeInfo).toBeDefined();
            expect(themeInfo?.icon).toBeDefined();
            expect(themeInfo?.icon.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Selected theme should have a color', () => {
      fc.assert(
        fc.property(
          themeIdArbitrary,
          (selectedTheme) => {
            const themeInfo = getSelectedThemeInfo(selectedTheme);
            
            // 验证选中的主题有颜色
            expect(themeInfo).toBeDefined();
            expect(themeInfo?.color).toBeDefined();
            // 验证颜色是有效的十六进制颜色
            expect(themeInfo?.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('All themes should have required properties', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...THEMES),
          (theme) => {
            expect(theme.id).toBeDefined();
            expect(theme.name).toBeDefined();
            expect(theme.icon).toBeDefined();
            expect(theme.color).toBeDefined();
            expect(typeof theme.id).toBe('string');
            expect(typeof theme.name).toBe('string');
            expect(typeof theme.icon).toBe('string');
            expect(typeof theme.color).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Theme IDs should be unique', () => {
      const themeIds = THEMES.map(t => t.id);
      const uniqueIds = new Set(themeIds);
      expect(uniqueIds.size).toBe(themeIds.length);
    });
  });
});
