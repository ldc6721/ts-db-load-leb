import { Router, type Request, type Response } from 'express';
import workerRouter from './worker.js';
import databaseRouter from './database.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
});

// worker
router.use('/api/worker', workerRouter);

// database
router.use('/api/database', databaseRouter);

export default router;
