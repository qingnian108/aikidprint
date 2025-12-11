import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

// 类型定义
export interface UserData {
  userId: string;
  email: string;
  displayName?: string;
  plan: 'Free' | 'Pro';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  plan: 'Pro';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Timestamp;
  endDate: Timestamp;
  autoRenew: boolean;
}

export interface Payment {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  paypalOrderId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
}

export interface Usage {
  usageId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  worksheetType: string;
  count: number;
  limit: number;
}

// ========== 用户管理 ==========

/**
 * 创建或更新用户信息
 */
export const createOrUpdateUser = async (userId: string, email: string, displayName?: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // 新用户，创建记录
      await setDoc(userRef, {
        userId,
        email,
        displayName: displayName || email.split('@')[0],
        plan: 'Free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ 新用户创建成功:', userId);
    } else {
      // 已存在，更新信息
      await updateDoc(userRef, {
        email,
        displayName: displayName || userSnap.data().displayName,
        updatedAt: serverTimestamp()
      });
      console.log('✅ 用户信息更新成功:', userId);
    }
  } catch (error) {
    console.error('❌ 创建/更新用户失败:', error);
    throw error;
  }
};

/**
 * 获取用户信息
 */
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    throw error;
  }
};

/**
 * 更新用户订阅计划
 */
export const updateUserPlan = async (userId: string, plan: 'Free' | 'Pro') => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      plan,
      updatedAt: serverTimestamp()
    });
    console.log('✅ 用户计划更新成功:', userId, plan);
  } catch (error) {
    console.error('❌ 更新用户计划失败:', error);
    throw error;
  }
};

// ========== 订阅管理 ==========

/**
 * 创建订阅记录
 */
export const createSubscription = async (
  userId: string,
  paypalOrderId: string,
  durationDays: number = 30
) => {
  try {
    const subscriptionId = `sub_${userId}_${Date.now()}`;
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);

    const now = new Date();
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await setDoc(subscriptionRef, {
      subscriptionId,
      userId,
      plan: 'Pro',
      status: 'active',
      startDate: Timestamp.fromDate(now),
      endDate: Timestamp.fromDate(endDate),
      autoRenew: false,
      paypalOrderId
    });

    // 同时更新用户计划
    await updateUserPlan(userId, 'Pro');

    console.log('✅ 订阅创建成功:', subscriptionId);
    return subscriptionId;
  } catch (error) {
    console.error('❌ 创建订阅失败:', error);
    throw error;
  }
};

/**
 * 获取用户当前订阅
 */
export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data() as Subscription;
    }
    
    return null;
  } catch (error) {
    console.error('❌ 获取订阅信息失败:', error);
    throw error;
  }
};

// ========== 支付记录 ==========

/**
 * 创建支付记录
 */
export const createPayment = async (
  userId: string,
  amount: number,
  currency: string,
  paypalOrderId: string,
  status: 'pending' | 'completed' | 'failed' = 'pending'
) => {
  try {
    const paymentId = `pay_${userId}_${Date.now()}`;
    const paymentRef = doc(db, 'payments', paymentId);

    await setDoc(paymentRef, {
      paymentId,
      userId,
      amount,
      currency,
      paypalOrderId,
      status,
      createdAt: serverTimestamp()
    });

    console.log('✅ 支付记录创建成功:', paymentId);
    return paymentId;
  } catch (error) {
    console.error('❌ 创建支付记录失败:', error);
    throw error;
  }
};

/**
 * 更新支付状态
 */
export const updatePaymentStatus = async (
  paymentId: string,
  status: 'completed' | 'failed'
) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      status,
      updatedAt: serverTimestamp()
    });
    console.log('✅ 支付状态更新成功:', paymentId, status);
  } catch (error) {
    console.error('❌ 更新支付状态失败:', error);
    throw error;
  }
};

// ========== 使用配额管理 ==========

/**
 * 记录用户使用次数
 */
export const recordUsage = async (
  userId: string,
  worksheetType: string
) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const usageId = `${userId}_${today}`;
    const usageRef = doc(db, 'usage', usageId);
    const usageSnap = await getDoc(usageRef);

    // 获取用户计划
    const userData = await getUserData(userId);
    const limit = userData?.plan === 'Pro' ? 999999 : 1; // Pro无限制，Free每天1次

    if (!usageSnap.exists()) {
      // 今天第一次使用
      await setDoc(usageRef, {
        usageId,
        userId,
        date: today,
        worksheetType,
        count: 1,
        limit
      });
    } else {
      // 增加使用次数
      const currentCount = usageSnap.data().count || 0;
      await updateDoc(usageRef, {
        count: currentCount + 1
      });
    }

    console.log('✅ 使用记录更新成功:', usageId);
  } catch (error) {
    console.error('❌ 记录使用失败:', error);
    throw error;
  }
};

/**
 * 检查用户今日配额
 */
export const checkDailyQuota = async (userId: string): Promise<{ canUse: boolean; used: number; limit: number }> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const usageId = `${userId}_${today}`;
    const usageRef = doc(db, 'usage', usageId);
    const usageSnap = await getDoc(usageRef);

    // 获取用户计划
    const userData = await getUserData(userId);
    const limit = userData?.plan === 'Pro' ? 999999 : 1;

    if (!usageSnap.exists()) {
      // 今天还没使用过
      return { canUse: true, used: 0, limit };
    }

    const used = usageSnap.data().count || 0;
    const canUse = used < limit;

    return { canUse, used, limit };
  } catch (error) {
    console.error('❌ 检查配额失败:', error);
    throw error;
  }
};


// ========== 下载记录管理 ==========

export interface DownloadRecord {
  downloadId: string;
  userId: string;
  packId?: string;
  childName: string;
  theme: string;
  pageCount: number;
  downloadedAt: Timestamp;
}

/**
 * 记录下载
 */
export const recordDownload = async (
  userId: string,
  childName: string,
  theme: string,
  pageCount: number,
  packId?: string
) => {
  try {
    const downloadId = `dl_${userId}_${Date.now()}`;
    const downloadRef = doc(db, 'downloads', downloadId);

    await setDoc(downloadRef, {
      downloadId,
      userId,
      packId: packId || null,
      childName,
      theme,
      pageCount,
      downloadedAt: serverTimestamp()
    });

    console.log('✅ 下载记录创建成功:', downloadId);
    return downloadId;
  } catch (error) {
    console.error('❌ 创建下载记录失败:', error);
    throw error;
  }
};

/**
 * 获取用户下载统计
 */
export const getUserDownloadStats = async (userId: string): Promise<{
  totalDownloads: number;
  thisWeekDownloads: number;
}> => {
  try {
    const downloadsRef = collection(db, 'downloads');
    const q = query(downloadsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // 本周日
    startOfWeek.setHours(0, 0, 0, 0);

    let totalDownloads = 0;
    let thisWeekDownloads = 0;

    querySnapshot.forEach((doc) => {
      totalDownloads++;
      const data = doc.data();
      if (data.downloadedAt) {
        const downloadDate = data.downloadedAt.toDate();
        if (downloadDate >= startOfWeek) {
          thisWeekDownloads++;
        }
      }
    });

    return { totalDownloads, thisWeekDownloads };
  } catch (error) {
    console.error('❌ 获取下载统计失败:', error);
    return { totalDownloads: 0, thisWeekDownloads: 0 };
  }
};

// ========== 孩子档案管理 ==========

export interface ChildProfile {
  childId: string;
  userId: string;
  name: string;
  age: string;
  favoriteTheme: string;
  avatar: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 获取用户的孩子列表
 */
export const getUserChildren = async (userId: string): Promise<ChildProfile[]> => {
  try {
    const childrenRef = collection(db, 'children');
    const q = query(childrenRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const children: ChildProfile[] = [];
    querySnapshot.forEach((doc) => {
      children.push(doc.data() as ChildProfile);
    });

    return children;
  } catch (error) {
    console.error('❌ 获取孩子列表失败:', error);
    return [];
  }
};

/**
 * 添加孩子档案
 */
export const addChild = async (
  userId: string,
  name: string,
  age: string,
  favoriteTheme: string
): Promise<string> => {
  try {
    const childId = `child_${userId}_${Date.now()}`;
    const childRef = doc(db, 'children', childId);

    await setDoc(childRef, {
      childId,
      userId,
      name,
      age,
      favoriteTheme,
      avatar: '👶',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ 孩子档案创建成功:', childId);
    return childId;
  } catch (error) {
    console.error('❌ 创建孩子档案失败:', error);
    throw error;
  }
};

/**
 * 更新孩子档案
 */
export const updateChild = async (
  childId: string,
  updates: Partial<{ name: string; age: string; favoriteTheme: string }>
) => {
  try {
    const childRef = doc(db, 'children', childId);
    await updateDoc(childRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('✅ 孩子档案更新成功:', childId);
  } catch (error) {
    console.error('❌ 更新孩子档案失败:', error);
    throw error;
  }
};

/**
 * 删除孩子档案
 */
export const deleteChild = async (childId: string) => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const childRef = doc(db, 'children', childId);
    await deleteDoc(childRef);
    console.log('✅ 孩子档案删除成功:', childId);
  } catch (error) {
    console.error('❌ 删除孩子档案失败:', error);
    throw error;
  }
};

/**
 * 获取用户 Dashboard 统计数据
 */
export const getDashboardStats = async (userId: string): Promise<{
  totalDownloads: number;
  thisWeekDownloads: number;
  childrenCount: number;
}> => {
  try {
    const [downloadStats, children] = await Promise.all([
      getUserDownloadStats(userId),
      getUserChildren(userId)
    ]);

    return {
      totalDownloads: downloadStats.totalDownloads,
      thisWeekDownloads: downloadStats.thisWeekDownloads,
      childrenCount: children.length
    };
  } catch (error) {
    console.error('❌ 获取 Dashboard 统计失败:', error);
    return { totalDownloads: 0, thisWeekDownloads: 0, childrenCount: 0 };
  }
};
