/**
 * API Service - Connect to real backend
 */

import { generateWorksheetFromBackend } from './backendService';
import { API_BASE_URL } from '../config/api';

export interface GenerateParams {
    category: string;
    type: string;
    config: Record<string, any>;
    userId?: string;
}

export interface QuotaInfo {
    used: number;
    limit: number;
    plan: 'Free' | 'Pro';
    remaining: number;
    canGenerate?: boolean;
}

export interface GenerateResult {
    success: boolean;
    imageUrl?: string;
    imageUrls?: string[];
    data?: any;
    error?: string;
    errorCode?: string;
    quota?: QuotaInfo;
}

export const generateWorksheet = async (params: GenerateParams): Promise<GenerateResult> => {
    console.log('🎨 Generating worksheet with params:', params);

    try {
        // Call backend image generation API
        const response = await fetch(`${API_BASE_URL}/api/worksheets/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                categoryId: params.category,
                pageTypeId: params.type,
                config: params.config,
                userId: params.userId || 'guest'
            }),
        });

        const result = await response.json();

        // 处理配额超限错误
        if (!response.ok) {
            if (result.error === 'quota_exceeded') {
                return {
                    success: false,
                    error: result.message,
                    errorCode: 'quota_exceeded',
                    quota: result.quota
                };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (result.success) {
            return {
                success: true,
                data: result.data,
                imageUrl: result.data.imageUrl,
                imageUrls: result.data.imageUrls || (result.data.imageUrl ? [result.data.imageUrl] : []),
                quota: result.quota
            };
        } else {
            return {
                success: false,
                error: 'Generation failed'
            };
        }
    } catch (error) {
        console.error('❌ Generation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * 获取用户配额状态
 */
export const getQuotaStatus = async (userId: string): Promise<QuotaInfo | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/worksheets/quota?userId=${userId}`);
        const result = await response.json();
        
        if (result.success) {
            return result.quota;
        }
        return null;
    } catch (error) {
        console.error('❌ Failed to get quota status:', error);
        return null;
    }
};
