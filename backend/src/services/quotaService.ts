import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配额常量
const FREE_DAILY_LIMIT = 3;  // Free 用户每天 3 张
const PRO_DAILY_LIMIT = 999999;  // Pro 用户无限制

// 初始化 Firebase Admin（如果还没初始化）
let db: admin.firestore.Firestore | null = null;

const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ [QuotaService] Firebase Admin initialized');
    } else {
      console.error('❌ [QuotaService] firebase-service-account.json not found');
      return null;
    }
  }
  return admin.firestore();
};

/**
 * 获取用户计划（Free 或 Pro）
 */
export const getUserPlan = async (userId: string): Promise<'Free' | 'Pro'> => {
  if (!userId || userId === 'guest') {
    return 'Free';
  }

  try {
    if (!db) {
      db = initializeFirebase();
    }
    if (!db) {
      console.warn('[QuotaService] Firebase not initialized, defaulting to Free');
      return 'Free';
    }

    // 检查用户文档
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData?.plan === 'Pro' ? 'Pro' : 'Free';
    }

    // 检查是否有活跃订阅
    const subscriptionsSnapshot = await db.collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!subscriptionsSnapshot.empty) {
      const subscription = subscriptionsSnapshot.docs[0].data();
      const endDate = subscription.endDate?.toDate();
      if (endDate && endDate > new Date()) {
        return 'Pro';
      }
    }

    return 'Free';
  } catch (error) {
    console.error('[QuotaService] Error getting user plan:', error);
    return 'Free';
  }
};

/**
 * 获取用户今日使用次数
 */
export const getTodayUsage = async (userId: string): Promise<number> => {
  if (!userId || userId === 'guest') {
    return 0;  // guest 用户不追踪
  }

  try {
    if (!db) {
      db = initializeFirebase();
    }
    if (!db) {
      return 0;
    }

    const today = new Date().toISOString().split('T')[0];  // YYYY-MM-DD
    const usageId = `${userId}_${today}`;
    const usageDoc = await db.collection('usage').doc(usageId).get();

    if (usageDoc.exists) {
      return usageDoc.data()?.count || 0;
    }
    return 0;
  } catch (error) {
    console.error('[QuotaService] Error getting today usage:', error);
    return 0;
  }
};

/**
 * 记录使用次数
 */
export const recordUsage = async (userId: string, worksheetType: string): Promise<void> => {
  if (!userId || userId === 'guest') {
    return;  // guest 用户不记录
  }

  try {
    if (!db) {
      db = initializeFirebase();
    }
    if (!db) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const usageId = `${userId}_${today}`;
    const usageRef = db.collection('usage').doc(usageId);
    const usageDoc = await usageRef.get();

    if (!usageDoc.exists) {
      await usageRef.set({
        usageId,
        userId,
        date: today,
        worksheetType,
        count: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      await usageRef.update({
        count: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`[QuotaService] Usage recorded for ${userId}: ${worksheetType}`);
  } catch (error) {
    console.error('[QuotaService] Error recording usage:', error);
  }
};

/**
 * 检查用户配额
 * 返回: { canGenerate, used, limit, plan, message }
 */
export const checkQuota = async (userId: string): Promise<{
  canGenerate: boolean;
  used: number;
  limit: number;
  plan: 'Free' | 'Pro';
  message?: string;
}> => {
  // guest 用户允许生成（但不记录）
  if (!userId || userId === 'guest') {
    return {
      canGenerate: true,
      used: 0,
      limit: FREE_DAILY_LIMIT,
      plan: 'Free',
      message: 'Guest user - no tracking'
    };
  }

  try {
    const [plan, used] = await Promise.all([
      getUserPlan(userId),
      getTodayUsage(userId)
    ]);

    const limit = plan === 'Pro' ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
    const canGenerate = used < limit;

    return {
      canGenerate,
      used,
      limit,
      plan,
      message: canGenerate 
        ? undefined 
        : `Daily limit reached (${used}/${limit}). Upgrade to Pro for unlimited worksheets!`
    };
  } catch (error) {
    console.error('[QuotaService] Error checking quota:', error);
    // 出错时允许生成，避免阻塞用户
    return {
      canGenerate: true,
      used: 0,
      limit: FREE_DAILY_LIMIT,
      plan: 'Free',
      message: 'Quota check failed, allowing generation'
    };
  }
};

export default {
  getUserPlan,
  getTodayUsage,
  recordUsage,
  checkQuota,
  FREE_DAILY_LIMIT,
  PRO_DAILY_LIMIT
};
