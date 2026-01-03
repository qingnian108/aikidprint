import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化 Firebase Admin（如果还没初始化）
let db: admin.firestore.Firestore | null = null;

const initializeFirebase = (): admin.firestore.Firestore | null => {
  if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ [AdminStats] Firebase Admin initialized');
    } else {
      console.error('❌ [AdminStats] firebase-service-account.json not found');
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

// ========== 概览统计 ==========

export interface OverviewStats {
  totalUsers: number;
  activeProSubscribers: number;
  todayGenerations: number;
  monthlyRevenue: number;
}

/**
 * 获取概览统计数据
 */
export const getOverviewStats = async (): Promise<OverviewStats> => {
  const firestore = getDb();
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 并行获取所有统计
  const [
    usersSnapshot,
    subscriptionsSnapshot,
    usageSnapshot,
    paymentsSnapshot
  ] = await Promise.all([
    // 总用户数
    firestore.collection('users').get(),
    // 活跃 Pro 订阅
    firestore.collection('subscriptions')
      .where('status', '==', 'active')
      .get(),
    // 今日使用量
    firestore.collection('usage')
      .where('date', '==', today)
      .get(),
    // 本月支付
    firestore.collection('payments')
      .where('status', '==', 'completed')
      .get()
  ]);

  // 计算总用户数
  const totalUsers = usersSnapshot.size;

  // 计算活跃 Pro 订阅（检查 endDate > now）
  let activeProSubscribers = 0;
  subscriptionsSnapshot.forEach(doc => {
    const data = doc.data();
    const endDate = data.endDate?.toDate?.();
    if (endDate && endDate > now) {
      activeProSubscribers++;
    }
  });

  // 计算今日生成量
  let todayGenerations = 0;
  usageSnapshot.forEach(doc => {
    const data = doc.data();
    todayGenerations += data.count || 0;
  });

  // 计算本月收入
  let monthlyRevenue = 0;
  paymentsSnapshot.forEach(doc => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.();
    if (createdAt && createdAt >= monthStart) {
      monthlyRevenue += data.amount || 0;
    }
  });

  return {
    totalUsers,
    activeProSubscribers,
    todayGenerations,
    monthlyRevenue
  };
};

// ========== 用户增长统计 ==========

export interface UserGrowthData {
  date: string;
  count: number;
  cumulative: number;
}

/**
 * 获取过去 N 天的用户增长数据
 */
export const getUserGrowthStats = async (days: number = 30): Promise<UserGrowthData[]> => {
  const firestore = getDb();
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  const usersSnapshot = await firestore.collection('users').get();
  
  // 按日期统计用户注册
  const dailyCounts: Map<string, number> = new Map();
  const now = new Date();
  
  // 初始化过去 N 天的日期
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyCounts.set(dateStr, 0);
  }

  // 统计每天的新用户
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.();
    if (createdAt) {
      const dateStr = createdAt.toISOString().split('T')[0];
      if (dailyCounts.has(dateStr)) {
        dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + 1);
      }
    }
  });

  // 转换为数组并计算累计
  const result: UserGrowthData[] = [];
  let cumulative = 0;
  
  // 计算起始日期之前的用户数
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.();
    if (createdAt && createdAt < startDate) {
      cumulative++;
    }
  });

  dailyCounts.forEach((count, date) => {
    cumulative += count;
    result.push({ date, count, cumulative });
  });

  return result;
};

// ========== 使用量统计 ==========

export interface UsageData {
  date: string;
  count: number;
  byCategory?: Record<string, number>;
}

/**
 * 获取过去 N 天的使用量统计
 */
export const getUsageStats = async (days: number = 7): Promise<UsageData[]> => {
  const firestore = getDb();
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  const now = new Date();
  const dates: string[] = [];
  
  // 生成日期列表
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  // 获取这些日期的使用记录
  const usageSnapshot = await firestore.collection('usage').get();
  
  // 按日期汇总
  const dailyUsage: Map<string, { count: number; byCategory: Record<string, number> }> = new Map();
  dates.forEach(date => {
    dailyUsage.set(date, { count: 0, byCategory: {} });
  });

  usageSnapshot.forEach(doc => {
    const data = doc.data();
    const date = data.date;
    if (dailyUsage.has(date)) {
      const current = dailyUsage.get(date)!;
      current.count += data.count || 0;
      
      // 按类型统计
      const worksheetType = data.worksheetType || 'unknown';
      current.byCategory[worksheetType] = (current.byCategory[worksheetType] || 0) + (data.count || 0);
    }
  });

  // 转换为数组
  return dates.map(date => {
    const data = dailyUsage.get(date)!;
    return {
      date,
      count: data.count,
      byCategory: data.byCategory
    };
  });
};

// ========== 收入统计 ==========

export interface RevenueData {
  month: string;
  revenue: number;
  transactions: number;
}

/**
 * 获取过去 N 个月的收入统计
 */
export const getRevenueStats = async (months: number = 6): Promise<RevenueData[]> => {
  const firestore = getDb();
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  const paymentsSnapshot = await firestore.collection('payments')
    .where('status', '==', 'completed')
    .get();

  // 按月份汇总
  const monthlyRevenue: Map<string, { revenue: number; transactions: number }> = new Map();
  
  // 初始化过去 N 个月
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue.set(monthStr, { revenue: 0, transactions: 0 });
  }

  // 统计每月收入
  paymentsSnapshot.forEach(doc => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.();
    if (createdAt) {
      const monthStr = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyRevenue.has(monthStr)) {
        const current = monthlyRevenue.get(monthStr)!;
        current.revenue += data.amount || 0;
        current.transactions++;
      }
    }
  });

  // 转换为数组
  const result: RevenueData[] = [];
  monthlyRevenue.forEach((data, month) => {
    result.push({
      month,
      revenue: data.revenue,
      transactions: data.transactions
    });
  });

  return result;
};

export default {
  getOverviewStats,
  getUserGrowthStats,
  getUsageStats,
  getRevenueStats
};
