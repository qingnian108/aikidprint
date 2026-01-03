import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import {
  validateAdminCredentials,
  generateAdminToken,
  verifyAdminToken,
  adminAuthMiddleware
} from './adminAuth.js';
import { Request, Response } from 'express';

/**
 * Feature: admin-dashboard, Property 1: Admin Authentication Enforcement
 * 
 * *For any* request to admin API endpoints (except /login), 
 * if the request does not contain a valid admin token, 
 * the system should return 401 Unauthorized.
 * 
 * **Validates: Requirements 1.2, 1.3**
 */
describe('Admin Authentication - Property Tests', () => {
  // 设置环境变量
  beforeAll(() => {
    process.env.ADMIN_EMAILS = 'admin@test.com';
    process.env.ADMIN_PASSWORD = 'testpassword123';
    process.env.ADMIN_JWT_SECRET = 'test-secret-key';
  });

  describe('Property 1: Admin Authentication Enforcement', () => {
    it('should reject requests without any authorization header', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(), // random path
          async (path) => {
            const mockReq = {
              headers: {},
              path
            } as Request;

            let statusCode = 0;
            let responseBody: any = null;

            const mockRes = {
              status: (code: number) => {
                statusCode = code;
                return mockRes;
              },
              json: (body: any) => {
                responseBody = body;
                return mockRes;
              }
            } as Response;

            const mockNext = () => {};

            adminAuthMiddleware(mockReq as any, mockRes, mockNext);

            // 验证：没有 token 应该返回 401
            expect(statusCode).toBe(401);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe('unauthorized');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject requests with invalid token format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter(s => !s.startsWith('Bearer ')), // 非 Bearer 格式的字符串
          async (invalidAuth) => {
            const mockReq = {
              headers: {
                authorization: invalidAuth
              }
            } as Request;

            let statusCode = 0;
            let responseBody: any = null;

            const mockRes = {
              status: (code: number) => {
                statusCode = code;
                return mockRes;
              },
              json: (body: any) => {
                responseBody = body;
                return mockRes;
              }
            } as Response;

            const mockNext = () => {};

            adminAuthMiddleware(mockReq as any, mockRes, mockNext);

            // 验证：无效格式应该返回 401
            expect(statusCode).toBe(401);
            expect(responseBody.success).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject requests with random invalid tokens', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 200 }), // 随机字符串作为 token
          async (randomToken) => {
            const mockReq = {
              headers: {
                authorization: `Bearer ${randomToken}`
              }
            } as Request;

            let statusCode = 0;
            let responseBody: any = null;

            const mockRes = {
              status: (code: number) => {
                statusCode = code;
                return mockRes;
              },
              json: (body: any) => {
                responseBody = body;
                return mockRes;
              }
            } as Response;

            const mockNext = () => {};

            adminAuthMiddleware(mockReq as any, mockRes, mockNext);

            // 验证：随机 token 应该返回 401（除非碰巧是有效的 JWT，概率极低）
            expect(statusCode).toBe(401);
            expect(responseBody.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept requests with valid admin token', async () => {
      // 生成有效 token
      const validToken = generateAdminToken('admin@test.com', 'admin');

      const mockReq = {
        headers: {
          authorization: `Bearer ${validToken}`
        }
      } as any;

      let nextCalled = false;
      const mockRes = {
        status: () => mockRes,
        json: () => mockRes
      } as any;

      const mockNext = () => {
        nextCalled = true;
      };

      adminAuthMiddleware(mockReq, mockRes, mockNext);

      // 验证：有效 token 应该调用 next()
      expect(nextCalled).toBe(true);
      expect(mockReq.admin).toBeDefined();
      expect(mockReq.admin.email).toBe('admin@test.com');
    });
  });

  describe('Token Generation and Verification', () => {
    it('should generate verifiable tokens for any valid email and role', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.constantFrom('admin', 'super_admin'),
          async (email, role) => {
            const token = generateAdminToken(email, role);
            const decoded = verifyAdminToken(token);

            // 验证：生成的 token 应该能被正确解码
            expect(decoded).not.toBeNull();
            expect(decoded?.email).toBe(email);
            expect(decoded?.role).toBe(role);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Credential Validation', () => {
    it('should reject invalid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress().filter(e => e !== 'admin@test.com'), // 非管理员邮箱
          fc.string({ minLength: 1 }),
          async (email, password) => {
            const result = await validateAdminCredentials(email, password);
            
            // 验证：非管理员邮箱应该被拒绝
            expect(result.valid).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject wrong password for valid admin email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(p => p !== 'testpassword123'), // 错误密码
          async (wrongPassword) => {
            const result = await validateAdminCredentials('admin@test.com', wrongPassword);
            
            // 验证：错误密码应该被拒绝
            expect(result.valid).toBe(false);
          }
        ),
        { numRuns: 10 } // 减少运行次数，因为 bcrypt 比较很慢
      );
    }, 30000); // 30秒超时

    it('should accept correct credentials', async () => {
      const result = await validateAdminCredentials('admin@test.com', 'testpassword123');
      
      expect(result.valid).toBe(true);
      expect(result.role).toBeDefined();
    });
  });
});
