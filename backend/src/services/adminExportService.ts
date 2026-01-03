import admin from 'firebase-admin';
import { getFirestore } from './firebaseAdmin.js';

// CSV 转义函数
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// 生成 CSV 字符�?
const generateCSV = (headers: string[], rows: any[][]): string => {
  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map(row => row.map(escapeCSV).join(','));
  return [headerLine, ...dataLines].join('\n');
};

export const exportUsers = async (): Promise<string> => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firebase not initialized');

  const usersSnapshot = await firestore.collection('users').get();
  
  const headers = ['userId', 'email', 'displayName', 'plan', 'createdAt'];
  const rows: any[][] = [];

  usersSnapshot.forEach(doc => {
    const data = doc.data();
    rows.push([
      data.userId || doc.id,
      data.email || '',
      data.displayName || '',
      data.plan || 'Free',
      data.createdAt?.toDate?.()?.toISOString() || ''
    ]);
  });

  return generateCSV(headers, rows);
};

export const exportSubscriptions = async (): Promise<string> => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firebase not initialized');

  const subscriptionsSnapshot = await firestore.collection('subscriptions').get();
  
  const headers = ['subscriptionId', 'userId', 'plan', 'status', 'startDate', 'endDate', 'autoRenew'];
  const rows: any[][] = [];

  subscriptionsSnapshot.forEach(doc => {
    const data = doc.data();
    rows.push([
      data.subscriptionId || doc.id,
      data.userId || '',
      data.plan || 'Pro',
      data.status || '',
      data.startDate?.toDate?.()?.toISOString() || '',
      data.endDate?.toDate?.()?.toISOString() || '',
      data.autoRenew ? 'true' : 'false'
    ]);
  });

  return generateCSV(headers, rows);
};

export const exportPayments = async (): Promise<string> => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firebase not initialized');

  const paymentsSnapshot = await firestore.collection('payments').get();
  
  const headers = ['paymentId', 'userId', 'amount', 'currency', 'paypalOrderId', 'status', 'createdAt'];
  const rows: any[][] = [];

  paymentsSnapshot.forEach(doc => {
    const data = doc.data();
    rows.push([
      data.paymentId || doc.id,
      data.userId || '',
      data.amount || 0,
      data.currency || 'USD',
      data.paypalOrderId || '',
      data.status || '',
      data.createdAt?.toDate?.()?.toISOString() || ''
    ]);
  });

  return generateCSV(headers, rows);
};

export const exportUsage = async (): Promise<string> => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firebase not initialized');

  const usageSnapshot = await firestore.collection('usage').get();
  
  const headers = ['usageId', 'userId', 'date', 'worksheetType', 'count'];
  const rows: any[][] = [];

  usageSnapshot.forEach(doc => {
    const data = doc.data();
    rows.push([
      data.usageId || doc.id,
      data.userId || '',
      data.date || '',
      data.worksheetType || '',
      data.count || 0
    ]);
  });

  return generateCSV(headers, rows);
};

export default { exportUsers, exportSubscriptions, exportPayments, exportUsage };
