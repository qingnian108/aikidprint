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

export interface SystemConfig {
  freeDailyLimit: number;
  proMonthlyPrice: number;
  cronEnabled: boolean;
  cronExpression: string;
  timezone: string;
  updatedAt?: Date;
  updatedBy?: string;
}

const DEFAULT_CONFIG: SystemConfig = {
  freeDailyLimit: 3,
  proMonthlyPrice: 4.99,
  cronEnabled: false,
  cronExpression: '0 8 * * 0',
  timezone: 'America/New_York'
};

export const getConfig = async (): Promise<SystemConfig> => {
  const firestore = getDb();
  if (!firestore) throw new Error('Firebase not initialized');

  const configDoc = await firestore.collection('systemConfig').doc('main').get();
  
  if (!configDoc.exists) {
    return DEFAULT_CONFIG;
  }

  const data = configDoc.data()!;
  return {
    freeDailyLimit: data.freeDailyLimit ?? DEFAULT_CONFIG.freeDailyLimit,
    proMonthlyPrice: data.proMonthlyPrice ?? DEFAULT_CONFIG.proMonthlyPrice,
    cronEnabled: data.cronEnabled ?? DEFAULT_CONFIG.cronEnabled,
    cronExpression: data.cronExpression ?? DEFAULT_CONFIG.cronExpression,
    timezone: data.timezone ?? DEFAULT_CONFIG.timezone,
    updatedAt: data.updatedAt?.toDate?.(),
    updatedBy: data.updatedBy
  };
};

export const updateConfig = async (
  updates: Partial<SystemConfig>,
  adminEmail: string
): Promise<{ success: boolean; config?: SystemConfig }> => {
  const firestore = getDb();
  if (!firestore) throw new Error('Firebase not initialized');

  const configRef = firestore.collection('systemConfig').doc('main');
  
  await firestore.runTransaction(async (transaction) => {
    transaction.set(configRef, {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: adminEmail
    }, { merge: true });

    const logId = `log_${Date.now()}`;
    transaction.set(firestore.collection('adminLogs').doc(logId), {
      logId,
      adminEmail,
      action: 'config_update',
      targetType: 'config',
      targetId: 'main',
      details: updates,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  const newConfig = await getConfig();
  return { success: true, config: newConfig };
};

export interface AdminLog {
  logId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  createdAt: Date;
}

export const getLogs = async (limit: number = 100): Promise<AdminLog[]> => {
  const firestore = getDb();
  if (!firestore) throw new Error('Firebase not initialized');

  const logsSnapshot = await firestore.collection('adminLogs')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  const logs: AdminLog[] = [];
  logsSnapshot.forEach(doc => {
    const data = doc.data();
    logs.push({
      logId: data.logId || doc.id,
      adminEmail: data.adminEmail,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      details: data.details,
      createdAt: data.createdAt?.toDate?.() || new Date()
    });
  });

  return logs;
};

export default { getConfig, updateConfig, getLogs };
