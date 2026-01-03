import { Response } from 'express';
import { AdminRequest } from '../middleware/adminAuth.js';
import adminExportService from '../services/adminExportService.js';

export const exportUsers = async (req: AdminRequest, res: Response) => {
  try {
    const csv = await adminExportService.exportUsers();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (error) {
    console.error('[AdminExport] Export users error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to export users' });
  }
};

export const exportSubscriptions = async (req: AdminRequest, res: Response) => {
  try {
    const csv = await adminExportService.exportSubscriptions();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subscriptions.csv');
    res.send(csv);
  } catch (error) {
    console.error('[AdminExport] Export subscriptions error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to export subscriptions' });
  }
};

export const exportPayments = async (req: AdminRequest, res: Response) => {
  try {
    const csv = await adminExportService.exportPayments();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
    res.send(csv);
  } catch (error) {
    console.error('[AdminExport] Export payments error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to export payments' });
  }
};

export const exportUsage = async (req: AdminRequest, res: Response) => {
  try {
    const csv = await adminExportService.exportUsage();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=usage.csv');
    res.send(csv);
  } catch (error) {
    console.error('[AdminExport] Export usage error:', error);
    res.status(500).json({ success: false, error: 'server_error', message: 'Failed to export usage' });
  }
};

export default { exportUsers, exportSubscriptions, exportPayments, exportUsage };
