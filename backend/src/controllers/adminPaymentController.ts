import { Response } from 'express';
import { AdminRequest } from '../middleware/adminAuth.js';
import adminPaymentService from '../services/adminPaymentService.js';

export const getPayments = async (req: AdminRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const status = req.query.status as 'pending' | 'completed' | 'failed' | undefined;
    const search = req.query.search as string | undefined;

    const result = await adminPaymentService.getPayments(page, pageSize, status, search);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AdminPayment] Get payments error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to get payments' });
  }
};

export default { getPayments };
