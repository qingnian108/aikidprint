/**
 * Backend API Service
 * Used to call local backend for worksheet generation
 */

import { API_BASE_URL } from '../config/api';

const BACKEND_URL = `${API_BASE_URL}/api`;

export interface WorksheetConfig {
  categoryId: 'literacy' | 'math' | 'art';
  pageTypeId: string;
  config: Record<string, any>;
}

export interface WorksheetResponse {
  success: boolean;
  data: {
    title: string;
    type: string;
    content: any;
  };
}

/**
 * 调用后端生成工作表
 */
export async function generateWorksheetFromBackend(
  config: WorksheetConfig
): Promise<WorksheetResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/worksheets/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('调用后端 API 失败:', error);
    throw error;
  }
}

// ==================== 快捷方法 ====================

/**
 * 生成数数练习
 */
export async function generateCountAndWrite(range: '1-5' | '1-10' = '1-5', theme: 'animals' | 'vehicles' | 'fruits' = 'animals') {
  return generateWorksheetFromBackend({
    categoryId: 'math',
    pageTypeId: 'count-and-write',
    config: { range, theme }
  });
}

/**
 * 生成连点成画
 */
export async function generateConnectDots(maxNumber: '10' | '20' | '50' = '10') {
  return generateWorksheetFromBackend({
    categoryId: 'math',
    pageTypeId: 'connect-dots',
    config: { maxNumber }
  });
}

/**
 * 生成数字描红
 */
export async function generateNumberTracing(range: '0-4' | '5-9' = '0-4', theme: 'dinosaur' | 'ocean' | 'space' | 'unicorn' | 'vehicles' | 'safari' = 'dinosaur') {
  return generateWorksheetFromBackend({
    categoryId: 'math',
    pageTypeId: 'number-tracing',
    config: { range, theme }
  });
}

