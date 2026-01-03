import { Response } from 'express';
import { AdminRequest } from '../middleware/adminAuth.js';
import adminContentService from '../services/adminContentService.js';

export const getContentStats = async (req: AdminRequest, res: Response) => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const stats = await adminContentService.getContentStats(startDate, endDate);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('[AdminContent] Get content stats error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to get content stats' });
  }
};

export const getThemeStats = async (req: AdminRequest, res: Response) => {
  try {
    const themes = await adminContentService.getThemeStats();
    res.json({ success: true, data: themes });
  } catch (error) {
    console.error('[AdminContent] Get theme stats error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to get theme stats' });
  }
};

export default { getContentStats, getThemeStats };
