import { Router } from 'express';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';
import { adminLogin, adminLogout, adminVerify } from '../controllers/adminController.js';
import { loginLimiter, adminLimiter } from '../middleware/rateLimiter.js';
import {
  getStatsOverview,
  getUserGrowthStats,
  getUsageStats,
  getRevenueStats
} from '../controllers/adminStatsController.js';
import {
  getUsers,
  getUserDetail,
  updateUserPlan,
  getUserUsage
} from '../controllers/adminUserController.js';
import {
  getSubscriptions,
  extendSubscription,
  cancelSubscription
} from '../controllers/adminSubscriptionController.js';
import { getPayments } from '../controllers/adminPaymentController.js';
import { getContentStats, getThemeStats } from '../controllers/adminContentController.js';
import { getDeliverySettings, triggerDelivery, getDeliveryHistory } from '../controllers/adminDeliveryController.js';
import { getConfig, updateConfig, getLogs } from '../controllers/adminConfigController.js';
import { exportUsers, exportSubscriptions, exportPayments, exportUsage } from '../controllers/adminExportController.js';

const router = Router();

// Admin API 全局限流
router.use(adminLimiter);

// ========== 认证相关 ==========
router.post('/login', loginLimiter, adminLogin); // 登录接口额外限流防暴力破解
router.post('/logout', adminAuthMiddleware, adminLogout);
router.get('/verify', adminAuthMiddleware, adminVerify);

// ========== 统计相关 ==========
router.get('/stats/overview', adminAuthMiddleware, getStatsOverview);
router.get('/stats/users', adminAuthMiddleware, getUserGrowthStats);
router.get('/stats/usage', adminAuthMiddleware, getUsageStats);
router.get('/stats/revenue', adminAuthMiddleware, getRevenueStats);

// ========== 用户管理 ==========
router.get('/users', adminAuthMiddleware, getUsers);
router.get('/users/:id', adminAuthMiddleware, getUserDetail);
router.put('/users/:id/plan', adminAuthMiddleware, updateUserPlan);
router.get('/users/:id/usage', adminAuthMiddleware, getUserUsage);

// ========== 订阅管理 ==========
router.get('/subscriptions', adminAuthMiddleware, getSubscriptions);
router.put('/subscriptions/:id/extend', adminAuthMiddleware, extendSubscription);
router.put('/subscriptions/:id/cancel', adminAuthMiddleware, cancelSubscription);

// ========== 支付管理 ==========
router.get('/payments', adminAuthMiddleware, getPayments);

// ========== 内容统计 ==========
router.get('/content/stats', adminAuthMiddleware, getContentStats);
router.get('/content/themes', adminAuthMiddleware, getThemeStats);

// ========== Weekly Delivery 管理 ==========
router.get('/delivery/settings', adminAuthMiddleware, getDeliverySettings);
router.post('/delivery/trigger', adminAuthMiddleware, triggerDelivery);
router.get('/delivery/history', adminAuthMiddleware, getDeliveryHistory);

// ========== 系统配置 ==========
router.get('/config', adminAuthMiddleware, getConfig);
router.put('/config', adminAuthMiddleware, updateConfig);
router.get('/logs', adminAuthMiddleware, getLogs);

// ========== 数据导出 ==========
router.get('/export/users', adminAuthMiddleware, exportUsers);
router.get('/export/subscriptions', adminAuthMiddleware, exportSubscriptions);
router.get('/export/payments', adminAuthMiddleware, exportPayments);
router.get('/export/usage', adminAuthMiddleware, exportUsage);

export default router;
