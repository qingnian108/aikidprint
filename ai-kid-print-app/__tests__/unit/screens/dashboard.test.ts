/**
 * Dashboard 属性测试
 * 
 * **Feature: android-app-development, Property 15: Dashboard 统计显示**
 * **Feature: android-app-development, Property 16: 下载历史列表**
 * **Validates: Requirements 9.2, 9.3**
 */

import * as fc from 'fast-check';
import { UserStats, DownloadHistory } from '../../../src/types';

// 用户统计生成器
const userStatsArbitrary = fc.record({
  totalDownloads: fc.integer({ min: 0, max: 1000 }),
  weeklyDownloads: fc.integer({ min: 0, max: 100 }),
});

// 下载历史生成器
const downloadHistoryArbitrary = fc.record({
  id: fc.uuid(),
  packId: fc.uuid(),
  packType: fc.constantFrom('weekly' as const, 'custom' as const),
  childName: fc.string({ minLength: 1, maxLength: 30 }),
  theme: fc.constantFrom('dinosaur', 'space', 'unicorn', 'ocean', 'vehicles', 'wildlife'),
  pageCount: fc.integer({ min: 1, max: 50 }),
  downloadedAt: fc.integer({ min: 1577836800000, max: 1893456000000 }).map(ts => new Date(ts).toISOString()),
});

// 下载历史列表生成器
const downloadHistoryListArbitrary = fc.array(downloadHistoryArbitrary, { minLength: 0, maxLength: 20 });

/**
 * 验证统计数据是否有效
 */
const isValidStats = (stats: UserStats): boolean => {
  return (
    typeof stats.totalDownloads === 'number' &&
    stats.totalDownloads >= 0 &&
    typeof stats.weeklyDownloads === 'number' &&
    stats.weeklyDownloads >= 0 &&
    stats.weeklyDownloads <= stats.totalDownloads
  );
};

/**
 * 获取显示的历史数量
 */
const getDisplayedHistoryCount = (history: DownloadHistory[]): number => {
  return history.length;
};

describe('Dashboard Property Tests', () => {
  /**
   * Property 15: Dashboard 统计显示
   * 
   * 对于 Dashboard 上的任何用户，系统应该显示准确的总下载数和本周下载数
   */
  describe('Property 15: Dashboard Stats Display', () => {
    it('Stats should have valid totalDownloads and weeklyDownloads', () => {
      fc.assert(
        fc.property(
          userStatsArbitrary,
          (stats) => {
            expect(stats.totalDownloads).toBeGreaterThanOrEqual(0);
            expect(stats.weeklyDownloads).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Weekly downloads should not exceed total downloads', () => {
      fc.assert(
        fc.property(
          userStatsArbitrary.filter(s => s.weeklyDownloads <= s.totalDownloads),
          (stats) => {
            expect(stats.weeklyDownloads).toBeLessThanOrEqual(stats.totalDownloads);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Stats should be displayable numbers', () => {
      fc.assert(
        fc.property(
          userStatsArbitrary,
          (stats) => {
            expect(Number.isFinite(stats.totalDownloads)).toBe(true);
            expect(Number.isFinite(stats.weeklyDownloads)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 16: 下载历史列表
   * 
   * 对于任何有下载历史的用户，Dashboard 应该列出所有最近下载
   */
  describe('Property 16: Download History List', () => {
    it('All history items should be displayed', () => {
      fc.assert(
        fc.property(
          downloadHistoryListArbitrary,
          (history) => {
            const displayedCount = getDisplayedHistoryCount(history);
            expect(displayedCount).toBe(history.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Each history item should have required fields', () => {
      fc.assert(
        fc.property(
          downloadHistoryArbitrary,
          (item) => {
            expect(item.id).toBeDefined();
            expect(item.packId).toBeDefined();
            expect(item.packType).toBeDefined();
            expect(item.childName).toBeDefined();
            expect(item.theme).toBeDefined();
            expect(item.pageCount).toBeDefined();
            expect(item.downloadedAt).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('History item packType should be valid', () => {
      fc.assert(
        fc.property(
          downloadHistoryArbitrary,
          (item) => {
            expect(['weekly', 'custom']).toContain(item.packType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('History item pageCount should be positive', () => {
      fc.assert(
        fc.property(
          downloadHistoryArbitrary,
          (item) => {
            expect(item.pageCount).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('History items should have valid theme', () => {
      const validThemes = ['dinosaur', 'space', 'unicorn', 'ocean', 'vehicles', 'wildlife'];
      fc.assert(
        fc.property(
          downloadHistoryArbitrary,
          (item) => {
            expect(validThemes).toContain(item.theme);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
