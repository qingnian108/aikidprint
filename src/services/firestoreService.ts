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
  deleteDoc,
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
    const limit = userData?.plan === 'Pro' ? 999999 : 3; // Pro无限制，Free每天3次

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
    const limit = userData?.plan === 'Pro' ? 999999 : 3; // Pro无限制，Free每天3次

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
  // 新增：用于重新生成
  category?: string;
  type?: string;
  config?: Record<string, any>;
}

// 本地存储 key
const LOCAL_DOWNLOADS_KEY = 'local_downloads';

/**
 * 获取本地下载记录
 */
const getLocalDownloads = (userId: string): { downloadId: string; timestamp: number }[] => {
  try {
    const data = localStorage.getItem(`${LOCAL_DOWNLOADS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * 保存本地下载记录
 */
const saveLocalDownload = (userId: string, downloadId: string) => {
  try {
    const downloads = getLocalDownloads(userId);
    downloads.push({ downloadId, timestamp: Date.now() });
    localStorage.setItem(`${LOCAL_DOWNLOADS_KEY}_${userId}`, JSON.stringify(downloads));
    console.log('💾 本地下载记录已保存');
  } catch (e) {
    console.error('本地存储失败:', e);
  }
};

/**
 * 记录下载
 */
export const recordDownload = async (
  userId: string,
  childName: string,
  theme: string,
  pageCount: number,
  packId?: string,
  generatorInfo?: { category: string; type: string; config: Record<string, any> }
) => {
  const downloadId = `dl_${userId}_${Date.now()}`;
  const timestamp = Date.now();
  
  // 先保存到本地存储（确保即使 Firestore 失败也有记录）
  saveLocalDownload(userId, downloadId);
  
  // 同时保存完整的下载详情到本地
  saveLocalDownloadDetails(userId, {
    downloadId,
    userId,
    packId: packId || undefined,
    childName,
    theme,
    pageCount,
    downloadedAt: timestamp,
    category: generatorInfo?.category,
    type: generatorInfo?.type,
    config: generatorInfo?.config
  });
  
  try {
    const downloadRef = doc(db, 'downloads', downloadId);

    await setDoc(downloadRef, {
      downloadId,
      userId,
      packId: packId || null,
      childName,
      theme,
      pageCount,
      downloadedAt: serverTimestamp(),
      category: generatorInfo?.category || null,
      type: generatorInfo?.type || null,
      config: generatorInfo?.config || null
    });

    console.log('✅ 下载记录创建成功:', downloadId);
    
    // 清理旧的单张下载记录，只保留最近 10 条
    if (!packId) {
      await cleanupOldSingleWorksheets(userId);
    }
    
    return downloadId;
  } catch (error: any) {
    console.error('❌ 创建下载记录失败:', error);
    console.error('错误代码:', error?.code);
    console.error('错误消息:', error?.message);
    // 不抛出错误，因为本地已经保存了
    return downloadId;
  }
};

/**
 * 清理用户的旧单张下载记录，只保留最近 10 条
 */
const cleanupOldSingleWorksheets = async (userId: string) => {
  try {
    const downloadsRef = collection(db, 'downloads');
    // 查询该用户所有没有 packId 的记录（单张下载）
    const q = query(
      downloadsRef,
      where('userId', '==', userId),
      where('packId', '==', null)
    );
    
    const querySnapshot = await getDocs(q);
    const records: { id: string; downloadedAt: any }[] = [];
    
    querySnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        downloadedAt: doc.data().downloadedAt
      });
    });
    
    // 按时间排序（最新的在前）
    records.sort((a, b) => {
      const timeA = a.downloadedAt?.toDate?.()?.getTime() || 0;
      const timeB = b.downloadedAt?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    });
    
    // 删除超过 10 条的旧记录
    if (records.length > MAX_SINGLE_WORKSHEETS_PER_USER) {
      const toDelete = records.slice(MAX_SINGLE_WORKSHEETS_PER_USER);
      
      for (const record of toDelete) {
        try {
          await deleteDoc(doc(db, 'downloads', record.id));
          console.log('🗑️ 删除旧下载记录:', record.id);
        } catch (e) {
          console.error('删除记录失败:', e);
        }
      }
      
      console.log(`✅ 清理了 ${toDelete.length} 条旧的单张下载记录`);
    }
  } catch (error) {
    console.error('❌ 清理旧记录失败:', error);
    // 不抛出错误，清理失败不影响主流程
  }
};

/**
 * 获取用户下载统计
 */
export const getUserDownloadStats = async (userId: string): Promise<{
  totalDownloads: number;
  thisWeekDownloads: number;
}> => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // 本周日
  startOfWeek.setHours(0, 0, 0, 0);

  // 先获取本地记录
  const localDownloads = getLocalDownloads(userId);
  let localTotal = localDownloads.length;
  let localThisWeek = localDownloads.filter(d => d.timestamp >= startOfWeek.getTime()).length;

  try {
    const downloadsRef = collection(db, 'downloads');
    const q = query(downloadsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    let firestoreTotal = 0;
    let firestoreThisWeek = 0;

    querySnapshot.forEach((doc) => {
      firestoreTotal++;
      const data = doc.data();
      if (data.downloadedAt) {
        const downloadDate = data.downloadedAt.toDate();
        if (downloadDate >= startOfWeek) {
          firestoreThisWeek++;
        }
      }
    });

    console.log('📊 Firestore 统计:', { firestoreTotal, firestoreThisWeek });
    console.log('📊 本地统计:', { localTotal, localThisWeek });

    // 使用较大的值（Firestore 和本地的最大值）
    const totalDownloads = Math.max(firestoreTotal, localTotal);
    const thisWeekDownloads = Math.max(firestoreThisWeek, localThisWeek);

    return { totalDownloads, thisWeekDownloads };
  } catch (error: any) {
    console.error('❌ 获取 Firestore 下载统计失败:', error);
    console.error('错误代码:', error?.code);
    // 如果 Firestore 失败，返回本地统计
    console.log('📊 使用本地统计:', { localTotal, localThisWeek });
    return { totalDownloads: localTotal, thisWeekDownloads: localThisWeek };
  }
};

/**
 * 获取完整的本地下载记录（包含详细信息）
 */
const LOCAL_DOWNLOAD_DETAILS_KEY = 'local_download_details';

const getLocalDownloadDetails = (userId: string): DownloadRecord[] => {
  try {
    const data = localStorage.getItem(`${LOCAL_DOWNLOAD_DETAILS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// 每个用户最多保留的 Single Worksheet 记录数量
const MAX_SINGLE_WORKSHEETS_PER_USER = 10;

/**
 * 保存完整的本地下载记录
 */
const saveLocalDownloadDetails = (userId: string, record: Omit<DownloadRecord, 'downloadedAt'> & { downloadedAt: number }) => {
  try {
    const records = getLocalDownloadDetails(userId);
    records.unshift(record as any);
    // 只保留最近 10 条（不含 packId 的单张下载）
    const singleWorksheets = records.filter(r => !r.packId);
    const packDownloads = records.filter(r => r.packId);
    const trimmedSingles = singleWorksheets.slice(0, MAX_SINGLE_WORKSHEETS_PER_USER);
    const trimmed = [...trimmedSingles, ...packDownloads].sort((a, b) => {
      const timeA = (a as any).downloadedAt || 0;
      const timeB = (b as any).downloadedAt || 0;
      return timeB - timeA;
    });
    localStorage.setItem(`${LOCAL_DOWNLOAD_DETAILS_KEY}_${userId}`, JSON.stringify(trimmed));
    console.log('💾 本地下载详情已保存，单张记录数:', trimmedSingles.length);
  } catch (e) {
    console.error('本地存储失败:', e);
  }
};

/**
 * 获取用户所有下载记录（用于显示历史）
 */
export const getUserDownloadRecords = async (userId: string): Promise<DownloadRecord[]> => {
  // 先获取本地记录
  const localRecords = getLocalDownloadDetails(userId);
  console.log('📊 本地下载记录:', localRecords.length);

  try {
    const downloadsRef = collection(db, 'downloads');
    const q = query(downloadsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const firestoreRecords: DownloadRecord[] = [];
    querySnapshot.forEach((doc) => {
      firestoreRecords.push(doc.data() as DownloadRecord);
    });

    console.log('📊 Firestore 下载记录:', firestoreRecords.length);

    // 合并记录，去重（以 downloadId 为准）
    const allRecords = [...firestoreRecords];
    const existingIds = new Set(firestoreRecords.map(r => r.downloadId));
    
    for (const localRecord of localRecords) {
      if (!existingIds.has(localRecord.downloadId)) {
        allRecords.push(localRecord);
      }
    }

    // 按时间倒序排列
    allRecords.sort((a, b) => {
      const timeA = a.downloadedAt?.toDate?.()?.getTime() || (a.downloadedAt as any) || 0;
      const timeB = b.downloadedAt?.toDate?.()?.getTime() || (b.downloadedAt as any) || 0;
      return timeB - timeA;
    });

    return allRecords;
  } catch (error) {
    console.error('❌ 获取 Firestore 下载记录失败:', error);
    // 如果 Firestore 失败，返回本地记录
    return localRecords;
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


// ========== Weekly Delivery 设置管理 ==========

export interface WeeklyDeliverySettings {
  userId: string;
  enabled: boolean;
  deliveryMethod: 'email' | 'manual';
  deliveryTime: string; // HH:mm 格式
  timezone: string;
  childName: string;
  childAge: string;
  theme: string;
  email: string;
  updatedAt: Timestamp;
}

/**
 * 保存 Weekly Delivery 设置
 */
export const saveWeeklyDeliverySettings = async (
  userId: string,
  settings: Omit<WeeklyDeliverySettings, 'userId' | 'updatedAt'>
) => {
  try {
    const settingsRef = doc(db, 'weeklyDeliverySettings', userId);
    
    await setDoc(settingsRef, {
      userId,
      ...settings,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Weekly Delivery 设置保存成功:', userId);
    return true;
  } catch (error) {
    console.error('❌ 保存 Weekly Delivery 设置失败:', error);
    throw error;
  }
};

/**
 * 获取 Weekly Delivery 设置
 */
export const getWeeklyDeliverySettings = async (userId: string): Promise<WeeklyDeliverySettings | null> => {
  try {
    const settingsRef = doc(db, 'weeklyDeliverySettings', userId);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return settingsSnap.data() as WeeklyDeliverySettings;
    }
    return null;
  } catch (error) {
    console.error('❌ 获取 Weekly Delivery 设置失败:', error);
    return null;
  }
};

/**
 * 获取所有启用了 Weekly Delivery 的用户设置（用于后端定时任务）
 */
export const getAllEnabledWeeklyDeliverySettings = async (): Promise<WeeklyDeliverySettings[]> => {
  try {
    const settingsRef = collection(db, 'weeklyDeliverySettings');
    const q = query(settingsRef, where('enabled', '==', true));
    const querySnapshot = await getDocs(q);

    const settings: WeeklyDeliverySettings[] = [];
    querySnapshot.forEach((doc) => {
      settings.push(doc.data() as WeeklyDeliverySettings);
    });

    return settings;
  } catch (error) {
    console.error('❌ 获取所有 Weekly Delivery 设置失败:', error);
    return [];
  }
};


// ========== Print Settings 管理 ==========

export interface PrintSettings {
  userId: string;
  printMode: 'color' | 'eco';
  paperSize: 'letter' | 'a4';
  binderReady: boolean;
  updatedAt: Timestamp;
}

// 本地存储 key
const LOCAL_PRINT_SETTINGS_KEY = 'print_settings';

/**
 * 获取本地打印设置
 */
const getLocalPrintSettings = (): Partial<PrintSettings> | null => {
  try {
    const data = localStorage.getItem(LOCAL_PRINT_SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * 保存本地打印设置
 */
const saveLocalPrintSettings = (settings: Partial<PrintSettings>) => {
  try {
    localStorage.setItem(LOCAL_PRINT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('本地存储失败:', e);
  }
};

/**
 * 保存 Print Settings
 */
export const savePrintSettings = async (
  userId: string,
  settings: Omit<PrintSettings, 'userId' | 'updatedAt'>
) => {
  // 先保存到本地
  saveLocalPrintSettings({ ...settings, userId });
  
  try {
    const settingsRef = doc(db, 'printSettings', userId);
    
    await setDoc(settingsRef, {
      userId,
      ...settings,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Print Settings 保存成功:', userId);
    return true;
  } catch (error) {
    console.error('❌ 保存 Print Settings 失败:', error);
    // 本地已保存，不抛出错误
    return true;
  }
};

/**
 * 获取 Print Settings
 */
export const getPrintSettings = async (userId: string): Promise<PrintSettings | null> => {
  // 先尝试从本地获取
  const localSettings = getLocalPrintSettings();
  
  try {
    const settingsRef = doc(db, 'printSettings', userId);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      const firestoreSettings = settingsSnap.data() as PrintSettings;
      // 同步到本地
      saveLocalPrintSettings(firestoreSettings);
      return firestoreSettings;
    }
    
    // Firestore 没有，返回本地设置
    if (localSettings) {
      return localSettings as PrintSettings;
    }
    
    return null;
  } catch (error) {
    console.error('❌ 获取 Print Settings 失败:', error);
    // 返回本地设置
    return localSettings as PrintSettings | null;
  }
};

/**
 * 根据用户时区检测是否使用 A4 纸张
 * 欧洲、亚洲、非洲、大洋洲使用 A4，美洲使用 Letter
 */
const detectPaperSizeByTimezone = (): 'a4' | 'letter' => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // 美洲时区使用 Letter（美国、加拿大、墨西哥等）
    const letterTimezones = [
      'America/', 'US/', 'Canada/', 'Pacific/Honolulu'
    ];
    const isLetterRegion = letterTimezones.some(tz => timezone.startsWith(tz));
    return isLetterRegion ? 'letter' : 'a4';
  } catch {
    return 'letter'; // 默认 Letter
  }
};

/**
 * 获取默认打印设置
 * 根据用户时区自动选择纸张大小：欧洲/亚洲用 A4，美洲用 Letter
 */
export const getDefaultPrintSettings = (): Omit<PrintSettings, 'userId' | 'updatedAt'> => {
  return {
    printMode: 'color',
    paperSize: detectPaperSizeByTimezone(),
    binderReady: false
  };
};
