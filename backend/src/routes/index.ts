import { Router } from 'express';
import worksheetRoutes from './worksheets.js';
import weeklyPackRoutes from './weeklyPack.js';

const router = Router();

// Example route
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from AI Kid Print API!' });
});

// Worksheet generation routes
router.use('/worksheets', worksheetRoutes);

// Weekly pack routes
router.use('/weekly-pack', weeklyPackRoutes);

export default router;
