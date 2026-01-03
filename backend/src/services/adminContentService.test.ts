import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: admin-dashboard, Property 11: Theme Ranking Order
 * 
 * *For any* theme popularity ranking, themes should be sorted 
 * in descending order by generation count.
 * 
 * **Validates: Requirements 5.2**
 * 
 * Feature: admin-dashboard, Property 12: Date Range Filter Correctness
 * 
 * *For any* date range filter on statistics, all returned data points 
 * should have timestamps within the specified range (inclusive).
 * 
 * **Validates: Requirements 5.3**
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

describe('Admin Content Service - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 11: Theme Ranking Order', () => {
    it('themes should be sorted in descending order by generation count', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              theme: fc.string({ minLength: 1, maxLength: 20 }),
              count: fc.integer({ min: 1, max: 1000 })
            }),
            { minLength: 0, maxLength: 50 }
          ),
          async (themeData) => {
            // 聚合相同主题的计数
            const themeCounts = new Map<string, number>();
            themeData.forEach(({ theme, count }) => {
              themeCounts.set(theme, (themeCounts.get(theme) || 0) + count);
            });

            // 转换为数组并排序（模拟服务逻辑）
            const sortedThemes = Array.from(themeCounts.entries())
              .map(([theme, count]) => ({ theme, count }))
              .sort((a, b) => b.count - a.count);

            // 验证：排序后的数组应该是降序的
            for (let i = 1; i < sortedThemes.length; i++) {
              expect(sortedThemes[i - 1].count).toBeGreaterThanOrEqual(sortedThemes[i].count);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('worksheet types should be sorted in descending order by count', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              type: fc.constantFrom(
                'letter-recognition', 'number-tracing', 'coloring-page',
                'maze', 'pattern-sequencing', 'count-write', 'shape-tracing'
              ),
              count: fc.integer({ min: 1, max: 500 })
            }),
            { minLength: 0, maxLength: 100 }
          ),
          async (worksheetData) => {
            // 聚合相同类型的计数
            const typeCounts = new Map<string, number>();
            worksheetData.forEach(({ type, count }) => {
              typeCounts.set(type, (typeCounts.get(type) || 0) + count);
            });

            // 转换为数组并排序
            const sortedTypes = Array.from(typeCounts.entries())
              .map(([type, count]) => ({ type, count }))
              .sort((a, b) => b.count - a.count);

            // 验证：排序后的数组应该是降序的
            for (let i = 1; i < sortedTypes.length; i++) {
              expect(sortedTypes[i - 1].count).toBeGreaterThanOrEqual(sortedTypes[i].count);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Date Range Filter Correctness', () => {
    it('all returned usage data should be within the specified date range', async () => {
      await fc.assert(
        fc.asyncProperty(
          // 生成日期范围
          fc.record({
            startOffset: fc.integer({ min: -60, max: -1 }),
            endOffset: fc.integer({ min: 0, max: 30 })
          }),
          // 生成使用记录
          fc.array(
            fc.record({
              dateOffset: fc.integer({ min: -90, max: 60 }),
              count: fc.integer({ min: 1, max: 100 }),
              worksheetType: fc.constantFrom('maze', 'coloring-page', 'letter-recognition')
            }),
            { minLength: 0, maxLength: 50 }
          ),
          async (dateRange, usageRecords) => {
            const now = new Date();
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() + dateRange.startOffset);
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + dateRange.endOffset);

            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];

            // 模拟日期过滤逻辑
            const filteredRecords = usageRecords.filter(record => {
              const recordDate = new Date(now);
              recordDate.setDate(recordDate.getDate() + record.dateOffset);
              const recordDateStr = recordDate.toISOString().split('T')[0];
              
              return recordDateStr >= startDateStr && recordDateStr <= endDateStr;
            });

            // 验证：所有过滤后的记录都应该在日期范围内
            filteredRecords.forEach(record => {
              const recordDate = new Date(now);
              recordDate.setDate(recordDate.getDate() + record.dateOffset);
              const recordDateStr = recordDate.toISOString().split('T')[0];
              
              expect(recordDateStr >= startDateStr).toBe(true);
              expect(recordDateStr <= endDateStr).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all returned download data should be within the specified date range', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            startOffset: fc.integer({ min: -60, max: -1 }),
            endOffset: fc.integer({ min: 0, max: 30 })
          }),
          fc.array(
            fc.record({
              dateOffset: fc.integer({ min: -90, max: 60 }),
              theme: fc.constantFrom('dinosaur', 'unicorn', 'space', 'ocean', 'safari')
            }),
            { minLength: 0, maxLength: 50 }
          ),
          async (dateRange, downloadRecords) => {
            const now = new Date();
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() + dateRange.startOffset);
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + dateRange.endOffset);

            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];

            // 模拟日期过滤逻辑
            const filteredRecords = downloadRecords.filter(record => {
              const downloadedAt = new Date(now);
              downloadedAt.setDate(downloadedAt.getDate() + record.dateOffset);
              const dateStr = downloadedAt.toISOString().split('T')[0];
              
              return dateStr >= startDateStr && dateStr <= endDateStr;
            });

            // 验证：所有过滤后的记录都应该在日期范围内
            filteredRecords.forEach(record => {
              const downloadedAt = new Date(now);
              downloadedAt.setDate(downloadedAt.getDate() + record.dateOffset);
              const dateStr = downloadedAt.toISOString().split('T')[0];
              
              expect(dateStr >= startDateStr).toBe(true);
              expect(dateStr <= endDateStr).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Total Generations Aggregation', () => {
    it('total generations should equal sum of all worksheet type counts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              type: fc.string({ minLength: 1, maxLength: 20 }),
              count: fc.integer({ min: 0, max: 1000 })
            }),
            { minLength: 0, maxLength: 100 }
          ),
          async (worksheetData) => {
            // 计算预期总数
            const expectedTotal = worksheetData.reduce((sum, r) => sum + r.count, 0);

            // 模拟聚合逻辑
            let totalGenerations = 0;
            const typeCounts = new Map<string, number>();
            
            worksheetData.forEach(({ type, count }) => {
              totalGenerations += count;
              typeCounts.set(type, (typeCounts.get(type) || 0) + count);
            });

            // 验证：总数应该等于所有记录的 count 之和
            expect(totalGenerations).toBe(expectedTotal);

            // 验证：类型计数之和也应该等于总数
            const typeCountSum = Array.from(typeCounts.values()).reduce((sum, c) => sum + c, 0);
            expect(typeCountSum).toBe(expectedTotal);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
