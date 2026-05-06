import { Router, Request, Response } from 'express';
import { getDistribution } from '../database/index.js';

const router = Router();

/**
 * GET /api/database/:dbName
 */
router.get('/:dbName', async (req: Request, res: Response) => {
    const { dbName } = req.params;

    try {
        const distribution = await getDistribution(Array.isArray(dbName) ? dbName[0] : dbName);
        res.status(200).json(distribution);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching database distribution', error });
    }
});

export default router;