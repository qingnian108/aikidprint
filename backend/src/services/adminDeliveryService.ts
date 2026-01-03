import admin from 'firebase-admin';
import { getFirestore } from './firebaseAdmin.js';

export interface DeliverySettings {
  userId: string;
  userEmail?: string;
  enabled: boolean;
  deliveryMethod: 'email' | 'manual';
  deliveryTime: string;
  timezone: string;
  childName: string;
  childAge: string;
  theme: string;
  email: string;
}

export interface DeliveryHistory {
  deliveryId: string;
  userId: string;
  status: 'success' | 'failed';
  pageCount: number;
  deliveredAt: Date;
  error?: string;
}

export const getDeliverySettings = async (): Promise<DeliverySettings[]> => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firebase not initialized');

  const settingsSnapshot = await firestore.collection('weeklyDeliverySettings')
    .where('enabled', '==', true)
    .get();

  // 获取用户邮箱映射
  const usersSnapshot = await firestore.collection('users').get();
  const userEmailMap = new Map<string, string>();
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    userEmailMap.set(data.userId || doc.id, data.email || '');
  });

  const settings: DeliverySettings[] = [];
  settingsSnapshot.forEach(doc => {
    const data = doc.data();
    settings.push({
      userId: data.userId || doc.id,
      userEmail: userEmailMap.get(data.userId || doc.id) || data.email,
      enabled: data.enabled,
      deliveryMethod: data.deliveryMethod || 'manual',
      deliveryTime: data.deliveryTime || '08:00',
      timezone: data.timezone || 'America/New_York',
      childName: data.childName || '',
      childAge: data.childAge || '',
      theme: data.theme || 'dinosaur',
      email: data.email || ''
    });
  });

  return settings;
};

export const triggerDelivery = async (
  userId: string,
  adminEmail: string
): Promise<{ success: boolean; message?: string }> => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firebase not initialized');

  // 获取用户的推送设�?
  const settingsDoc = await firestore.collection('weeklyDeliverySettings').doc(userId).get();
  if (!settingsDoc.exists) {
    return { success: false, message: 'Delivery settings not found for this user' };
  }

  // 这里应该调用实际的推送逻辑
  // 由于推送逻辑�?cronService 中，这里只记录触�?
  const logId = `log_${Date.now()}`;
  await firestore.collection('adminLogs').doc(logId).set({
    logId,
    adminEmail,
    action: 'delivery_trigger',
    targetType: 'delivery',
    targetId: userId,
    details: { manual: true },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`[AdminDelivery] Manual delivery triggered for ${userId} by ${adminEmail}`);
  return { success: true, message: 'Delivery triggered successfully' };
};

export const getDeliveryHistory = async (
  userId?: string,
  limit: number = 50
): Promise<DeliveryHistory[]> => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firebase not initialized');

  // �?adminLogs 获取推送历�?
  let query: admin.firestore.Query = firestore.collection('adminLogs')
    .where('action', 'in', ['delivery_trigger', 'weekly_delivery_success', 'weekly_delivery_failed']);
  
  if (userId) {
    query = query.where('targetId', '==', userId);
  }

  const logsSnapshot = await query.limit(limit).get();

  const history: DeliveryHistory[] = [];
  logsSnapshot.forEach(doc => {
    const data = doc.data();
    history.push({
      deliveryId: doc.id,
      userId: data.targetId,
      status: data.action.includes('failed') ? 'failed' : 'success',
      pageCount: data.details?.pageCount || 0,
      deliveredAt: data.createdAt?.toDate?.() || new Date(),
      error: data.details?.error
    });
  });

  return history.sort((a, b) => b.deliveredAt.getTime() - a.deliveredAt.getTime());
};

export default { getDeliverySettings, triggerDelivery, getDeliveryHistory };
