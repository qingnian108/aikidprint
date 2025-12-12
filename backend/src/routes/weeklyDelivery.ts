import express from 'express';
import { triggerWeeklyDeliveryManually } from '../services/cronService.js';

const router = express.Router();

/**
 * POST /api/weekly-delivery/trigger
 * 手动触发 Weekly Delivery（用于测试）
 */
router.post('/trigger', async (req, res) => {
  try {
    // 可以添加管理员验证
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('[WeeklyDelivery] Manual trigger requested');
    
    const result = await triggerWeeklyDeliveryManually();
    
    res.json(result);
  } catch (error) {
    console.error('Error triggering weekly delivery:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger weekly delivery',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/weekly-delivery/status
 * 获取 Weekly Delivery 服务状态
 */
router.get('/status', (_req, res) => {
  res.json({
    enabled: process.env.ENABLE_CRON === 'true',
    cronExpression: process.env.WEEKLY_DELIVERY_CRON || '0 8 * * 0',
    timezone: process.env.TIMEZONE || 'America/New_York',
    smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS)
  });
});

export default router;
