/**
 * 认证失败错误显示属性测试
 * 
 * **Feature: android-app-development, Property 2: 认证失败错误显示**
 * **Validates: Requirements 3.6**
 * 
 * *For any* failed authentication attempt (invalid credentials, network error, etc.), 
 * the system SHALL display an appropriate error message to the user.
 */

import * as fc from 'fast-check';
import { authService } from '../../../src/services/auth';

// Mock Firebase modules
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: () => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithCredential: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  }),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
      })),
    })),
  }),
  FieldValue: {
    serverTimestamp: jest.fn(),
  },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ data: { idToken: 'mock-token' } })),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
  },
}));

// Firebase 错误码生成器
const firebaseErrorCodeArbitrary = fc.constantFrom(
  'auth/invalid-email',
  'auth/user-disabled',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/email-already-in-use',
  'auth/weak-password',
  'auth/network-request-failed',
  'auth/too-many-requests',
  'auth/operation-not-allowed',
  'auth/unknown-error'
);

// 预期的错误消息映射
const expectedErrorMessages: Record<string, string> = {
  'auth/invalid-email': '邮箱格式不正确',
  'auth/user-disabled': '该账户已被禁用',
  'auth/user-not-found': '用户不存在',
  'auth/wrong-password': '密码错误',
  'auth/email-already-in-use': '该邮箱已被注册',
  'auth/weak-password': '密码强度不够，请使用至少6位字符',
  'auth/network-request-failed': '网络连接失败，请检查网络',
  'auth/too-many-requests': '请求过于频繁，请稍后再试',
  'auth/operation-not-allowed': '该登录方式未启用',
};

describe('Auth Error Handling Property Tests', () => {
  /**
   * Property 2: 认证失败错误显示
   * 
   * 对于任何 Firebase 错误码，handleAuthError 应该返回一个包含用户友好消息的 Error
   */
  it('Property 2: handleAuthError should return user-friendly error messages for all Firebase error codes', () => {
    fc.assert(
      fc.property(
        firebaseErrorCodeArbitrary,
        (errorCode) => {
          const firebaseError = { code: errorCode, message: 'Original error message' };
          const result = authService.handleAuthError(firebaseError);
          
          // 验证返回的是 Error 对象
          expect(result).toBeInstanceOf(Error);
          
          // 验证错误消息不为空
          expect(result.message).toBeTruthy();
          expect(result.message.length).toBeGreaterThan(0);
          
          // 验证已知错误码有对应的中文消息
          if (expectedErrorMessages[errorCode]) {
            expect(result.message).toBe(expectedErrorMessages[errorCode]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2 补充: 未知错误也应该有友好的错误消息
   */
  it('Property 2: Unknown errors should have a fallback message', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (unknownCode) => {
          // 排除已知的错误码
          if (Object.keys(expectedErrorMessages).includes(unknownCode)) {
            return true; // 跳过已知错误码
          }
          
          const firebaseError = { code: unknownCode, message: 'Some error' };
          const result = authService.handleAuthError(firebaseError);
          
          // 验证返回的是 Error 对象
          expect(result).toBeInstanceOf(Error);
          
          // 验证有错误消息
          expect(result.message).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2 补充: 错误消息应该是中文（用户友好）
   */
  it('Property 2: Error messages for known codes should be in Chinese', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(expectedErrorMessages)),
        (errorCode) => {
          const firebaseError = { code: errorCode, message: 'Original error' };
          const result = authService.handleAuthError(firebaseError);
          
          // 验证消息包含中文字符
          const hasChinese = /[\u4e00-\u9fa5]/.test(result.message);
          expect(hasChinese).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2 补充: 没有 code 的错误应该使用 message 或默认消息
   */
  it('Property 2: Errors without code should use message or default', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        (errorMessage) => {
          const error = { message: errorMessage };
          const result = authService.handleAuthError(error);
          
          expect(result).toBeInstanceOf(Error);
          expect(result.message).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
