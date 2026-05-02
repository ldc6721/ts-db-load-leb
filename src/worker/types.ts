/**
 * worker types
 */

const WorkerManagerStatus = {
    READY: 'ready',
    RUNNING: 'running',
    STOPPED: 'stopped'
} as const;

type WorkerManagerStatus = typeof WorkerManagerStatus[keyof typeof WorkerManagerStatus];

export { WorkerManagerStatus };

type WorkerManagerInfo = {
    id: string;
    numWorkers: number;
    dbName: string;
    status: WorkerManagerStatus;
    durationMs: number;
    elapsedTime: number;
    accessTime: Date;
}

export type { WorkerManagerInfo };