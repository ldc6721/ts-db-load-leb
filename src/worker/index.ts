/**
 * worker business code
 */

import { randomUUID } from 'node:crypto';

const WorkerManagerStatus = {
    READY: 'ready',
    RUNNING: 'running',
    STOPPED: 'stopped'
} as const;

type WorkerManagerStatus = typeof WorkerManagerStatus[keyof typeof WorkerManagerStatus];


class Worker {
    dbName: string;

    constructor(dbName: string) {
        this.dbName = dbName;
    }
}

class WorkerManager {
    id: string;
    workers: Worker[] = [];
    numWorkers: number;
    dbName: string;
    status: WorkerManagerStatus;

    /**
     * worker process
     * @param numWorkers 
     * @param dbName 
     */
    constructor(numWorkers: number, dbName: string) {
        this.id = randomUUID();
        this.workers = [];
        this.numWorkers = numWorkers;
        this.dbName = dbName;
        this.status = WorkerManagerStatus.READY;

        // create worker
        this.createWorkers();
    }

    // public methods
    /**
     * start all 
     */
    start: () => void = () => {
        // TO-DO: worker start
    }

    /**
     * stop all
     */
    stop: () => void = () => {
        // TO-DO: worker stop
    }

    /**
     * clean all worker resources
     */
    clean: () => void = () => {
        for (const worker of this.workers) {
            // worker 리소스 정리
            // worker.clean();
        }

        this.workers = [];
    }

    /**
     * get worker status
     * @returns worker 상태 반환
     */
    getStatus: () => object = () => {
        // TO-DO: worker 상태 반환
        return {
            workers: [],
            status: this.status
        };
    }

    // private methods
    /**
     * create workers
     */
    private createWorkers: () => void = () => {
        // worker 생성 전, 이전 worker가 존재한다면 중지
        if (this.workers.length > 0) {
            this.stop();
            this.clean();
        }

        // worker 생성
        for (let i = 0; i < this.numWorkers; i++) {
            const worker = new Worker(this.dbName);
            this.workers.push(worker);
        }
    }
}

const workerManagerMap: Map<string, WorkerManager> = new Map();

/**
 * worker manager 생성
 * @param numWorkers 
 * @param dbName 
 * @returns 
 */
export function createWorkerManager(numWorkers: number, dbName: string): WorkerManager {
    const workerManager = new WorkerManager(numWorkers, dbName);

    // workerManager 접근을 위해, local 객체에 저장
    workerManagerMap.set(workerManager.id, workerManager);

    return workerManager;
}