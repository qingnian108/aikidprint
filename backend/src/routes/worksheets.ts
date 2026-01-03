import { Router } from 'express';
import { generateWorksheet, generateWorksheetImage, getUserHistory, deleteHistory, getQuotaStatus } from '../controllers/worksheetController.js';
import { generateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Generate worksheet data (限流：每分钟 10 次)
router.post('/generate', generateLimiter, generateWorksheet);

// Generate worksheet as image (限流：每分钟 10 次)
router.post('/generate-image', generateLimiter, generateWorksheetImage);

// Get user quota status
router.get('/quota', getQuotaStatus);

// Get user history
router.get('/history', getUserHistory);

// Delete history item
router.delete('/history/:id', deleteHistory);

export default router;
