import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let initialized = false;

/**
 * 初始化 Firebase Admin SDK（单例模式）
 * 支持多种初始化方式：
 * 1. firebase-service-account.json 文件
 * 2. FIREBASE_SERVICE_ACCOUNT 环境变量
 * 3. Google Cloud 默认凭据
 */
export const initializeFirebaseAdmin = (): boolean => {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return true;
  }

  try {
    // 方式1：使用服务账号文件
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized from service account file');
      initialized = true;
      return true;
    }

    // 方式2：使用环境变量
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized from environment variable');
      initialized = true;
      return true;
    }

    // 方式3：使用 Google Cloud 默认凭据（适用于 Cloud Run 等环境）
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT) {
      admin.initializeApp();
      console.log('✅ Firebase Admin initialized with default credentials');
      initialized = true;
      return true;
    }

    console.error('❌ Firebase Admin: No credentials found');
    return false;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    return false;
  }
};

/**
 * 获取 Firestore 实例
 */
export const getFirestore = (): admin.firestore.Firestore | null => {
  if (!initialized && admin.apps.length === 0) {
    if (!initializeFirebaseAdmin()) {
      return null;
    }
  }
  return admin.firestore();
};

/**
 * 获取 Auth 实例
 */
export const getAuth = (): admin.auth.Auth | null => {
  if (!initialized && admin.apps.length === 0) {
    if (!initializeFirebaseAdmin()) {
      return null;
    }
  }
  return admin.auth();
};

export default {
  initializeFirebaseAdmin,
  getFirestore,
  getAuth
};
