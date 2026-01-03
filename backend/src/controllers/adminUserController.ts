import { Response } from 'express';
import { AdminRequest } from '../middleware/adminAuth.js';
import adminUserService from '../services/adminUserService.js';

/**
 * 获取用户列表
 * GET /api/admin/users?page=1&pageSize=20&search=xxx
 */
export const getUsers = async (req: AdminRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const search = req.query.search as string | undefined;

    const result = await adminUserService.getUsers(page, pageSize, search);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[AdminUser] Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to get users'
    });
  }
};

/**
 * 获取用户详情
 * GET /api/admin/users/:id
 */
export const getUserDetail = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await adminUserService.getUserDetail(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('[AdminUser] Get user detail error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to get user detail'
    });
  }
};

/**
 * 更新用户计划
 * PUT /api/admin/users/:id/plan
 * Body: { plan: 'Pro' | 'Free', durationDays?: number }
 */
export const updateUserPlan = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { plan, durationDays = 30 } = req.body;

    if (!plan || !['Pro', 'Free'].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'bad_request',
        message: 'Invalid plan. Must be "Pro" or "Free"'
      });
    }

    const adminEmail = req.admin?.email || 'unknown';

    let result;
    if (plan === 'Pro') {
      result = await adminUserService.upgradeUserToPro(id, adminEmail, durationDays);
    } else {
      result = await adminUserService.downgradeUserToFree(id, adminEmail);
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'operation_failed',
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[AdminUser] Update user plan error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to update user plan'
    });
  }
};

/**
 * 获取用户使用历史
 * GET /api/admin/users/:id/usage?days=30
 */
export const getUserUsage = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const usage = await adminUserService.getUserUsageHistory(id, days);

    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('[AdminUser] Get user usage error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to get user usage'
    });
  }
};

export default {
  getUsers,
  getUserDetail,
  updateUserPlan,
  getUserUsage
};
