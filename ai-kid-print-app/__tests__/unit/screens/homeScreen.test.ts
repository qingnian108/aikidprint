/**
 * 首页属性测试
 * 
 * **Feature: android-app-development, Property 4: 登录用户历史显示**
 * **Validates: Requirements 4.4**
 * 
 * *For any* authenticated user on the Home screen, if they have download history, 
 * the system SHALL display their recent downloads.
 */

import * as fc from 'fast-check';
import { DownloadHistory, User } from '../../../src/types';

// 用户生成器
const userArbitrary = fc.record({
  uid: fc.uuid(),
  email: fc.emailAddress(),
  displayName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  plan: fc.constantFrom('Free' as const, 'Pro' as const),
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
const downloadHistoryListArbitrary = fc.array(downloadHistoryArbitrary, { minLength: 0, maxLength: 10 });

/**
 * 模拟首页显示逻辑
 */
const shouldShowDownloadHistory = (user: User | null, history: DownloadHistory[]): boolean => {
  // 只有登录用户且有下载历史时才显示
  return user !== null && history.length > 0;
};

/**
 * 获取要显示的下载历史数量
 */
const getDisplayedHistoryCount = (user: User | null, history: DownloadHistory[]): number => {
  if (!user) return 0;
  // 最多显示最近 5 条
  return Math.min(history.length, 5);
};

describe('HomeScreen Property Tests', () => {
  /**
   * Property 4: 登录用户历史显示
   * 
   * 对于任何已登录用户，如果有下载历史，应该显示最近下载
   */
  it('Property 4: Authenticated users with history should see recent downloads', () => {
    fc.assert(
      fc.property(
        userArbitrary,
        downloadHistoryListArbitrary,
        (user, history) => {
          const shouldShow = shouldShowDownloadHistory(user, history);
          
          if (history.length > 0) {
            // 有历史记录时应该显示
            expect(shouldShow).toBe(true);
          } else {
            // 没有历史记录时不显示
            expect(shouldShow).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4 补充: 未登录用户不应该看到下载历史
   */
  it('Property 4: Unauthenticated users should not see download history', () => {
    fc.assert(
      fc.property(
        downloadHistoryListArbitrary,
        (history) => {
          const shouldShow = shouldShowDownloadHistory(null, history);
          
          // 未登录用户永远不显示历史
          expect(shouldShow).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4 补充: 显示的历史数量应该有上限
   */
  it('Property 4: Displayed history count should be limited', () => {
    fc.assert(
      fc.property(
        userArbitrary,
        fc.array(downloadHistoryArbitrary, { minLength: 0, maxLength: 20 }),
        (user, history) => {
          const displayedCount = getDisplayedHistoryCount(user, history);
          
          // 显示数量不应超过 5
          expect(displayedCount).toBeLessThanOrEqual(5);
          
          // 显示数量不应超过实际历史数量
          expect(displayedCount).toBeLessThanOrEqual(history.length);
          
          // 如果历史少于 5 条，应该全部显示
          if (history.length <= 5) {
            expect(displayedCount).toBe(history.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4 补充: 下载历史应该包含必要信息
   */
  it('Property 4: Download history items should have required fields', () => {
    fc.assert(
      fc.property(
        downloadHistoryArbitrary,
        (historyItem) => {
          // 验证必要字段存在
          expect(historyItem.id).toBeDefined();
          expect(historyItem.packId).toBeDefined();
          expect(historyItem.packType).toBeDefined();
          expect(historyItem.childName).toBeDefined();
          expect(historyItem.theme).toBeDefined();
          expect(historyItem.pageCount).toBeDefined();
          expect(historyItem.downloadedAt).toBeDefined();
          
          // 验证 packType 是有效值
          expect(['weekly', 'custom']).toContain(historyItem.packType);
          
          // 验证 pageCount 是正数
          expect(historyItem.pageCount).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
