import { Router, Request, Response } from 'express';
import workerRouter from './worker.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
});

router.get('/', (req: Request, res: Response) => {
    // TO-DO: index.html 제공
    res.status(200).json({ message: 'Hello, World!' });
});

// worker
router.use('/api/worker', workerRouter);

export default router;