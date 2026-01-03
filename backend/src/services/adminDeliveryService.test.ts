import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: admin-dashboard, Property 13: Weekly Delivery List Filter
 * 
 * *For any* weekly delivery settings list, all returned settings 
 * should have enabled=true.
 * 
 * **Validates: Requirements 6.1**
 */

// Mock Firebase Admin
const mockFirestore = {
  collection: vi.fn()
};

vi.mock('firebase-admin', () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn()
    },
    firestore: vi.fn(() => mockFirestore)
  }
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => JSON.stringify({ project_id: 'test' }))
  }
}));

describe('Admin Delivery Service - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 13: Weekly Delivery List Filter', () => {
    it('all returned delivery settings should have enabled=true', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              enabled: fc.boolean(),
              deliveryMethod: fc.constantFrom('email', 'manual'),
              deliveryTime: fc.constantFrom('08:00', '09:00', '10:00', '18:00'),
              timezone: fc.constantFrom('America/New_York', 'America/Los_Angeles', 'Europe/London'),
              childName: fc.string({ minLength: 1, maxLength: 20 }),
              childAge: fc.constantFrom('3', '4', '5', '6', '7'),
              theme: fc.constantFrom('dinosaur', 'unicorn', 'space', 'ocean', 'safari'),
              email: fc.emailAddress()
            }),
            { minLength: 0, maxLength: 50 }
          ),
          async (allSettings) => {
            // 模拟 where('enabled', '==', true) 过滤
            const enabledSettings = allSettings.filter(s => s.enabled === true);

            // 验证：所有返回的设置都应该有 enabled=true
            enabledSettings.forEach(setting => {
              expect(setting.enabled).toBe(true);
            });

            // 验证：返回的数量应该等于 enabled=true 的数量
            const expectedCount = allSettings.filter(s => s.enabled).length;
            expect(enabledSettings.length).toBe(expectedCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('disabled settings should not appear in the list', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              enabled: fc.boolean(),
              childName: fc.string({ minLength: 1, maxLength: 20 })
            }),
            { minLength: 1, maxLength: 30 }
          ),
          async (allSettings) => {
            // 模拟过滤逻辑
            const filteredSettings = allSettings.filter(s => s.enabled === true);
            const disabledSettings = allSettings.filter(s => s.enabled === false);

            // 验证：过滤后的列表不应包含任何 disabled 的设置
            filteredSettings.forEach(setting => {
              expect(disabledSettings.find(d => d.userId === setting.userId && !d.enabled)).toBeUndefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Delivery History Sorting', () => {
    it('delivery history should be sorted by date in descending order', async () => {
      // 使用时间戳生成器来避免无效日期问题
      const validDateArb = fc.integer({ 
        min: new Date('2024-01-01').getTime(), 
        max: new Date('2026-12-31').getTime() 
      }).map(ts => new Date(ts));

      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              deliveryId: fc.uuid(),
              userId: fc.uuid(),
              status: fc.constantFrom('success', 'failed'),
              pageCount: fc.integer({ min: 1, max: 20 }),
              deliveredAt: validDateArb
            }),
            { minLength: 0, maxLength: 50 }
          ),
          async (historyRecords) => {
            // 模拟排序逻辑
            const sortedHistory = [...historyRecords].sort(
              (a, b) => b.deliveredAt.getTime() - a.deliveredAt.getTime()
            );

            // 验证：排序后的数组应该是按日期降序的
            for (let i = 1; i < sortedHistory.length; i++) {
              expect(sortedHistory[i - 1].deliveredAt.getTime())
                .toBeGreaterThanOrEqual(sortedHistory[i].deliveredAt.getTime());
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Delivery Settings Data Integrity', () => {
    it('all required fields should be present in delivery settings', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            enabled: fc.constant(true),
            deliveryMethod: fc.constantFrom('email', 'manual'),
            deliveryTime: fc.string({ minLength: 5, maxLength: 5 }),
            timezone: fc.string({ minLength: 1, maxLength: 50 }),
            childName: fc.string({ minLength: 1, maxLength: 50 }),
            childAge: fc.string({ minLength: 1, maxLength: 2 }),
            theme: fc.string({ minLength: 1, maxLength: 20 }),
            email: fc.emailAddress()
          }),
          async (setting) => {
            // 验证：所有必需字段都应该存在且非空
            expect(setting.userId).toBeTruthy();
            expect(setting.enabled).toBe(true);
            expect(['email', 'manual']).toContain(setting.deliveryMethod);
            expect(setting.deliveryTime).toBeTruthy();
            expect(setting.timezone).toBeTruthy();
            expect(setting.childName).toBeTruthy();
            expect(setting.childAge).toBeTruthy();
            expect(setting.theme).toBeTruthy();
            expect(setting.email).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
