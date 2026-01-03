import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: admin.firestore.Firestore | null = null;

const initializeFirebase = (): admin.firestore.Firestore | null => {
  if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      return null;
    }
  }
  return admin.firestore();
};

const getDb = (): admin.firestore.Firestore | null => {
  if (!db) db = initializeFirebase();
  return db;
};

// ========== 类型定义 ==========

export interface SubscriptionListItem {
  subscriptionId: string;
  userId: string;
  userEmail?: string;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ========== 订阅列表 ==========

export const getSubscriptions = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  status: 'active' | 'all' = 'active'
): Promise<PaginatedResult<SubscriptionListItem>> => {
  const firestore = getDb();
  if (!firestore) throw new Error('Firebase not initialized');

  // 获取订阅
  let query: admin.firestore.Query = firestore.collection('subscriptions');
  if (status === 'active') {
    query = query.where('status', '==', 'active');
  }
  
  const subscriptionsSnapshot = await query.get();
  
  // 获取用户邮箱映射
  const usersSnapshot = await firestore.collection('users').get();
  const userEmailMap = new Map<string, string>();
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    userEmailMap.set(data.userId || doc.id, data.email || '');
  });

  let subscriptions: SubscriptionListItem[] = [];
  subscriptionsSnapshot.forEach(doc => {
    const data = doc.data();
    const userEmail = userEmailMap.get(data.userId) || '';
    subscriptions.push({
      subscriptionId: data.subscriptionId || doc.id,
      userId: data.userId,
      userEmail,
      plan: data.plan || 'Pro',
      status: data.status,
      startDate: data.startDate?.toDate?.() || new Date(),
      endDate: data.endDate?.toDate?.() || new Date(),
      autoRenew: data.autoRenew || false
    });
  });

  // 搜索过滤
  if (search) {
    const searchLower = search.toLowerCase();
    subscriptions = subscriptions.filter(sub =>
      sub.userEmail?.toLowerCase().includes(searchLower) ||
      sub.subscriptionId.toLowerCase().includes(searchLower)
    );
  }

  // 按结束日期倒序
  subscriptions.sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

  // 分页
  const total = subscriptions.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = subscriptions.slice(startIndex, startIndex + pageSize);

  return { items, total, page, pageSize, totalPages };
};

// ========== 延期订阅 ==========

export const extendSubscription = async (
  subscriptionId: string,
  adminEmail: string,
  additionalDays: number = 30
): Promise<{ success: boolean; newEndDate?: Date; message?: string }> => {
  const firestore = getDb();
  if (!firestore) throw new Error('Firebase not initialized');

  const subDoc = await firestore.collection('subscriptions').doc(subscriptionId).get();
  if (!subDoc.exists) {
    return { success: false, message: 'Subscription not found' };
  }

  const subData = subDoc.data()!;
  const currentEndDate = subData.endDate?.toDate?.() || new Date();
  const newEndDate = new Date(currentEndDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

  await firestore.runTransaction(async (transaction) => {
    transaction.update(subDoc.ref, {
      endDate: admin.firestore.Timestamp.fromDate(newEndDate),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const logId = `log_${Date.now()}`;
    transaction.set(firestore.collection('adminLogs').doc(logId), {
      logId,
      adminEmail,
      action: 'subscription_extend',
      targetType: 'subscription',
      targetId: subscriptionId,
      details: { previousEndDate: currentEndDate, newEndDate, additionalDays },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  console.log(`[AdminSubscription] Extended ${subscriptionId} by ${additionalDays} days`);
  return { success: true, newEndDate };
};

// ========== 取消订阅 ==========

export const cancelSubscription = async (
  subscriptionId: string,
  adminEmail: string
): Promise<{ success: boolean; message?: string }> => {
  const firestore = getDb();
  if (!firestore) throw new Error('Firebase not initialized');

  const subDoc = await firestore.collection('subscriptions').doc(subscriptionId).get();
  if (!subDoc.exists) {
    return { success: false, message: 'Subscription not found' };
  }

  const subData = subDoc.data()!;
  const userId = subData.userId;

  await firestore.runTransaction(async (transaction) => {
    // 取消订阅
    transaction.update(subDoc.ref, {
      status: 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelledBy: adminEmail
    });

    // 更新用户计划为 Free
    const userRef = firestore.collection('users').doc(userId);
    transaction.update(userRef, {
      plan: 'Free',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const logId = `log_${Date.now()}`;
    transaction.set(firestore.collection('adminLogs').doc(logId), {
      logId,
      adminEmail,
      action: 'subscription_cancel',
      targetType: 'subscription',
      targetId: subscriptionId,
      details: { userId },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  console.log(`[AdminSubscription] Cancelled ${subscriptionId}`);
  return { success: true };
};

export default { getSubscriptions, extendSubscription, cancelSubscription };
