import { Router, Request, Response } from 'express';
import { createWorkerManager, getWorkerManagerList, updateWorkerManager, startWorkerManager, stopWorkerManager, cleanWorkerManager, deleteWorkerManager } from '../worker/index.js';

const router = Router();

/**
 * GET /api/worker
 * Response: []
 */
router.get('/', (req: Request, res: Response) => {
    const workerManagers = getWorkerManagerList();
    res.status(200).json(workerManagers);
});

/**
 * POST /api/worker
 * Request Body: { numWorkers: number, dbName: string, duration: number }
 * Response: { message: string, workerManagerId: string }
 */
router.post('/', (req: Request, res: Response) => {
    const { numWorkers, dbName, duration } = req.body;

    if (!Number.isInteger(numWorkers) || numWorkers <= 0) {
        return res.status(400).json({ message: 'Invalid number of workers' });
    }
    else if (typeof dbName !== 'string' || dbName.trim() === '') {
        return res.status(400).json({ message: 'Invalid database name' });
    }
    else if (!Number.isInteger(duration) || duration <= 0) {
        return res.status(400).json({ message: 'Invalid duration' });
    }

    // worker 생성 및 시작
    const workerManager = createWorkerManager(numWorkers, dbName, duration);

    res.status(201).json({ message: 'Worker created', workerManagerId: workerManager.id });
});

/**
 * PUT /api/worker
 * Request Body: { workerManagerId: string, numWorkers: number, dbName: string, duration: number }
 * Response: { message: string }
 */
router.put('/', async (req: Request, res: Response) => {
    const { workerManagerId, numWorkers, dbName, duration } = req.body;

    if (typeof workerManagerId !== 'string' || workerManagerId.trim() === '') {
        return res.status(400).json({ message: 'Invalid worker manager ID' });
    }
    else if (!Number.isInteger(numWorkers) || numWorkers <= 0) {
        return res.status(400).json({ message: 'Invalid number of workers' });
    }
    else if (typeof dbName !== 'string' || dbName.trim() === '') {
        return res.status(400).json({ message: 'Invalid database name' });
    }
    else if (!Number.isInteger(duration) || duration <= 0) {
        return res.status(400).json({ message: 'Invalid duration' });
    }
    
    const success = await updateWorkerManager(workerManagerId, numWorkers, dbName, duration);
    if (!success) {
        return res.status(404).json({ message: 'Worker manager not found' });
    }

    res.status(200).json({ message: 'Worker updated' });
});

/**
 * PUT /api/worker/start
 * Request Body: { workerManagerId: string }
 * Response: { message: string }
 * worker manager 시작
 */
router.put('/start', (req: Request, res: Response) => {
    const { workerManagerId } = req.body;

    if (typeof workerManagerId !== 'string' || workerManagerId.trim() === '') {
        return res.status(400).json({ message: 'Invalid worker manager ID' });
    }

    const success = startWorkerManager(workerManagerId);
    if (!success) {
        return res.status(404).json({ message: 'Worker manager not found' });
    }

    res.status(200).json({ message: 'Worker started' });
});

/**
 * PUT /api/worker/stop
 * Request Body: { workerManagerId: string }
 * Response: { message: string }
 * worker manager 중지
 */
router.put('/stop', (req: Request, res: Response) => {
    const { workerManagerId } = req.body;
    
    if (typeof workerManagerId !== 'string' || workerManagerId.trim() === '') {
        return res.status(400).json({ message: 'Invalid worker manager ID' });
    }

    const success = stopWorkerManager(workerManagerId);
    if (!success) {
        return res.status(404).json({ message: 'Worker manager not found' });
    }

    res.status(200).json({ message: 'Worker stopped' });
});

/**
 * PUT /api/worker/clean
 * Request Body: { workerManagerId: string }
 * Response: { message: string }
 * worker manager 리소스 정리
 */
router.put('/clean', async (req: Request, res: Response) => {
    const { workerManagerId } = req.body;

    if (typeof workerManagerId !== 'string' || workerManagerId.trim() === '') {
        return res.status(400).json({ message: 'Invalid worker manager ID' });
    }

    const success = await cleanWorkerManager(workerManagerId);
    if (!success) {
        return res.status(404).json({ message: 'Worker manager not found' });
    }
    
    res.status(200).json({ message: 'Worker cleaned' });
});

/**
 * DELETE /api/worker
 * Request Body: { workerManagerId: string }
 * Response: { message: string }
 * worker manager 삭제
 */
router.delete('/', async (req: Request, res: Response) => {
    const { workerManagerId } = req.body;

    if (typeof workerManagerId !== 'string' || workerManagerId.trim() === '') {
        return res.status(400).json({ message: 'Invalid worker manager ID' });
    }
    
    const success = await deleteWorkerManager(workerManagerId);
    if (!success) {
        return res.status(404).json({ message: 'Worker manager not found' });
    }

    res.status(200).json({ message: 'Worker deleted' });
});

export default router;
