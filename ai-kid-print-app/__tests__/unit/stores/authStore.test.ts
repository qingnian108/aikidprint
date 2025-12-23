/**
 * 认证状态属性测试
 * 
 * **Feature: android-app-development, Property 1: 认证状态导航一致性**
 * **Validates: Requirements 3.1, 3.4**
 * 
 * *For any* app launch, if the user is not authenticated, the system SHALL display 
 * the login screen; if authenticated, the system SHALL display the main tab navigator.
 */

import * as fc from 'fast-check';
import { useAuthStore } from '../../../src/stores/authStore';
import { User } from '../../../src/types';

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

// 用户生成器
const userArbitrary = fc.record({
  uid: fc.uuid(),
  email: fc.emailAddress(),
  displayName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  plan: fc.constantFrom('Free' as const, 'Pro' as const),
});

describe('AuthStore Property Tests', () => {
  beforeEach(() => {
    // 重置 store 状态
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  });

  /**
   * Property 1: 认证状态导航一致性
   * 
   * 对于任何用户状态，isAuthenticated 应该与 user 是否存在保持一致
   */
  it('Property 1: isAuthenticated should be consistent with user presence', () => {
    fc.assert(
      fc.property(
        fc.option(userArbitrary, { nil: null }),
        (user) => {
          // 设置用户状态
          useAuthStore.getState().setUser(user);
          
          const state = useAuthStore.getState();
          
          // 验证一致性：有用户时 isAuthenticated 为 true，无用户时为 false
          if (user === null) {
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
          } else {
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(user);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1 补充: 登出后状态应该清空
   */
  it('Property 1: After setting user to null, isAuthenticated should be false', () => {
    fc.assert(
      fc.property(
        userArbitrary,
        (user) => {
          // 先设置用户
          useAuthStore.getState().setUser(user);
          expect(useAuthStore.getState().isAuthenticated).toBe(true);
          
          // 然后清空用户
          useAuthStore.getState().setUser(null);
          
          const state = useAuthStore.getState();
          expect(state.isAuthenticated).toBe(false);
          expect(state.user).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1 补充: 用户信息应该正确保存
   */
  it('Property 1: User information should be correctly stored', () => {
    fc.assert(
      fc.property(
        userArbitrary,
        (user) => {
          useAuthStore.getState().setUser(user);
          
          const storedUser = useAuthStore.getState().user;
          
          expect(storedUser?.uid).toBe(user.uid);
          expect(storedUser?.email).toBe(user.email);
          expect(storedUser?.displayName).toBe(user.displayName);
          expect(storedUser?.plan).toBe(user.plan);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * clearError 应该清除错误状态
   */
  it('clearError should clear error state', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (errorMessage) => {
          // 设置错误
          useAuthStore.setState({ error: errorMessage });
          expect(useAuthStore.getState().error).toBe(errorMessage);
          
          // 清除错误
          useAuthStore.getState().clearError();
          expect(useAuthStore.getState().error).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
