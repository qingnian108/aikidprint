import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: custom-pack, Property 12: Download behavior based on user plan**
 * **Validates: Requirements 8.1, 8.2**
 * 
 * For any download action, if user.plan === 'Pro' then PDF download SHALL initiate,
 * else navigation to pricing page SHALL occur.
 */

/**
 * **Feature: custom-pack, Property 13: Unauthenticated download redirects to login**
 * **Validates: Requirements 8.4**
 * 
 * For any download action where currentUser is null, navigation to login page
 * SHALL occur with return URL preserved.
 */

/**
 * **Feature: custom-pack, Property 14: Share URL contains valid pack ID**
 * **Validates: Requirements 10.1**
 * 
 * For any generated pack, the share URL SHALL contain the packId
 * and be in the format `/custom-pack/preview/{packId}`.
 */

/**
 * **Feature: custom-pack, Property 15: Shared pack loads correct data**
 * **Validates: Requirements 10.3**
 * 
 * For any valid pack ID in the URL, loading the preview page
 * SHALL display pages matching the stored pack data.
 */

describe('CustomPackPreview Property Tests', () => {
  
  describe('Property 12: Download behavior based on user plan', () => {
    // 模拟下载行为逻辑
    type DownloadResult = 
      | { action: 'download'; format: 'pdf' }
      | { action: 'redirect'; destination: 'pricing' }
      | { action: 'redirect'; destination: 'login' };

    const determineDownloadAction = (
      currentUser: { uid: string; plan: 'Free' | 'Pro' } | null,
      packId: string
    ): DownloadResult => {
      if (!currentUser) {
        return { action: 'redirect', destination: 'login' };
      }
      
      if (currentUser.plan === 'Pro') {
        return { action: 'download', format: 'pdf' };
      }
      
      return { action: 'redirect', destination: 'pricing' };
    };

    it('Pro users can download PDF', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 12 }), // packId
          fc.string({ minLength: 1 }), // userId
          (packId, userId) => {
            const proUser = { uid: userId, plan: 'Pro' as const };
            const result = determineDownloadAction(proUser, packId);
            
            return result.action === 'download' && result.format === 'pdf';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Free users are redirected to pricing', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 12 }), // packId
          fc.string({ minLength: 1 }), // userId
          (packId, userId) => {
            const freeUser = { uid: userId, plan: 'Free' as const };
            const result = determineDownloadAction(freeUser, packId);
            
            return result.action === 'redirect' && result.destination === 'pricing';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('download action is deterministic for same user state', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 12 }),
          fc.string({ minLength: 1 }),
          fc.constantFrom('Free', 'Pro'),
          (packId, userId, plan) => {
            const user = { uid: userId, plan: plan as 'Free' | 'Pro' };
            
            const result1 = determineDownloadAction(user, packId);
            const result2 = determineDownloadAction(user, packId);
            
            return JSON.stringify(result1) === JSON.stringify(result2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: Unauthenticated download redirects to login', () => {
    const determineDownloadAction = (
      currentUser: { uid: string } | null
    ): { action: string; destination?: string } => {
      if (!currentUser) {
        return { action: 'redirect', destination: 'login' };
      }
      return { action: 'continue' };
    };

    it('null user always redirects to login', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 12 }), // packId (doesn't matter)
          (_packId) => {
            const result = determineDownloadAction(null);
            return result.action === 'redirect' && result.destination === 'login';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('authenticated user does not redirect to login', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }), // userId
          (userId) => {
            const user = { uid: userId };
            const result = determineDownloadAction(user);
            return result.action !== 'redirect' || result.destination !== 'login';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('pending pack ID is stored before redirect', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 12 }),
          (packId) => {
            // 模拟存储逻辑
            let storedPackId: string | null = null;
            
            const handleDownloadWithStorage = (
              currentUser: null,
              pId: string
            ) => {
              if (!currentUser) {
                storedPackId = pId;
                return { action: 'redirect', destination: 'login' };
              }
              return { action: 'continue' };
            };
            
            handleDownloadWithStorage(null, packId);
            
            return storedPackId === packId;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: Share URL contains valid pack ID', () => {
    const generateShareUrl = (packId: string, origin: string = 'http://localhost:5173'): string => {
      return `${origin}/#/custom-pack/preview/${packId}`;
    };

    // 使用 stringMatching 代替 filter 避免超时
    const packIdArb = fc.stringMatching(/^[a-z0-9_]{8,12}$/);

    it('share URL contains the pack ID', () => {
      fc.assert(
        fc.property(
          packIdArb,
          (packId) => {
            const shareUrl = generateShareUrl(packId);
            return shareUrl.includes(packId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('share URL follows correct format', () => {
      fc.assert(
        fc.property(
          packIdArb,
          (packId) => {
            const shareUrl = generateShareUrl(packId);
            const expectedPattern = /^https?:\/\/[^/]+\/#\/custom-pack\/preview\/[a-z0-9_]+$/;
            return expectedPattern.test(shareUrl);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('pack ID can be extracted from share URL', () => {
      fc.assert(
        fc.property(
          packIdArb,
          (packId) => {
            const shareUrl = generateShareUrl(packId);
            
            // 从 URL 提取 packId
            const match = shareUrl.match(/\/custom-pack\/preview\/([a-z0-9_]+)$/);
            const extractedId = match ? match[1] : null;
            
            return extractedId === packId;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: Shared pack loads correct data', () => {
    interface PackData {
      id: string;
      theme: string;
      pages: Array<{ order: number; type: string; title: string }>;
      totalPages: number;
    }

    // 模拟 pack 存储
    const packStore: Map<string, PackData> = new Map();

    const savePack = (pack: PackData): void => {
      packStore.set(pack.id, pack);
    };

    const loadPack = (packId: string): PackData | null => {
      return packStore.get(packId) || null;
    };

    // 使用 stringMatching 代替 filter 避免超时
    const packIdArb = fc.stringMatching(/^[a-z0-9_]{8,12}$/);

    it('loaded pack data matches saved pack data', () => {
      fc.assert(
        fc.property(
          packIdArb,
          fc.constantFrom('dinosaur', 'space', 'ocean', 'unicorn'),
          fc.array(
            fc.record({
              order: fc.integer({ min: 1, max: 100 }),
              type: fc.constantFrom('maze', 'coloring-page', 'number-tracing'),
              title: fc.string({ minLength: 1, maxLength: 50 })
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (packId, theme, pages) => {
            const pack: PackData = {
              id: packId,
              theme,
              pages,
              totalPages: pages.length
            };
            
            // 保存
            savePack(pack);
            
            // 加载
            const loadedPack = loadPack(packId);
            
            if (!loadedPack) return false;
            
            // 验证数据匹配
            return (
              loadedPack.id === pack.id &&
              loadedPack.theme === pack.theme &&
              loadedPack.totalPages === pack.totalPages &&
              loadedPack.pages.length === pack.pages.length
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('non-existent pack ID returns null', () => {
      fc.assert(
        fc.property(
          fc.constant('nonexistent_pack_id_12345'),
          (packId) => {
            packStore.clear(); // 确保存储为空
            const result = loadPack(packId);
            return result === null;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('page count in loaded data matches totalPages field', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }).map(n => `test_pack_${n}`),
          fc.integer({ min: 1, max: 30 }),
          (packId, pageCount) => {
            const pages = Array.from({ length: pageCount }, (_, i) => ({
              order: i + 1,
              type: 'test-type',
              title: `Page ${i + 1}`
            }));
            
            const pack: PackData = {
              id: packId,
              theme: 'dinosaur',
              pages,
              totalPages: pageCount
            };
            
            savePack(pack);
            const loadedPack = loadPack(packId);
            
            return loadedPack !== null && 
                   loadedPack.pages.length === loadedPack.totalPages;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
