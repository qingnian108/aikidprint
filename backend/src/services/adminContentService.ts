import admin from 'firebase-admin';
import { getFirestore } from './firebaseAdmin.js';

export interface WorksheetTypeStats {
  type: string;
  count: number;
}

export interface ThemeStats {
  theme: string;
  count: number;
}

export interface ContentStats {
  worksheetTypes: WorksheetTypeStats[];
  themes: ThemeStats[];
  totalGenerations: number;
}

export const getContentStats = async (
  startDate?: string,
  endDate?: string
): Promise<ContentStats> => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firebase not initialized');

  const usageSnapshot = await firestore.collection('usage').get();

  const worksheetTypeCounts = new Map<string, number>();
  let totalGenerations = 0;

  usageSnapshot.forEach(doc => {
    const data = doc.data();
    const date = data.date;
    
    // 日期范围过滤
    if (startDate && date < startDate) return;
    if (endDate && date > endDate) return;

    const count = data.count || 0;
    const worksheetType = data.worksheetType || 'unknown';
    
    totalGenerations += count;
    worksheetTypeCounts.set(worksheetType, (worksheetTypeCounts.get(worksheetType) || 0) + count);
  });

  // 转换为数组并排序
  const worksheetTypes: WorksheetTypeStats[] = Array.from(worksheetTypeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // 主题统计（从下载记录获取�?
  const downloadsSnapshot = await firestore.collection('downloads').get();
  const themeCounts = new Map<string, number>();

  downloadsSnapshot.forEach(doc => {
    const data = doc.data();
    const theme = data.theme || 'default';
    const downloadedAt = data.downloadedAt?.toDate?.();
    
    // 日期范围过滤
    if (startDate && downloadedAt) {
      const dateStr = downloadedAt.toISOString().split('T')[0];
      if (dateStr < startDate) return;
    }
    if (endDate && downloadedAt) {
      const dateStr = downloadedAt.toISOString().split('T')[0];
      if (dateStr > endDate) return;
    }

    themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
  });

  const themes: ThemeStats[] = Array.from(themeCounts.entries())
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count);

  return { worksheetTypes, themes, totalGenerations };
};

export const getThemeStats = async (): Promise<ThemeStats[]> => {
  const stats = await getContentStats();
  return stats.themes;
};

export default { getContentStats, getThemeStats };
