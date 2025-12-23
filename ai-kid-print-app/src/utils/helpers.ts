import { NativeModules, Platform } from 'react-native';

/**
 * 根据设备 locale 检测纸张大小
 * 美洲地区使用 Letter，其他地区使用 A4
 */
export const detectPaperSize = (): 'letter' | 'a4' => {
  const locale =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
      : NativeModules.I18nManager?.localeIdentifier;

  const americasLocales = ['en_US', 'en_CA', 'es_MX', 'pt_BR', 'en-US', 'en-CA', 'es-MX', 'pt-BR'];
  
  if (locale && americasLocales.some(l => locale.includes(l.replace('-', '_')) || locale.includes(l))) {
    return 'letter';
  }
  
  return 'a4';
};

/**
 * 格式化日期
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 获取当前周数
 */
export const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
};

/**
 * 生成唯一 ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 延迟函数
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 计算总页数
 */
export const calculateTotalPages = (selections: Record<string, number>): number => {
  return Object.values(selections).reduce((sum, count) => sum + count, 0);
};
