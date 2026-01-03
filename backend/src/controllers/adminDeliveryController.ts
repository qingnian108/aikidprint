import { Response } from 'express';
import { AdminRequest } from '../middleware/adminAuth.js';
import adminDeliveryService from '../services/adminDeliveryService.js';

export const getDeliverySettings = async (req: AdminRequest, res: Response) => {
  try {
    const settings = await adminDeliveryService.getDeliverySettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('[AdminDelivery] Get settings error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to get delivery settings' });
  }
};

export const triggerDelivery = async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'bad_request', message: 'userId is required' });
    }

    const adminEmail = req.admin?.email || 'unknown';
    const result = await adminDeliveryService.triggerDelivery(userId, adminEmail);
    
    if (!result.success) {
      return res.status(400).json({ success: false, error: 'operation_failed', message: result.message });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AdminDelivery] Trigger delivery error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to trigger delivery' });
  }
};

export const getDeliveryHistory = async (req: AdminRequest, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await adminDeliveryService.getDeliveryHistory(userId, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('[AdminDelivery] Get history error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to get delivery history' });
  }
};

export default { getDeliverySettings, triggerDelivery, getDeliveryHistory };
