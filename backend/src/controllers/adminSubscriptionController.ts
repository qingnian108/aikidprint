import { Response } from 'express';
import { AdminRequest } from '../middleware/adminAuth.js';
import adminSubscriptionService from '../services/adminSubscriptionService.js';

export const getSubscriptions = async (req: AdminRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const search = req.query.search as string | undefined;
    const status = (req.query.status as 'active' | 'all') || 'active';

    const result = await adminSubscriptionService.getSubscriptions(page, pageSize, search, status);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AdminSubscription] Get subscriptions error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to get subscriptions' });
  }
};

export const extendSubscription = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { additionalDays = 30 } = req.body;
    const adminEmail = req.admin?.email || 'unknown';

    const result = await adminSubscriptionService.extendSubscription(id, adminEmail, additionalDays);
    if (!result.success) {
      return res.status(400).json({ success: false, error: 'operation_failed', message: result.message });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AdminSubscription] Extend subscription error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to extend subscription' });
  }
};

export const cancelSubscription = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminEmail = req.admin?.email || 'unknown';

    const result = await adminSubscriptionService.cancelSubscription(id, adminEmail);
    if (!result.success) {
      return res.status(400).json({ success: false, error: 'operation_failed', message: result.message });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AdminSubscription] Cancel subscription error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to cancel subscription' });
  }
};

export default { getSubscriptions, extendSubscription, cancelSubscription };
