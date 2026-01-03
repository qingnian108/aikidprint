import { Request, Response } from 'express';
import {
  validateAdminCredentials,
  generateAdminToken,
  verifyAdminToken,
  AdminRequest
} from '../middleware/adminAuth.js';

/**
 * 管理员登录
 * POST /api/admin/login
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'bad_request',
        message: 'Email and password are required'
      });
    }

    const result = await validateAdminCredentials(email, password);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'Invalid email or password'
      });
    }

    const token = generateAdminToken(email, result.role!);

    console.log(`[Admin] Login successful: ${email} (${result.role})`);

    res.json({
      success: true,
      data: {
        token,
        email,
        role: result.role,
        expiresIn: '24h'
      }
    });
  } catch (error) {
    console.error('[Admin] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Login failed'
    });
  }
};

/**
 * 管理员登出
 * POST /api/admin/logout
 */
export const adminLogout = async (req: AdminRequest, res: Response) => {
  try {
    // JWT 是无状态的，客户端只需删除 token 即可
    // 这里可以记录登出日志
    console.log(`[Admin] Logout: ${req.admin?.email}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('[Admin] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Logout failed'
    });
  }
};

/**
 * 验证管理员身份
 * GET /api/admin/verify
 */
export const adminVerify = async (req: AdminRequest, res: Response) => {
  try {
    // 如果能到达这里，说明 token 已经通过中间件验证
    res.json({
      success: true,
      data: {
        email: req.admin?.email,
        role: req.admin?.role,
        authenticated: true
      }
    });
  } catch (error) {
    console.error('[Admin] Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Verification failed'
    });
  }
};

export default {
  adminLogin,
  adminLogout,
  adminVerify
};
