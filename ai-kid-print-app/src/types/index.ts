// 用户类型
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  plan: 'Free' | 'Pro';
}

// 主题类型
export interface Theme {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// 年龄组类型
export interface AgeGroup {
  value: string;
  label: string;
  icon: string;
}

// 生成的页面类型
export interface GeneratedPage {
  order: number;
  type: string;
  title: string;
  imageUrl: string;
}

// Pack 数据类型
export interface PackData {
  packId: string;
  childName: string;
  age: string;
  theme: string;
  weekNumber?: number;
  pages: GeneratedPage[];
  createdAt: string;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 下载历史类型
export interface DownloadHistory {
  id: string;
  packId: string;
  packType: 'weekly' | 'custom';
  childName: string;
  theme: string;
  pageCount: number;
  downloadedAt: string;
}

// 用户统计类型
export interface UserStats {
  totalDownloads: number;
  weeklyDownloads: number;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  icon: string;
  pageTypes: PageType[];
}

// 页面类型
export interface PageType {
  id: string;
  name: string;
  description: string;
}

// 选择状态类型
export type Selections = Record<string, number>;
