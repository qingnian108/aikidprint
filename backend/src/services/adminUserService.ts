import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化 Firebase Admin
let db: admin.firestore.Firestore | null = null;

const initializeFirebase = (): admin.firestore.Firestore | null => {
  if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.error('❌ [AdminUser] firebase-service-account.json not found');
      return null;
    }
  }
  return admin.firestore();
};

const getDb = (): admin.firestore.Firestore | null => {
  if (!db) {
    db = initializeFirebase();
  }
  return db;
};

// ========== 类型定义 ==========

export interface UserListItem {
  userId: string;
  email: string;
  displayName?: string;
  plan: 'Free' | 'Pro';
  createdAt: Date;
}

export interface UserDetail extends UserListItem {
  subscription?: {
    subscriptionId: string;
    status: string;
    startDate: Date;
    endDate: Date;
  };
  children: Array<{
    childId: string;
    name: string;
    age: string;
    favoriteTheme: string;
  }>;
  recentUsage: Array<{
    date: string;
    count: number;
  }>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ========== 用户列表 ==========

/**
 * 获取用户列表（分页）
 */
export const getUsers = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<PaginatedResult<UserListItem>> => {
  const firestore = getDb();
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  // 获取所有用户
  const usersSnapshot = await firestore.collection('users').get();
  
  let users: UserListItem[] = [];
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    users.push({
      userId: data.userId || doc.id,
      email: data.email || '',
      displayName: data.displayName,
      plan: data.plan || 'Free',
      createdAt: data.createdAt?.toDate?.() || new Date()
    });
  });

  // 搜索过滤
  if (search) {
    const searchLower = search.toLowerCase();
    users = users.filter(user => 
      user.email.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower)
    );
  }

  // 按创建时间倒序排列
  users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // 分页
  const total = users.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = users.slice(startIndex, startIndex + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages
  };
};

// ========== 用户详情 ==========

/**
 * 获取用户详情
 */
export const getUserDetail = async (userId: string): Promise<UserDetail | null> => {
  const firestore = getDb();
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  // 获取用户基本信息
  const userDoc = await firestore.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return null;
  }

  const userData = userDoc.data()!;
  
  // 获取订阅信息
  const subscriptionsSnapshot = await firestore.collection('subscriptions')
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  let subscription: UserDetail['subscription'] | undefined;
  if (!subscriptionsSnapshot.empty) {
    const subData = subscriptionsSnapshot.docs[0].data();
    subscription = {
      subscriptionId: subData.subscriptionId,
      status: subData.status,
      startDate: subData.startDate?.toDate?.() || new Date(),
      endDate: subData.endDate?.toDate?.() || new Date()
    };
  }

  // 获取孩子档案
  const childrenSnapshot = await firestore.collection('children')
    .where('userId', '==', userId)
    .get();

  const children: UserDetail['children'] = [];
  childrenSnapshot.forEach(doc => {
    const data = doc.data();
    children.push({
      childId: data.childId || doc.id,
      name: data.name || '',
      age: data.age || '',
      favoriteTheme: data.favoriteTheme || ''
    });
  });

  // 获取最近 30 天的使用记录
  const now = new Date();
  const recentUsage: UserDetail['recentUsage'] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const usageDoc = await firestore.collection('usage').doc(`${userId}_${dateStr}`).get();
    recentUsage.push({
      date: dateStr,
      count: usageDoc.exists ? (usageDoc.data()?.count || 0) : 0
    });
  }

  return {
    userId: userData.userId || userDoc.id,
    email: userData.email || '',
    displayName: userData.displayName,
    plan: userData.plan || 'Free',
    createdAt: userData.createdAt?.toDate?.() || new Date(),
    subscription,
    children,
    recentUsage
  };
};

// ========== 更新用户计划 ==========

/**
 * 升级用户到 Pro
 */
export const upgradeUserToPro = async (
  userId: string,
  adminEmail: string,
  durationDays: number = 30
): Promise<{ success: boolean; subscriptionId?: string; message?: string }> => {
  const firestore = getDb();
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  // 检查用户是否存在
  const userDoc = await firestore.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return { success: false, message: 'User not found' };
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const subscriptionId = `sub_${userId}_${Date.now()}`;

  // 使用事务确保一致性
  await firestore.runTransaction(async (transaction) => {
    // 更新用户计划
    transaction.update(firestore.collection('users').doc(userId), {
      plan: 'Pro',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 创建订阅记录
    transaction.set(firestore.collection('subscriptions').doc(subscriptionId), {
      subscriptionId,
      userId,
      plan: 'Pro',
      status: 'active',
      startDate: admin.firestore.Timestamp.fromDate(now),
      endDate: admin.firestore.Timestamp.fromDate(endDate),
      autoRenew: false,
      createdBy: adminEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 记录管理员操作日志
    const logId = `log_${Date.now()}`;
    transaction.set(firestore.collection('adminLogs').doc(logId), {
      logId,
      adminEmail,
      action: 'user_upgrade',
      targetType: 'user',
      targetId: userId,
      details: {
        newPlan: 'Pro',
        subscriptionId,
        durationDays
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  console.log(`[AdminUser] User ${userId} upgraded to Pro by ${adminEmail}`);
  return { success: true, subscriptionId };
};

/**
 * 降级用户到 Free
 */
export const downgradeUserToFree = async (
  userId: string,
  adminEmail: string
): Promise<{ success: boolean; message?: string }> => {
  const firestore = getDb();
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  // 检查用户是否存在
  const userDoc = await firestore.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return { success: false, message: 'User not found' };
  }

  // 获取活跃订阅
  const subscriptionsSnapshot = await firestore.collection('subscriptions')
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .get();

  // 使用事务确保一致性
  await firestore.runTransaction(async (transaction) => {
    // 更新用户计划
    transaction.update(firestore.collection('users').doc(userId), {
      plan: 'Free',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 取消所有活跃订阅
    subscriptionsSnapshot.forEach(doc => {
      transaction.update(doc.ref, {
        status: 'cancelled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        cancelledBy: adminEmail
      });
    });

    // 记录管理员操作日志
    const logId = `log_${Date.now()}`;
    transaction.set(firestore.collection('adminLogs').doc(logId), {
      logId,
      adminEmail,
      action: 'user_downgrade',
      targetType: 'user',
      targetId: userId,
      details: {
        newPlan: 'Free',
        cancelledSubscriptions: subscriptionsSnapshot.size
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  console.log(`[AdminUser] User ${userId} downgraded to Free by ${adminEmail}`);
  return { success: true };
};

// ========== 用户使用历史 ==========

/**
 * 获取用户使用历史
 */
export const getUserUsageHistory = async (
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; count: number; worksheetType?: string }>> => {
  const firestore = getDb();
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  const now = new Date();
  const result: Array<{ date: string; count: number; worksheetType?: string }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const usageDoc = await firestore.collection('usage').doc(`${userId}_${dateStr}`).get();
    
    if (usageDoc.exists) {
      const data = usageDoc.data()!;
      result.push({
        date: dateStr,
        count: data.count || 0,
        worksheetType: data.worksheetType
      });
    } else {
      result.push({
        date: dateStr,
        count: 0
      });
    }
  }

  return result;
};

export default {
  getUsers,
  getUserDetail,
  upgradeUserToPro,
  downgradeUserToFree,
  getUserUsageHistory
};
