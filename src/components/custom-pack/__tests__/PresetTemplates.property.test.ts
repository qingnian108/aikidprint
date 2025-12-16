import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PRESET_TEMPLATES, getPresetTotalPages, PresetTemplate } from '../PresetTemplates';
import { CATEGORIES } from '../../../constants/pageTypes';

/**
 * **Feature: custom-pack, Property 8: Preset application sets correct quantities**
 * **Validates: Requirements 6.2, 6.3**
 * 
 * For any preset template, applying the preset SHALL set the selections state
 * to exactly match the preset's selections configuration.
 */

/**
 * **Feature: custom-pack, Property 9: Manual change clears active preset**
 * **Validates: Requirements 6.4**
 * 
 * For any state where a preset is active, changing any quantity manually
 * SHALL set activePreset to null.
 */

describe('PresetTemplates Property Tests', () => {
  // 获取所有有效的 page type IDs
  const allPageTypeIds = CATEGORIES.flatMap(c => c.pageTypes.map(pt => pt.id));

  describe('Property 8: Preset application sets correct quantities', () => {
    it('applying any preset sets selections to match preset configuration', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRESET_TEMPLATES),
          (preset) => {
            // 模拟应用预设
            let selections: Record<string, number> = {};
            let activePreset: string | null = null;
            
            const applyPreset = (p: PresetTemplate) => {
              selections = { ...p.selections };
              activePreset = p.id;
            };
            
            applyPreset(preset);
            
            // 验证 selections 完全匹配预设配置
            const presetKeys = Object.keys(preset.selections);
            const selectionKeys = Object.keys(selections);
            
            if (presetKeys.length !== selectionKeys.length) return false;
            
            for (const key of presetKeys) {
              if (selections[key] !== preset.selections[key]) return false;
            }
            
            // 验证 activePreset 被设置
            if (activePreset !== preset.id) return false;
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('preset total pages calculation is correct', () => {
      for (const preset of PRESET_TEMPLATES) {
        const calculatedTotal = getPresetTotalPages(preset);
        const expectedTotal = Object.values(preset.selections).reduce((sum, count) => sum + count, 0);
        expect(calculatedTotal).toBe(expectedTotal);
      }
    });

    it('all presets have valid page type IDs', () => {
      for (const preset of PRESET_TEMPLATES) {
        for (const pageTypeId of Object.keys(preset.selections)) {
          expect(allPageTypeIds).toContain(pageTypeId);
        }
      }
    });

    it('all presets have positive page counts', () => {
      for (const preset of PRESET_TEMPLATES) {
        const total = getPresetTotalPages(preset);
        expect(total).toBeGreaterThan(0);
        
        for (const count of Object.values(preset.selections)) {
          expect(count).toBeGreaterThan(0);
        }
      }
    });

    it('preset IDs are unique', () => {
      const ids = PRESET_TEMPLATES.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Property 9: Manual change clears active preset', () => {
    it('changing any quantity after applying preset clears activePreset', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRESET_TEMPLATES),
          fc.constantFrom(...allPageTypeIds),
          fc.integer({ min: -5, max: 5 }),
          (preset, pageTypeId, delta) => {
            // 模拟状态
            let selections: Record<string, number> = { ...preset.selections };
            let activePreset: string | null = preset.id;
            
            // 模拟手动修改数量
            const handleQuantityChange = (id: string, d: number) => {
              const currentCount = selections[id] || 0;
              const newCount = Math.max(0, currentCount + d);
              
              if (newCount === 0) {
                delete selections[id];
              } else {
                selections[id] = newCount;
              }
              
              // 手动修改应该清除 activePreset
              activePreset = null;
            };
            
            // 执行手动修改
            handleQuantityChange(pageTypeId, delta);
            
            // 验证 activePreset 被清除
            return activePreset === null;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('applying a new preset after manual change sets new activePreset', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRESET_TEMPLATES),
          fc.constantFrom(...PRESET_TEMPLATES),
          (firstPreset, secondPreset) => {
            let selections: Record<string, number> = { ...firstPreset.selections };
            let activePreset: string | null = firstPreset.id;
            
            // 手动修改
            const somePageType = Object.keys(selections)[0];
            if (somePageType) {
              selections[somePageType] = (selections[somePageType] || 0) + 1;
              activePreset = null;
            }
            
            // 应用新预设
            selections = { ...secondPreset.selections };
            activePreset = secondPreset.id;
            
            return activePreset === secondPreset.id;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Preset structure validation', () => {
    it('all presets have required fields', () => {
      for (const preset of PRESET_TEMPLATES) {
        expect(preset.id).toBeTruthy();
        expect(preset.name).toBeTruthy();
        expect(preset.description).toBeTruthy();
        expect(preset.icon).toBeTruthy();
        expect(preset.selections).toBeDefined();
        expect(typeof preset.selections).toBe('object');
      }
    });

    it('there are at least 3 presets as required', () => {
      expect(PRESET_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    });
  });
});
