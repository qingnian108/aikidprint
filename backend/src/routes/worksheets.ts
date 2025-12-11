import { Router } from 'express';
import { generateWorksheet, generateWorksheetImage, getUserHistory, deleteHistory } from '../controllers/worksheetController.js';

const router = Router();

// Generate worksheet data
router.post('/generate', generateWorksheet);

// Generate worksheet as image
router.post('/generate-image', generateWorksheetImage);

// Get user history
router.get('/history', getUserHistory);

// Delete history item
router.delete('/history/:id', deleteHistory);

export default router;
