import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';
import { User } from '../types';

// 配置 Google Sign-In
GoogleSignin.configure({
  webClientId: '251244612826-hcrgtmojd7ckbjuphe4o1p8aff447sts.apps.googleusercontent.com',
});

/**
 * 将 Firebase 用户转换为应用用户类型
 */
const mapFirebaseUser = async (firebaseUser: FirebaseAuthTypes.User): Promise<User> => {
  // 从 Firestore 获取用户额外信息
  const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
  const userData = userDoc.data();

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    plan: userData?.plan || 'Free',
  };
};

/**
 * 创建或更新 Firestore 用户文档
 */
const createOrUpdateUserDoc = async (firebaseUser: FirebaseAuthTypes.User): Promise<void> => {
  const userRef = firestore().collection('users').doc(firebaseUser.uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    // 新用户，创建文档
    await userRef.set({
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      plan: 'Free',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } else {
    // 更新最后登录时间
    await userRef.update({
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }
};

export const authService = {
  /**
   * 使用邮箱和密码登录
   */
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    try {
      const credential = await auth().signInWithEmailAndPassword(email, password);
      if (!credential.user) {
        throw new Error('登录失败');
      }
      await createOrUpdateUserDoc(credential.user);
      return mapFirebaseUser(credential.user);
    } catch (error: any) {
      throw authService.handleAuthError(error);
    }
  },

  /**
   * 使用邮箱和密码注册
   */
  signUpWithEmail: async (email: string, password: string): Promise<User> => {
    try {
      const credential = await auth().createUserWithEmailAndPassword(email, password);
      if (!credential.user) {
        throw new Error('注册失败');
      }
      await createOrUpdateUserDoc(credential.user);
      return mapFirebaseUser(credential.user);
    } catch (error: any) {
      throw authService.handleAuthError(error);
    }
  },

  /**
   * 使用 Google 登录
   */
  loginWithGoogle: async (): Promise<User> => {
    try {
      // 检查 Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 获取 Google 登录凭证
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      
      if (!idToken) {
        throw new Error('无法获取 Google 登录凭证');
      }

      // 使用 Google 凭证登录 Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const credential = await auth().signInWithCredential(googleCredential);
      
      if (!credential.user) {
        throw new Error('Google 登录失败');
      }
      
      await createOrUpdateUserDoc(credential.user);
      return mapFirebaseUser(credential.user);
    } catch (error: any) {
      throw authService.handleAuthError(error);
    }
  },

  /**
   * 登出
   */
  logout: async (): Promise<void> => {
    try {
      // 检查是否使用 Google 登录
      const isSignedInWithGoogle = await GoogleSignin.isSignedIn();
      if (isSignedInWithGoogle) {
        await GoogleSignin.signOut();
      }
      await auth().signOut();
    } catch (error: any) {
      throw authService.handleAuthError(error);
    }
  },

  /**
   * 获取当前用户
   */
  getCurrentUser: async (): Promise<User | null> => {
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) {
      return null;
    }
    return mapFirebaseUser(firebaseUser);
  },

  /**
   * 监听认证状态变化
   */
  onAuthStateChanged: (callback: (user: User | null) => void): (() => void) => {
    return auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const user = await mapFirebaseUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  /**
   * 发送密码重置邮件
   */
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw authService.handleAuthError(error);
    }
  },

  /**
   * 处理认证错误
   */
  handleAuthError: (error: any): Error => {
    let message = '发生未知错误';
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = '邮箱格式不正确';
        break;
      case 'auth/user-disabled':
        message = '该账户已被禁用';
        break;
      case 'auth/user-not-found':
        message = '用户不存在';
        break;
      case 'auth/wrong-password':
        message = '密码错误';
        break;
      case 'auth/email-already-in-use':
        message = '该邮箱已被注册';
        break;
      case 'auth/weak-password':
        message = '密码强度不够，请使用至少6位字符';
        break;
      case 'auth/network-request-failed':
        message = '网络连接失败，请检查网络';
        break;
      case 'auth/too-many-requests':
        message = '请求过于频繁，请稍后再试';
        break;
      case 'auth/operation-not-allowed':
        message = '该登录方式未启用';
        break;
      default:
        message = error.message || '登录失败，请重试';
    }
    
    return new Error(message);
  },
};

export default authService;
