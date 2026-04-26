import { Router, Request, Response } from 'express';
import { createWorkerManager } from '../worker/index.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    // TO-DO: worker 정보 제공
    res.status(200).json({ message: 'Worker info' });
});

router.post('/', (req: Request, res: Response) => {
    const { numWorkers, dbName } = req.body;

    if (!Number.isInteger(numWorkers) || numWorkers <= 0) {
        return res.status(400).json({ message: 'Invalid number of workers' });
    }
    else if (typeof dbName !== 'string' || dbName.trim() === '') {
        return res.status(400).json({ message: 'Invalid database name' });
    }

    const workerManager = createWorkerManager(numWorkers, dbName);
    res.status(201).json({ message: 'Worker created', workerManagerId: workerManager.id });
});

router.put('/', (req: Request, res: Response) => {
    // TO-DO: worker 업데이트
    res.status(200).json({ message: 'Worker updated' });
});

router.delete('/', (req: Request, res: Response) => {
    // TO-DO: worker 중지.
    res.status(200).json({ message: 'Worker stopped' });
});

export default router;