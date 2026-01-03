import { Response } from 'express';
import { AdminRequest } from '../middleware/adminAuth.js';
import adminStatsService from '../services/adminStatsService.js';

/**
 * 获取概览统计
 * GET /api/admin/stats/overview
 */
export const getStatsOverview = async (req: AdminRequest, res: Response) => {
  try {
    const stats = await adminStatsService.getOverviewStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[AdminStats] Overview error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to get overview stats'
    });
  }
};

/**
 * 获取用户增长统计
 * GET /api/admin/stats/users?days=30
 */
export const getUserGrowthStats = async (req: AdminRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await adminStatsService.getUserGrowthStats(days);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[AdminStats] User growth error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to get user growth stats'
    });
  }
};

/**
 * 获取使用量统计
 * GET /api/admin/stats/usage?days=7
 */
export const getUsageStats = async (req: AdminRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await adminStatsService.getUsageStats(days);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[AdminStats] Usage error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to get usage stats'
    });
  }
};

/**
 * 获取收入统计
 * GET /api/admin/stats/revenue?months=6
 */
export const getRevenueStats = async (req: AdminRequest, res: Response) => {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const stats = await adminStatsService.getRevenueStats(months);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[AdminStats] Revenue error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to get revenue stats'
    });
  }
};

export default {
  getStatsOverview,
  getUserGrowthStats,
  getUsageStats,
  getRevenueStats
};
