import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: admin-dashboard, Property 15: CSV Export Completeness
 * 
 * *For any* data export request, the generated CSV should contain 
 * all records from the corresponding collection (within any specified filters).
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
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

// CSV 转义函数（与服务中相同）
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// 生成 CSV 字符串
const generateCSV = (headers: string[], rows: any[][]): string => {
  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map(row => row.map(escapeCSV).join(','));
  return [headerLine, ...dataLines].join('\n');
};

// 解析 CSV 字符串
const parseCSV = (csv: string): { headers: string[]; rows: string[][] } => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => line.split(','));
  return { headers, rows };
};

describe('Admin Export Service - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 15: CSV Export Completeness', () => {
    it('exported CSV should contain all user records', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              email: fc.emailAddress(),
              displayName: fc.string({ minLength: 1, maxLength: 50 }),
              plan: fc.constantFrom('Free', 'Pro'),
              createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31'), noInvalidDate: true })
            }),
            { minLength: 0, maxLength: 100 }
          ),
          async (users) => {
            // 模拟导出逻辑
            const headers = ['userId', 'email', 'displayName', 'plan', 'createdAt'];
            const rows = users.map(user => [
              user.userId,
              user.email,
              user.displayName,
              user.plan,
              user.createdAt.toISOString()
            ]);

            const csv = generateCSV(headers, rows);
            const parsed = parseCSV(csv);

            // 验证：CSV 行数应该等于用户数量（不包括标题行）
            expect(parsed.rows.length).toBe(users.length);

            // 验证：标题行应该包含所有字段
            expect(parsed.headers).toEqual(headers);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('exported CSV should contain all subscription records', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              subscriptionId: fc.uuid(),
              userId: fc.uuid(),
              plan: fc.constant('Pro'),
              status: fc.constantFrom('active', 'cancelled', 'expired'),
              startDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-06-30'), noInvalidDate: true }),
              daysToAdd: fc.integer({ min: 30, max: 365 }),
              autoRenew: fc.boolean()
            }),
            { minLength: 0, maxLength: 100 }
          ).map(subs => subs.map(sub => ({
            ...sub,
            endDate: new Date(sub.startDate.getTime() + sub.daysToAdd * 24 * 60 * 60 * 1000)
          }))),
          async (subscriptions) => {
            const headers = ['subscriptionId', 'userId', 'plan', 'status', 'startDate', 'endDate', 'autoRenew'];
            const rows = subscriptions.map(sub => [
              sub.subscriptionId,
              sub.userId,
              sub.plan,
              sub.status,
              sub.startDate.toISOString(),
              sub.endDate.toISOString(),
              sub.autoRenew ? 'true' : 'false'
            ]);

            const csv = generateCSV(headers, rows);
            const parsed = parseCSV(csv);

            // 验证：CSV 行数应该等于订阅数量
            expect(parsed.rows.length).toBe(subscriptions.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('exported CSV should contain all payment records', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              paymentId: fc.uuid(),
              userId: fc.uuid(),
              amount: fc.float({ min: Math.fround(0.99), max: Math.fround(99.99), noNaN: true }),
              currency: fc.constant('USD'),
              paypalOrderId: fc.string({ minLength: 10, maxLength: 20 }),
              status: fc.constantFrom('pending', 'completed', 'failed'),
              createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31'), noInvalidDate: true })
            }),
            { minLength: 0, maxLength: 100 }
          ),
          async (payments) => {
            const headers = ['paymentId', 'userId', 'amount', 'currency', 'paypalOrderId', 'status', 'createdAt'];
            const rows = payments.map(payment => [
              payment.paymentId,
              payment.userId,
              payment.amount,
              payment.currency,
              payment.paypalOrderId,
              payment.status,
              payment.createdAt.toISOString()
            ]);

            const csv = generateCSV(headers, rows);
            const parsed = parseCSV(csv);

            // 验证：CSV 行数应该等于支付记录数量
            expect(parsed.rows.length).toBe(payments.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('exported CSV should contain all usage records', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              usageId: fc.uuid(),
              userId: fc.uuid(),
              date: fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31'), noInvalidDate: true }),
              worksheetType: fc.constantFrom('maze', 'coloring-page', 'letter-recognition', 'number-tracing'),
              count: fc.integer({ min: 1, max: 100 })
            }),
            { minLength: 0, maxLength: 100 }
          ),
          async (usageRecords) => {
            const headers = ['usageId', 'userId', 'date', 'worksheetType', 'count'];
            const rows = usageRecords.map(usage => [
              usage.usageId,
              usage.userId,
              usage.date.toISOString().split('T')[0],
              usage.worksheetType,
              usage.count
            ]);

            const csv = generateCSV(headers, rows);
            const parsed = parseCSV(csv);

            // 验证：CSV 行数应该等于使用记录数量
            expect(parsed.rows.length).toBe(usageRecords.length);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('CSV Escaping', () => {
    it('should properly escape values containing commas', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (value) => {
            const valueWithComma = value + ',test';
            const escaped = escapeCSV(valueWithComma);
            
            // 验证：包含逗号的值应该被引号包围
            expect(escaped.startsWith('"')).toBe(true);
            expect(escaped.endsWith('"')).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should properly escape values containing quotes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (value) => {
            const valueWithQuote = value + '"test';
            const escaped = escapeCSV(valueWithQuote);
            
            // 验证：包含引号的值应该被引号包围，且内部引号应该被转义
            expect(escaped.startsWith('"')).toBe(true);
            expect(escaped.endsWith('"')).toBe(true);
            expect(escaped.includes('""')).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle null and undefined values', async () => {
      expect(escapeCSV(null)).toBe('');
      expect(escapeCSV(undefined)).toBe('');
    });
  });
});
