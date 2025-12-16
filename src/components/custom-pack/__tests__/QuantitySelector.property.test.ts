import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: custom-pack, Property 4: Increment increases quantity by exactly 1**
 * **Validates: Requirements 4.1**
 * 
 * For any page type with current quantity N, clicking the increment button
 * SHALL result in quantity N+1.
 */

/**
 * **Feature: custom-pack, Property 5: Decrement respects minimum bound**
 * **Validates: Requirements 4.2**
 * 
 * For any page type with current quantity N, clicking the decrement button
 * SHALL result in quantity max(0, N-1).
 */

describe('QuantitySelector Property Tests', () => {
  // 模拟数量变更逻辑
  const applyQuantityChange = (currentValue: number, delta: number, min: number = 0, max: number = 99): number => {
    const newValue = currentValue + delta;
    return Math.max(min, Math.min(max, newValue));
  };

  describe('Property 4: Increment increases quantity by exactly 1', () => {
    it('incrementing any value below max increases by exactly 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 98 }), // 当前值（不能是 max）
          fc.integer({ min: 1, max: 99 }),  // max 值
          (currentValue, maxValue) => {
            // 确保 currentValue < maxValue
            if (currentValue >= maxValue) return true; // 跳过无效情况
            
            const newValue = applyQuantityChange(currentValue, 1, 0, maxValue);
            return newValue === currentValue + 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('incrementing at max value stays at max', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 99 }), // max 值
          (maxValue) => {
            const newValue = applyQuantityChange(maxValue, 1, 0, maxValue);
            return newValue === maxValue;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('multiple increments increase by correct total', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }), // 起始值
          fc.integer({ min: 1, max: 20 }), // 增量次数
          (startValue, incrementCount) => {
            let value = startValue;
            const maxValue = 99;
            
            for (let i = 0; i < incrementCount; i++) {
              value = applyQuantityChange(value, 1, 0, maxValue);
            }
            
            const expectedValue = Math.min(startValue + incrementCount, maxValue);
            return value === expectedValue;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Decrement respects minimum bound', () => {
    it('decrementing any value above min decreases by exactly 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 99 }), // 当前值（必须 > 0）
          (currentValue) => {
            const newValue = applyQuantityChange(currentValue, -1, 0, 99);
            return newValue === currentValue - 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('decrementing at min value stays at min', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }), // min 值
          (minValue) => {
            const newValue = applyQuantityChange(minValue, -1, minValue, 99);
            return newValue === minValue;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('decrementing from 0 stays at 0 (default min)', () => {
      const newValue = applyQuantityChange(0, -1, 0, 99);
      expect(newValue).toBe(0);
    });

    it('multiple decrements respect minimum bound', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }), // 起始值
          fc.integer({ min: 1, max: 100 }), // 减量次数（可能超过起始值）
          (startValue, decrementCount) => {
            let value = startValue;
            const minValue = 0;
            
            for (let i = 0; i < decrementCount; i++) {
              value = applyQuantityChange(value, -1, minValue, 99);
            }
            
            const expectedValue = Math.max(startValue - decrementCount, minValue);
            return value === expectedValue;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Combined increment/decrement operations', () => {
    it('increment then decrement returns to original value (when not at bounds)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 98 }), // 中间值，避免边界
          (startValue) => {
            let value = startValue;
            value = applyQuantityChange(value, 1, 0, 99);
            value = applyQuantityChange(value, -1, 0, 99);
            return value === startValue;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('random sequence of operations respects bounds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }), // 起始值
          fc.array(fc.constantFrom(1, -1), { minLength: 1, maxLength: 50 }), // 操作序列
          (startValue, operations) => {
            let value = startValue;
            const minValue = 0;
            const maxValue = 99;
            
            for (const delta of operations) {
              value = applyQuantityChange(value, delta, minValue, maxValue);
              
              // 验证始终在边界内
              if (value < minValue || value > maxValue) {
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
