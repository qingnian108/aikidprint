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

export interface PaymentListItem {
  paymentId: string;
  userId: string;
  userEmail?: string;
  amount: number;
  currency: string;
  paypalOrderId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getPayments = async (
  page: number = 1,
  pageSize: number = 20,
  status?: 'pending' | 'completed' | 'failed',
  search?: string
): Promise<PaginatedResult<PaymentListItem>> => {
  const firestore = getDb();
  if (!firestore) throw new Error('Firebase not initialized');

  let query: admin.firestore.Query = firestore.collection('payments');
  if (status) {
    query = query.where('status', '==', status);
  }

  const paymentsSnapshot = await query.get();

  // 获取用户邮箱映射
  const usersSnapshot = await firestore.collection('users').get();
  const userEmailMap = new Map<string, string>();
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    userEmailMap.set(data.userId || doc.id, data.email || '');
  });

  let payments: PaymentListItem[] = [];
  paymentsSnapshot.forEach(doc => {
    const data = doc.data();
    payments.push({
      paymentId: data.paymentId || doc.id,
      userId: data.userId,
      userEmail: userEmailMap.get(data.userId) || '',
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      paypalOrderId: data.paypalOrderId || '',
      status: data.status || 'pending',
      createdAt: data.createdAt?.toDate?.() || new Date()
    });
  });

  // 搜索过滤
  if (search) {
    const searchLower = search.toLowerCase();
    payments = payments.filter(p =>
      p.userEmail?.toLowerCase().includes(searchLower) ||
      p.paypalOrderId.toLowerCase().includes(searchLower)
    );
  }

  // 按创建时间倒序
  payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // 分页
  const total = payments.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = payments.slice(startIndex, startIndex + pageSize);

  return { items, total, page, pageSize, totalPages };
};

export default { getPayments };
