/**
 * API Service - 连接到真实后端
 */

import { generateWorksheetFromBackend } from './backendService';

export interface GenerateParams {
    category: string;
    type: string;
    config: Record<string, any>;
}

export interface GenerateResult {
    success: boolean;
    imageUrl?: string;
    imageUrls?: string[];
    data?: any;
    error?: string;
}

export const generateWorksheet = async (params: GenerateParams): Promise<GenerateResult> => {
    console.log('🎨 Generating worksheet with params:', params);

    try {
        // 调用后端图片生成 API
        const response = await fetch('http://localhost:3000/api/worksheets/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                categoryId: params.category,
                pageTypeId: params.type,
                config: params.config
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                data: result.data,
                imageUrl: result.data.imageUrl,
                imageUrls: result.data.imageUrls || (result.data.imageUrl ? [result.data.imageUrl] : [])
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
