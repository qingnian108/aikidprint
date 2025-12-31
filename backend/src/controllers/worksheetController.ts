import { Request, Response } from 'express';
import { WorksheetService } from '../services/worksheetService.js';
import { imageGenerator } from '../services/imageGenerator.js';
import { historyService } from '../services/historyService.js';
import quotaService from '../services/quotaService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateWorksheet = async (req: Request, res: Response) => {
    try {
        const { categoryId, pageTypeId, config } = req.body;

        if (!categoryId || !pageTypeId) {
            return res.status(400).json({ error: 'Missing required fields: categoryId and pageTypeId' });
        }

        const worksheetService = new WorksheetService();
        const result = await worksheetService.generate(categoryId, pageTypeId, config);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error generating worksheet:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate worksheet' });
    }
};

export const generateWorksheetImage = async (req: Request, res: Response) => {
    try {
        const { categoryId, pageTypeId, config, userId = 'guest' } = req.body;

        if (!categoryId || !pageTypeId) {
            return res.status(400).json({ error: 'Missing required fields: categoryId and pageTypeId' });
        }

        // 检查用户配额
        const quotaCheck = await quotaService.checkQuota(userId);
        console.log(`[Worksheet] Quota check for ${userId}:`, quotaCheck);

        if (!quotaCheck.canGenerate) {
            return res.status(403).json({
                success: false,
                error: 'quota_exceeded',
                message: quotaCheck.message,
                quota: {
                    used: quotaCheck.used,
                    limit: quotaCheck.limit,
                    plan: quotaCheck.plan
                }
            });
        }

        const worksheetService = new WorksheetService();
        const result = await worksheetService.generate(categoryId, pageTypeId, config);

        const isBatch = Array.isArray(result.content);
        const contentArray = isBatch ? result.content : [result.content];

        const knownMultiPageTypes = [
            'cvc-words',
            'pattern-completion',
            'alphabet-order',
            'count-and-write',
            'comparison-skills',
            'picture-math',
            'symmetry',
            'doodle-borders',
            'number-grid-fill-in'
        ];

        const autoDetectedAsMultiPage = isBatch && contentArray.length > 1;
        const inKnownList = knownMultiPageTypes.includes(result.type);
        const shouldAggregate = inKnownList;

        if (autoDetectedAsMultiPage && !inKnownList) {
            console.warn(`MULTI-PAGE WARNING: Type "${result.type}" returns array but is not in knownMultiPageTypes list.`);
        }
        if (!autoDetectedAsMultiPage && inKnownList && isBatch) {
            console.warn(`MULTI-PAGE WARNING: Type "${result.type}" is in knownMultiPageTypes but content is not an array.`);
        }

        console.log(`Worksheet generation: type="${result.type}", isBatch=${isBatch}, aggregate=${shouldAggregate}, pages=${contentArray.length}`);

        const imageUrls: string[] = [];
        const imagePaths: string[] = [];

        // 使用环境变量或请求头获取基础 URL
        const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;

        if (shouldAggregate && isBatch) {
            const imageUrl = await imageGenerator.generateWorksheet(result.type, result);
            const imagePath = path.join(__dirname, '../../public', imageUrl);
            imageUrls.push(`${baseUrl}${imageUrl}`);
            imagePaths.push(imagePath);
        } else {
            const concurrency = Math.min(6, contentArray.length);
            const generateOne = async (contentItem: any) => {
                const imageUrl = await imageGenerator.generateWorksheet(result.type, contentItem);
                const imagePath = path.join(__dirname, '../../public', imageUrl);
                return { imageUrl: `${baseUrl}${imageUrl}`, imagePath };
            };

            let index = 0;
            while (index < contentArray.length) {
                const batch = contentArray.slice(index, index + concurrency);
                const batchResults = await Promise.all(batch.map(generateOne));
                batchResults.forEach(({ imageUrl, imagePath }) => {
                    imageUrls.push(imageUrl);
                    imagePaths.push(imagePath);
                });
                index += concurrency;
            }
        }

        const categoryNames: Record<string, string> = {
            'literacy': 'Letters & Literacy',
            'math': 'Numbers & Math',
            'art': 'Art & Creativity'
        };

        const historyRecord = historyService.addHistory({
            userId,
            categoryId,
            categoryName: categoryNames[categoryId] || categoryId,
            pageTypeId,
            pageTypeName: result.title,
            imageUrl: imageUrls[0],
            imagePath: imagePaths[0],
            config
        });

        // 记录使用次数（生成成功后）
        await quotaService.recordUsage(userId, pageTypeId);

        // 获取更新后的配额信息
        const updatedQuota = await quotaService.checkQuota(userId);

        res.json({
            success: true,
            data: {
                ...result,
                imageUrl: isBatch ? imageUrls : imageUrls[0],
                imageUrls,
                count: imageUrls.length,
                historyId: historyRecord.id
            },
            quota: {
                used: updatedQuota.used,
                limit: updatedQuota.limit,
                plan: updatedQuota.plan,
                remaining: updatedQuota.limit - updatedQuota.used
            }
        });
    } catch (error) {
        console.error('Error generating worksheet image:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate worksheet image' });
    }
};

export const getUserHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'guest';
        const limit = parseInt(req.query.limit as string) || 20;

        const history = historyService.getUserHistory(userId, limit);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch history' });
    }
};

export const deleteHistory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const success = historyService.deleteHistory(id);

        if (success) {
            res.json({ success: true, message: 'History deleted successfully' });
        } else {
            res.status(404).json({ success: false, error: 'History not found' });
        }
    } catch (error) {
        console.error('Error deleting history:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete history' });
    }
};


/**
 * 获取用户配额状态
 */
export const getQuotaStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'guest';
        const quota = await quotaService.checkQuota(userId);

        res.json({
            success: true,
            quota: {
                canGenerate: quota.canGenerate,
                used: quota.used,
                limit: quota.limit,
                plan: quota.plan,
                remaining: quota.limit - quota.used
            }
        });
    } catch (error) {
        console.error('Error getting quota status:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get quota status' });
    }
};
