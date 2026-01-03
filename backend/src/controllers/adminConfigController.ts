import { Response } from 'express';
import { AdminRequest } from '../middleware/adminAuth.js';
import adminConfigService from '../services/adminConfigService.js';

export const getConfig = async (req: AdminRequest, res: Response) => {
  try {
    const config = await adminConfigService.getConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('[AdminConfig] Get config error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to get config' });
  }
};

export const updateConfig = async (req: AdminRequest, res: Response) => {
  try {
    const updates = req.body;
    const adminEmail = req.admin?.email || 'unknown';

    const result = await adminConfigService.updateConfig(updates, adminEmail);
    res.json({ success: true, data: result.config });
  } catch (error) {
    console.error('[AdminConfig] Update config error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to update config' });
  }
};

export const getLogs = async (req: AdminRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await adminConfigService.getLogs(limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('[AdminConfig] Get logs error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to get logs' });
  }
};

export default { getConfig, updateConfig, getLogs };
